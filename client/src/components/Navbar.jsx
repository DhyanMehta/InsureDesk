import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3 px-4">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/home">
                    <img
                        src={logo}
                        alt="InsureDesk Logo"
                        style={{
                            width: '70px',
                            height: '70px',
                            marginRight: '15px',
                            objectFit: 'contain',
                        }}
                    />
                    <span className="fs-3 fw-bold">InsureDesk</span>
                </Link>

                <div className="d-flex align-items-center ms-auto">
                    {isLoggedIn ? (
                        <>
                            <Link
                                to="/profile"
                                className="btn btn-outline-light me-3 fw-semibold"
                                style={{
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <i className="bi bi-person-circle me-1"></i>
                                Profile
                            </Link>
                            <button
                                className="btn btn-light text-primary fw-semibold"
                                onClick={handleLogout}
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                <i className="bi bi-box-arrow-right me-1"></i>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="btn btn-outline-light me-2 fw-semibold"
                                style={{
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="btn btn-light fw-semibold text-primary"
                                style={{
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
