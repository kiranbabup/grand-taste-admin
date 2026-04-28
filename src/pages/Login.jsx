import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Login.css";
import foodIllustration from "../assets/premium_food_admin_bg.png";
import { login } from "../services/authService";

const Login = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
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
            const data = await login(formData);
            toast.success("Logged in successfully!");
            
            // Redirect based on role
            if (data.role === "admin" || data.role === "superadmin") {
                navigate("/super-admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            toast.error(error.message || "Invalid phone or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-wrapper"
            style={{
                backgroundImage: `url(${foodIllustration})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}
        >
            <div className="wrapper-overlay"></div>

            {/* LEFT SIDE */}
            <div className="login-left">
                <div className="left-content">
                    <h1>Manage Your Food Empire</h1>
                    <p>
                        Powerful analytics, real-time order tracking, and seamless hierarchy management for your single-vendor platform.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="login-right">
                <div className="login-card">
                    <h2>Welcome Back</h2>
                    <span className="subtitle">Please enter your details to sign in</span>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="e.g. 9876543210"
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
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <IconButton
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;