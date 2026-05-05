import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";

const Staff = ({ functionalWord, roleWord }) => {
    const [staff, setStaff] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff(currentPage);
    }, [currentPage, roleWord, functionalWord]);

    const fetchStaff = async (page) => {
        try {
            setLoading(true);
            const data = await functionalWord(roleWord, page);
            setStaff(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error(`Failed to fetch ${roleWord}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        if (window.confirm(`Are you sure you want to set this ${roleWord} to ${newStatus}?`)) {
            try {
                setLoading(true);
                await updateUserById(id, { status: newStatus });
                toast.success(`${roleWord} status updated to ${newStatus}`);
                fetchStaff(currentPage);
            } catch (error) {
                console.error(`Error updating ${roleWord} status:`, error);
                toast.error("Failed to update status");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="users-page">
            <h2 style={{ color: "black", textTransform: "uppercase" }}>{roleWord}s</h2>
            {loading ? (
                <div style={{ color: "black", padding: "20px" }}>Loading customers...</div>
            ) : (
                <UserTable
                    users={staff}
                    onToggleStatus={toggleUserStatus}
                    type={roleWord}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default Staff;
