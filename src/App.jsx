import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LsService from "./services/localstorage";
import "./App.css";
import { getAllStaffByRole } from "./services/adminService";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import UserDetails from "./pages/UserDetails";
import RegisterAdmin from "./pages/RegisterAdmin";
import Staff from "./pages/Staff";
import CreateProduct from "./pages/CreateProduct";
import Products from "./pages/Products";
import EditProduct from "./pages/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import Orders from "./pages/Orders";
import WishlistTable from "./pages/superadminPages/WishlistTable";
import NotificationCenter from "./pages/NotificationCenter";
import PaymentsTable from "./pages/superadminPages/PaymentsTable";
import WithdrawRequests from "./pages/superadminPages/WithdrawRequests";

const ProtectedRoute = ({ children }) => {
  const user = LsService.getCurrentUser();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Login />} />

        {/* protected routes */}
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
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/admins" element={<Admins />} />
                        <Route path="/user/:userId" element={<UserDetails />} />
                        <Route path="/register-admin" element={<RegisterAdmin />} />

                        <Route path="/supervisors" element={<Staff functionalWord={getAllStaffByRole} roleWord="supervisor" />} />
                        <Route path="/employees" element={<Staff functionalWord={getAllStaffByRole} roleWord="employee" />} />
                        <Route path="/customers" element={<Staff functionalWord={getAllStaffByRole} roleWord="customer" />} />
                        <Route path="/CreateProducts" element={<CreateProduct />} />
                        <Route path="/edit-product/:id" element={<EditProduct />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:productId" element={<ProductDetails />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/customer-wishlist" element={<WishlistTable />} />
                        <Route path="/payments" element={<PaymentsTable />} />
                        <Route path="/withdraw-requests" element={<WithdrawRequests />} />
                        <Route path="/notifications" element={<NotificationCenter />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
