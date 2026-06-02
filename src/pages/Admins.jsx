import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAllAdmins } from "../services/adminService";
import { updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";
import { FormControl, Select, MenuItem } from "@mui/material";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const fetchAdmins = async (page, limit) => {
    try {
      const data = await getAllAdmins(page, limit);
      setAdmins(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch admins");
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to set this admin to ${newStatus}?`)
    ) {
      try {
        await updateUserById(id, { status: newStatus });
        toast.success(`Admin status updated to ${newStatus}`);
        fetchAdmins(currentPage, rowsPerPage);
      } catch (error) {
        console.error("Error updating admin status:", error);
        toast.error("Failed to update status");
      }
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
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
            fontWeight: "600",
          }}
        >
          + Add Admin
        </button>

        <FormControl size="small" style={{ marginBottom: "10px" }}>
          <Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </div>
      <UserTable
        users={admins}
        onToggleStatus={toggleUserStatus}
        type="admin"
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Admins;
