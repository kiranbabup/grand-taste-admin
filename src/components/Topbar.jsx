import React from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
    const navigate = useNavigate();

    return (
        <div className="topbar">

            <div
                className="logo-container"
                onClick={() => navigate("/super-admin")}
                style={{ cursor: "pointer" }}
            >
                <img src={logo} alt="Super Admin Logo" style={{ height: "50px", objectFit: "contain" }} />
            </div>

            <div className="profile" style={{ marginRight: "30px" }}>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/";
                    }}
                    style={{
                        padding: "8px 16px",
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.background = "#fca5a5"}
                    onMouseOut={(e) => e.target.style.background = "#fee2e2"}
                >
                    Sign Out
                </button>
            </div>

        </div>
    );
};

export default Topbar;
