import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import Products from "./pages/Products";
import EditProduct from "./pages/EditProduct";
import Admins from "./pages/Admins";
import Supervisors from "./pages/Supervisors";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import RegisterAdmin from "./pages/RegisterAdmin";
import Login from "./pages/Login";
import UserDetails from "./pages/UserDetails";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-wrapper">
                <Topbar />
                <div className="container">
                  <Sidebar />
                  <div className="main">
                    <div className="content">
                      <Routes>
                        <Route path="/super-admin" element={<Dashboard />} />
                        <Route path="/register-admin" element={<RegisterAdmin />} />
                        <Route path="/admins" element={<Admins />} />
                        <Route path="/user/:userId" element={<UserDetails />} />
                        <Route path="/supervisors" element={<Supervisors />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/edit-product/:id" element={<EditProduct />} />
                        <Route path="/CreateProducts" element={<CreateProduct />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;