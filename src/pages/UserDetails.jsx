import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import UserTable from "../components/UserTable";
import { updateUserById, getUserBySearch } from "../services/userService";
import { getDownlineMembers } from "../services/adminService";

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [downlineUsersData, setDownlineUsersData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            // 1. Fetch the user details using the search API (userId is the phone number)
            const searchData = await getUserBySearch(userId);
            let userDetails = null;
            if (searchData) {
                userDetails = searchData.users[0];
                setUserData(searchData.users[0])
                // console.log(searchData.users[0]);
            }
            if (!userDetails) {
                setError("User not found.");
                setLoading(false);
                return;
            }

            // 2. Fetch the referred users details using the user's referral code
            if (userDetails.referalcode) {
                try {
                    const downlineRes = await getDownlineMembers(userDetails.referalcode);
                    // console.log(downlineRes.users);

                    setDownlineUsersData(downlineRes);
                } catch (downlineErr) {
                    console.error("Error fetching downline members:", downlineErr);
                }
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setError("Failed to load user details.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
    if (!userData) return <div style={{ color: "black", padding: "20px" }}>User not found.</div>;

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
                    <div><strong>Name:</strong> {userData.name}</div>
                    <div><strong>Phone:</strong> {userData.phone}</div>
                    <div><strong>Role:</strong> <span style={{ textTransform: "capitalize" }}>{userData.role}</span></div>
                    <div><strong>Status:</strong> <span style={{ color: userData.status === 'active' ? 'green' : 'red' }}>{userData.status}</span></div>
                    {/* <div><strong>Earnings:</strong> ₹{userData.earnings || 0}</div> */}
                    <div><strong>Referral ID:</strong> {userData.referalcode}</div>
                    {/* <div><strong>Referred By:</strong> {userData.referedby || 'None'}</div> */}
                </div>
            </div>

            {userData.role === 'admin' && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Supervisors ({userData.directReferrals})</h3>
                    <UserTable users={downlineUsersData.users} onToggleStatus={toggleUserStatus} type="supervisor"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {userData.role === 'supervisor' && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Employees ({userData.directReferrals})</h3>
                    <UserTable users={downlineUsersData.users} onToggleStatus={toggleUserStatus} type="employee"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {userData.role === 'employee' && (
                <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ color: "black", marginBottom: "15px" }}>Referred Customers ({userData.directReferrals})</h3>
                    <UserTable users={downlineUsersData.users} onToggleStatus={toggleUserStatus} type="customer"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {!userData.directReferrals === 0 && (
                <div style={{ color: "black", fontStyle: "italic", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
                    This user has not referred anyone yet.
                </div>
            )}
        </div>
    );
};

export default UserDetails;
