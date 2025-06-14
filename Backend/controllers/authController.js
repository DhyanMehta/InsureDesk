const { pool, poolConnect, sql } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Signup
exports.signup = async (req, res) => {
    const { name, email, password, agent_id } = req.body;

    if (!name || !email || !password || !agent_id) {
        return res.status(400).send("All fields are required.");
    }

    try {
        await poolConnect;

        const existingUser = await pool.request()
            .input("email", sql.VarChar(100), email)
            .input("agent_id", sql.VarChar(50), agent_id)
            .query("SELECT * FROM users WHERE email = @email OR agent_id = @agent_id");

        if (existingUser.recordset.length > 0) {
            return res.status(400).send("Email or Agent ID already taken.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input("name", sql.VarChar(150), name)
            .input("email", sql.VarChar(100), email)
            .input("agent_id", sql.VarChar(50), agent_id)
            .input("password_hash", sql.VarChar(255), hashedPassword)
            .query(`
                INSERT INTO users (name, email, agent_id, password_hash)
                VALUES (@name, @email, @agent_id, @password_hash)
            `);

        res.status(201).send("User registered successfully.");
    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).send(err.message || "Internal server error.");
    }
};

// Login
exports.login = async (req, res) => {
    const { agent_id, password } = req.body;
    if (!agent_id || !password) {
        return res.status(400).send("Agent ID and password are required");
    }

    try {
        await poolConnect;

        const result = await pool.request()
            .input("agent_id", sql.VarChar(50), agent_id)
            .query("SELECT * FROM users WHERE agent_id = @agent_id");

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).send("Invalid agent ID or password");
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).send("Invalid agent ID or password");
        }

        const token = jwt.sign(
            { id: user.id, agent_id: user.agent_id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).send("Server error");
    }
};

// Middleware
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).send("Access denied");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid token");
        req.user = user;
        next();
    });
};

// Profile
exports.getProfile = async (req, res) => {
    try {
        await poolConnect;

        const result = await pool.request()
            .input("id", sql.Int, req.user.id)
            .query("SELECT name, email, agent_id FROM users WHERE id = @id");

        if (result.recordset.length === 0) {
            return res.status(404).send("User not found");
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("❌ Profile fetch error:", err);
        res.status(500).send("Server error");
    }
};
