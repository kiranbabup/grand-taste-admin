import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAllAdmins } from "../services/adminService";
import { updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins(currentPage);
  }, [currentPage]);

  const fetchAdmins = async (page) => {
    try {
      const data = await getAllAdmins(page);
      setAdmins(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch admins");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (window.confirm(`Are you sure you want to set this admin to ${newStatus}?`)) {
      try {
        await updateUserById(id, { status: newStatus });
        toast.success(`Admin status updated to ${newStatus}`);
        fetchAdmins(currentPage);
      } catch (error) {
        console.error("Error updating admin status:", error);
        toast.error("Failed to update status");
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "black", margin: 0 }}>Admins</h2>
        <button
          onClick={() => navigate("/register-admin")}
          style={{
            backgroundColor: "#6C5CE7",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          + Add Admin
        </button>
      </div>
      <UserTable
        users={admins}
        onToggleStatus={toggleUserStatus}
        type="admin"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Admins;