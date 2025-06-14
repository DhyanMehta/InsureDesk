import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaEnvelope, FaIdBadge, FaLock } from 'react-icons/fa';

function Signup() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        agent_id: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await API.post('/auth/signup', form);
            setSuccess(res.data || 'Signup successful!');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data || err.message || 'Signup failed.');
        }
    };

    return (
        <div className="container-fluid bg-light d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-5 shadow-lg rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 className="text-center text-primary mb-4">Create Your Account</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-white"><FaUser /></span>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter your name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-white"><FaEnvelope /></span>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Agent ID</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-white"><FaIdBadge /></span>
                            <input
                                type="text"
                                name="agent_id"
                                className="form-control"
                                placeholder="Enter your Agent ID"
                                value={form.agent_id}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-white"><FaLock /></span>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Create a password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 fw-semibold py-2">
                        Sign Up
                    </button>

                    <div className="text-center mt-3">
                        Already have an account?{' '}
                        <a href="/login" className="text-decoration-none fw-semibold text-primary">
                            Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
