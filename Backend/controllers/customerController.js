const { pool, poolConnect, sql } = require("../db");

// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        await poolConnect; // ensure connection established
        const result = await pool.request().query("SELECT * FROM Customers");
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error fetching customers:", err);
        res.status(500).send("Server error: " + err.message);
    }
};

// Get customer by POLICY_NUMBER
exports.getCustomerByPolicyNumber = async (req, res) => {
    try {
        await poolConnect;
        const result = await pool
            .request()
            .input("POLICY_NUMBER", sql.VarChar(50), req.params.policyNumber)
            .query("SELECT * FROM Customers WHERE POLICY_NUMBER = @POLICY_NUMBER");

        if (result.recordset.length === 0) {
            return res.status(404).send("Customer not found");
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("❌ Error fetching customer:", err);
        res.status(500).send("Server error: " + err.message);
    }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
    const {
        CUSTOMER_NAME,
        INSURANCE_COMPANY,
        SUB_CATEGORY,
        REGISTRATION_NO,
        VEHICLE_NAME,
        POLICY_NUMBER,
        START_DATE,
        END_DATE,
        PREMIUM,
        AGENCY,
        MOBILE_NO,
        MAIL_ID,
        REF_BY,
    } = req.body;

    try {
        await poolConnect;
        await pool
            .request()
            .input("CUSTOMER_NAME", sql.VarChar(100), CUSTOMER_NAME)
            .input("INSURANCE_COMPANY", sql.VarChar(100), INSURANCE_COMPANY)
            .input("SUB_CATEGORY", sql.VarChar(50), SUB_CATEGORY)
            .input("REGISTRATION_NO", sql.VarChar(50), REGISTRATION_NO)
            .input("VEHICLE_NAME", sql.VarChar(100), VEHICLE_NAME)
            .input("POLICY_NUMBER", sql.VarChar(50), POLICY_NUMBER)
            .input("START_DATE", sql.Date, START_DATE)
            .input("END_DATE", sql.Date, END_DATE)
            .input("PREMIUM", sql.Decimal(18, 2), PREMIUM)
            .input("AGENCY", sql.VarChar(100), AGENCY)
            .input("MOBILE_NO", sql.VarChar(20), MOBILE_NO)
            .input("MAIL_ID", sql.VarChar(100), MAIL_ID)
            .input("REF_BY", sql.VarChar(100), REF_BY)
            .query(`
        INSERT INTO Customers (
          CUSTOMER_NAME, INSURANCE_COMPANY, SUB_CATEGORY, REGISTRATION_NO,
          VEHICLE_NAME, POLICY_NUMBER, START_DATE, END_DATE, PREMIUM,
          AGENCY, MOBILE_NO, MAIL_ID, REF_BY
        ) VALUES (
          @CUSTOMER_NAME, @INSURANCE_COMPANY, @SUB_CATEGORY, @REGISTRATION_NO,
          @VEHICLE_NAME, @POLICY_NUMBER, @START_DATE, @END_DATE, @PREMIUM,
          @AGENCY, @MOBILE_NO, @MAIL_ID, @REF_BY
        )
      `);

        res.status(201).send("Customer created successfully");
    } catch (err) {
        console.error("❌ Error creating customer:", err);
        res.status(500).send("Server error: " + err.message);
    }
};

// Update customer
exports.updateCustomer = async (req, res) => {
    const {
        CUSTOMER_NAME,
        INSURANCE_COMPANY,
        SUB_CATEGORY,
        REGISTRATION_NO,
        VEHICLE_NAME,
        START_DATE,
        END_DATE,
        PREMIUM,
        AGENCY,
        MOBILE_NO,
        MAIL_ID,
        REF_BY,
    } = req.body;

    try {
        await poolConnect;
        await pool
            .request()
            .input("POLICY_NUMBER", sql.VarChar(50), req.params.policyNumber)
            .input("CUSTOMER_NAME", sql.VarChar(100), CUSTOMER_NAME)
            .input("INSURANCE_COMPANY", sql.VarChar(100), INSURANCE_COMPANY)
            .input("SUB_CATEGORY", sql.VarChar(50), SUB_CATEGORY)
            .input("REGISTRATION_NO", sql.VarChar(50), REGISTRATION_NO)
            .input("VEHICLE_NAME", sql.VarChar(100), VEHICLE_NAME)
            .input("START_DATE", sql.Date, START_DATE)
            .input("END_DATE", sql.Date, END_DATE)
            .input("PREMIUM", sql.Decimal(18, 2), PREMIUM)
            .input("AGENCY", sql.VarChar(100), AGENCY)
            .input("MOBILE_NO", sql.VarChar(20), MOBILE_NO)
            .input("MAIL_ID", sql.VarChar(100), MAIL_ID)
            .input("REF_BY", sql.VarChar(100), REF_BY)
            .query(`
        UPDATE Customers SET
          CUSTOMER_NAME = @CUSTOMER_NAME,
          INSURANCE_COMPANY = @INSURANCE_COMPANY,
          SUB_CATEGORY = @SUB_CATEGORY,
          REGISTRATION_NO = @REGISTRATION_NO,
          VEHICLE_NAME = @VEHICLE_NAME,
          START_DATE = @START_DATE,
          END_DATE = @END_DATE,
          PREMIUM = @PREMIUM,
          AGENCY = @AGENCY,
          MOBILE_NO = @MOBILE_NO,
          MAIL_ID = @MAIL_ID,
          REF_BY = @REF_BY
        WHERE POLICY_NUMBER = @POLICY_NUMBER
      `);

        res.send("Customer updated successfully");
    } catch (err) {
        console.error("❌ Error updating customer:", err);
        res.status(500).send("Server error: " + err.message);
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        await poolConnect;
        await pool
            .request()
            .input("POLICY_NUMBER", sql.VarChar(50), req.params.policyNumber)
            .query("DELETE FROM Customers WHERE POLICY_NUMBER = @POLICY_NUMBER");

        res.send("Customer deleted successfully");
    } catch (err) {
        console.error("❌ Error deleting customer:", err);
        res.status(500).send("Server error: " + err.message);
    }
};
exports.searchCustomers = async (req, res) => {
    try {
        await poolConnect;

        let query = "SELECT * FROM Customers WHERE 1=1";
        const request = pool.request();

        const filters = [
            "CUSTOMER_NAME",
            "INSURANCE_COMPANY",
            "SUB_CATEGORY",
            "REGISTRATION_NO",
            "VEHICLE_NAME",
            "POLICY_NUMBER",
            "START_DATE",
            "END_DATE",
            "PREMIUM",
            "AGENCY",
            "MOBILE_NO",
            "MAIL_ID",
            "REF_BY",
        ];

        filters.forEach((filter) => {
            if (req.query[filter]) {
                query += ` AND ${filter} = @${filter}`;
                request.input(filter, sql.VarChar, req.query[filter]);
            }
        });

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error searching customers:", err);
        res.status(500).send("Server error: " + err.message);
    }
};
exports.searchCustomers = async (req, res) => {
    try {
        await poolConnect;

        const queryParam = req.query.q;
        let query = `SELECT * FROM Customers WHERE 1=1`;

        if (queryParam) {
            const searchLike = `%${queryParam}%`;
            query += `
        AND (
          CUSTOMER_NAME LIKE @search
          OR INSURANCE_COMPANY LIKE @search
          OR SUB_CATEGORY LIKE @search
          OR REGISTRATION_NO LIKE @search
          OR VEHICLE_NAME LIKE @search
          OR POLICY_NUMBER LIKE @search
          OR AGENCY LIKE @search
          OR MOBILE_NO LIKE @search
          OR MAIL_ID LIKE @search
          OR REF_BY LIKE @search
        )
      `;

            const request = pool.request().input("search", sql.VarChar, searchLike);
            const result = await request.query(query);
            return res.json(result.recordset);
        }

        // fallback to full fetch
        const result = await pool.request().query("SELECT * FROM Customers");
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error searching customers:", err);
        res.status(500).send("Server error: " + err.message);
    }
};
