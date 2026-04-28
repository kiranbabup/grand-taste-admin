import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getUsersByRole, updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const fetchCustomers = async (page) => {
        try {
            setLoading(true);
            const data = await getUsersByRole("customer", page);
            setCustomers(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        if (window.confirm(`Are you sure you want to set this customer to ${newStatus}?`)) {
            try {
                await updateUserById(id, { status: newStatus });
                toast.success(`Customer status updated to ${newStatus}`);
                fetchCustomers(currentPage);
            } catch (error) {
                console.error("Error updating customer status:", error);
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="users-page">
            <h2 style={{ color: "black", marginBottom: "20px" }}>Customers</h2>
            {loading ? (
                <div style={{ color: "black", padding: "20px" }}>Loading customers...</div>
            ) : (
                <UserTable 
                    users={customers} 
                    onToggleStatus={toggleUserStatus} 
                    type="customer" 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Customers;
