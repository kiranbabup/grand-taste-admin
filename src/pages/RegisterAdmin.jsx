import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register } from "../services/authService";
import "./RegisterAdmin.css";

const RegisterAdmin = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        referedby: "superadmin", // Hardcoded for Admin registration
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
            toast.success("Admin registered successfully!");
            navigate("/admins");
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.message || "Failed to register admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-admin-container">
            <div className="register-card">
                <h2>Register New Admin</h2>
                <p className="subtitle">Fill in the details to create a new administrator account</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <IconButton
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Registering..." : "Register Admin"}
                    </button>
                    
                    <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => navigate("/admins")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterAdmin;
