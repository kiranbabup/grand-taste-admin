import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./sidebarcss.css";
import LsService from "../services/localstorage";
import { logoutUser } from "../services/authService";
import { Box, Typography } from "@mui/material";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const user = LsService.getCurrentUser();
  const userRole = user?.role || "";

  return (
    <>
      <div className="mobile-header">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}>
          {user?.role.toUpperCase()}
        </Typography>
        <div
          className="logo-container"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={logo}
            alt="Super Admin Logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
            <button className="close-sidebar" onClick={closeSidebar}>×</button>
          </Box>
          <h2>{userRole === "superadmin" ? "Super Admin" : userRole === "admin" ? "Admin" : "Supervisor"}</h2>
        </div>

        {["superadmin", "admin", "supervisor"].includes(userRole) && (
          <>
            <Link
              to="/dashboard"
              onClick={closeSidebar}
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </Link>
            <Link
              to="/orders"
              onClick={closeSidebar}
              className={location.pathname === "/orders" ? "active" : ""}
            >
              Orders
            </Link>
          </>
        )}

        {userRole === "superadmin" && (
          <Link
            to="/admins"
            onClick={closeSidebar}
            className={location.pathname === "/admins" ? "active" : ""}
          >
            Admins
          </Link>
        )}

        {["superadmin", "admin"].includes(userRole) && (
          <Link
            to="/supervisors"
            onClick={closeSidebar}
            className={location.pathname === "/supervisors" ? "active" : ""}
          >
            Supervisors
          </Link>
        )}

        {["superadmin", "admin", "supervisor"].includes(userRole) && (
          <>
            <Link
              to="/employees"
              onClick={closeSidebar}
              className={location.pathname === "/employees" ? "active" : ""}
            >
              Employees
            </Link>
            <Link
              to="/customers"
              onClick={closeSidebar}
              className={location.pathname === "/customers" ? "active" : ""}
            >
              Customers
            </Link>
          </>
        )}

        {userRole === "superadmin" && (
          <>
            <Link
              to="/products"
              onClick={closeSidebar}
              className={location.pathname === "/products" ? "active" : ""}
            >
              Products
            </Link>
            <Link
              to="/CreateProducts"
              onClick={closeSidebar}
              className={location.pathname === "/CreateProducts" ? "active" : ""}
            >
              Create Product
            </Link>
          </>
        )}

        <div
          style={{
            marginTop: "auto",
            padding: "20px",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <button
            className="logout"
            onClick={() => {
              logoutUser();
              navigate("/");
            }}
          >
            Sign Out
          </button>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "1px",
              color: "#999",
              marginLeft: "20px",
              marginBottom: "6px",
            }}
          >
            POWERED BY
          </div>

          <a
            href="https://www.invtechnologies.in/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1a73e8",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "15px",
              whiteSpace: "nowrap", // 👈 THIS prevents line break
            }}
          >
            INV Technologies
          </a>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
