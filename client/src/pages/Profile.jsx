import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/auth/profile")
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/");
            });
    }, [navigate]);

    if (!user) return <div className="container mt-5">Loading...</div>;

    return (
        <div className="container mt-5">
            <h2>Profile</h2>
            <ul className="list-group mt-3">
                <li className="list-group-item"><strong>Name:</strong> {user.name}</li>
                <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
                <li className="list-group-item"><strong>Agent ID:</strong> {user.agent_id}</li>
            </ul>
        </div>
    );
}

export default Profile;
