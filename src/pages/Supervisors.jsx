import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllSupervisors } from "../services/adminService";
import { updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";
import { useNavigate } from "react-router-dom";

const Supervisors = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSupervisors(currentPage);
    }, [currentPage]);

    const fetchSupervisors = async (page) => {
        try {
            const data = await getAllSupervisors(page);
            setSupervisors(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error("Failed to fetch supervisors");
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        if (window.confirm(`Are you sure you want to set this supervisor to ${newStatus}?`)) {
            try {
                await updateUserById(id, { status: newStatus });
                toast.success(`Supervisor status updated to ${newStatus}`);
                fetchSupervisors(currentPage);
            } catch (error) {
                console.error("Error updating supervisor status:", error);
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="users-page">
            <h2 style={{ color: "black" }}>Supervisors</h2>
            <UserTable
                users={supervisors}
                onToggleStatus={toggleUserStatus}
                type="supervisor"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default Supervisors;
