import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllEmployees } from "../services/adminService";
import { updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchEmployees(currentPage);
    }, [currentPage]);

    const fetchEmployees = async (page) => {
        try {
            const data = await getAllEmployees(page);
            setEmployees(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error("Failed to fetch employees");
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        if (window.confirm(`Are you sure you want to set this employee to ${newStatus}?`)) {
            try {
                await updateUserById(id, { status: newStatus });
                toast.success(`Employee status updated to ${newStatus}`);
                fetchEmployees(currentPage);
            } catch (error) {
                console.error("Error updating employee status:", error);
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="users-page">
            <h2 style={{ color: "black" }}>Employees</h2>
            <UserTable 
                users={employees} 
                onToggleStatus={toggleUserStatus} 
                type="employee" 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default Employees;
