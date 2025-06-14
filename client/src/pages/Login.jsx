import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock } from "react-icons/fa";
import API from "../utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function Login() {
    const [agentID, setAgentID] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Load stored credentials if available
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedID = localStorage.getItem("rememberedAgentID");
        const savedPass = localStorage.getItem("rememberedPassword");

        if (token) {
            navigate("/home");
        }

        if (savedID && savedPass) {
            setAgentID(savedID);
            setPassword(savedPass);
            setRememberMe(true);
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/auth/login", {
                agent_id: agentID,
                password,
            });

            localStorage.setItem("token", response.data.token);

            if (rememberMe) {
                localStorage.setItem("rememberedAgentID", agentID);
                localStorage.setItem("rememberedPassword", password);
            } else {
                localStorage.removeItem("rememberedAgentID");
                localStorage.removeItem("rememberedPassword");
            }

            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
            <div className="card shadow p-4 rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-primary">Agent Login</h3>
                    <p className="text-muted small">Secure access to your dashboard</p>
                </div>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group mb-3">
                        <label className="form-label fw-semibold">
                            <FaUserShield className="me-2" />
                            Agent ID
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-lg rounded-3"
                            value={agentID}
                            onChange={(e) => setAgentID(e.target.value)}
                            placeholder="Enter your Agent ID"
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label fw-semibold">
                            <FaLock className="me-2" />
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control form-control-lg rounded-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember" className="form-check-label">Remember me</label>
                        </div>
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none text-primary"
                            onClick={() => alert("Forgot password functionality coming soon!")}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                        Log In
                    </button>

                    <p className="text-center mt-3 mb-0 text-muted">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
