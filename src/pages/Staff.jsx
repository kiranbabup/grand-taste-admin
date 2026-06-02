import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getUserBySearch, updateUserById } from "../services/userService";
import UserTable from "../components/UserTable";
import { FormControl, Select, MenuItem, Box, Button } from "@mui/material";

const Staff = ({ functionalWord, roleWord }) => {
  const [staff, setStaff] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userRole, setUserRole] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleRowsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setRowsPerPage(newLimit);
    setCurrentPage(1);
  };

  const fetchStaff = async (page = 1, limit = rowsPerPage) => {
    setLoading(true);
    try {
      const data = isSearching && searchText
        ? await getUserBySearch(searchText.trim(), page, limit, roleWord)
        : await functionalWord(roleWord, page, limit);

      setStaff(data.users || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(`Failed to fetch ${roleWord}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage, roleWord, functionalWord, isSearching]);

  const handlePageChange = (page) => setCurrentPage(page);

  const toggleUserStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to set this ${roleWord} to ${newStatus}?`,
      )
    ) {
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

  const handleSearch = async () => {
    const trimmedSearch = searchText.trim();
    if (!trimmedSearch) {
      setIsSearching(false);
      setCurrentPage(1);
      fetchStaff(1, rowsPerPage);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    setCurrentPage(1);

    try {
      const data = await getUserBySearch(trimmedSearch, 1, rowsPerPage, roleWord);
      setStaff(data.users || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <h2 style={{ color: "black", textTransform: "uppercase" }}>
          {roleWord}s
        </h2>

        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            type="text"
            placeholder="Search by phone, name, referral code..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              outline: "none",
              width: "250px",
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              bgcolor: "#0f766e",
              "&:hover": { bgcolor: "#0d645d" },
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Search
          </Button>
          {isSearching && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchText("");
                setIsSearching(false);
                setCurrentPage(1);
                fetchStaff(1, rowsPerPage);
              }}
              sx={{
                color: "#0f766e",
                borderColor: "#0f766e",
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        <FormControl size="small" style={{ marginBottom: "10px" }}>
          <Select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <div style={{ color: "black", padding: "20px" }}>
          Loading customers...
        </div>
      ) : (
        <UserTable
          users={staff}
          onToggleStatus={toggleUserStatus}
          type={roleWord}
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Staff;
