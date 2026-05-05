import React from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import { Typography } from "@mui/material";
import LsService from "../services/localstorage";

const Topbar = () => {
    const navigate = useNavigate();
    const user = LsService.getCurrentUser();

    return (
        <div className="topbar">

            <div
                className="logo-container"
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
            >
                <img src={logo} alt="Logo" style={{ height: "50px", objectFit: "contain" }} />
            </div>
            <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}>
                {user?.role.toUpperCase()}
            </Typography>
            <div className="profile" style={{ marginRight: "30px" }}>
                <button
                    onClick={() => {
                        logoutUser();
                        navigate("/");
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
