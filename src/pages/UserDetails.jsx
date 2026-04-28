import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import UserTable from "../components/UserTable";
import { updateUserById } from "../services/userService";

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/admin/get-my-details/${userId}`);
            // res.data is { success: true, user: ..., supervisors: ..., ... }
            if (res.data.success) {
                setUserData(res.data);
                setError(null);
            } else {
                setError(res.data.message || "User not found.");
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
            setError("Failed to load user details.");
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        if (window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) {
            try {
                await updateUserById(id, { status: newStatus });
                toast.success(`User status updated to ${newStatus}`);
                fetchUserDetails(); // Refresh data after update
            } catch (err) {
                console.error("Error updating user status:", err);
                toast.error("Failed to update status.");
            }
        }
    };

    if (loading) return <div style={{ color: "black", padding: "20px" }}>Loading user details...</div>;
    if (error) return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
    if (!userData || !userData.user) return <div style={{ color: "black", padding: "20px" }}>User not found.</div>;

    const { user, supervisors, employees, customers } = userData;

    return (
        <div style={{ padding: "20px" }}>
            <button
                onClick={() => navigate(-1)}
                style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer", backgroundColor: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}
            >
                ← Back
            </button>

            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "30px", color: "black" }}>
                <h2 style={{ marginTop: 0, marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>User Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Phone:</strong> {user.phone}</div>
                    <div><strong>Role:</strong> <span style={{ textTransform: "capitalize" }}>{user.role}</span></div>
                    <div><strong>Status:</strong> <span style={{ color: user.status === 'active' ? 'green' : 'red' }}>{user.status}</span></div>
                    <div><strong>Earnings:</strong> ₹{user.earnings || 0}</div>
                    <div><strong>Referral ID:</strong> {user.referalcode}</div>
                    <div><strong>Referred By:</strong> {user.referedby || 'None'}</div>
                </div>
            </div>

            {user.role === 'admin' && supervisors && supervisors.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Supervisors</h3>
                    <UserTable users={supervisors} onToggleStatus={toggleUserStatus} type="supervisor" />
                </div>
            )}

            {(user.role === 'admin' || user.role === 'supervisor') && employees && employees.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Employees</h3>
                    <UserTable users={employees} onToggleStatus={toggleUserStatus} type="employee" />
                </div>
            )}

            {(user.role === 'admin' || user.role === 'supervisor' || user.role === 'employee') && customers && customers.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Customers</h3>
                    <UserTable users={customers} onToggleStatus={toggleUserStatus} type="customer" />
                </div>
            )}

            {!supervisors?.length && !employees?.length && !customers?.length && (
                <div style={{ color: "black", fontStyle: "italic", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
                    This user has not referred anyone yet.
                </div>
            )}
        </div>
    );
};

export default UserDetails;
