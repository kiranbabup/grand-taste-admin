import { useNavigate } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const UserTable = ({ users, onToggleStatus, type, totalPages = 1, currentPage = 1, onPageChange }) => {
  const navigate = useNavigate();

  const getReferralLabel = () => {
    if (type === "admin") return "Supervisors";
    if (type === "supervisor") return "Employees";
    if (type === "employee") return "Customers";
    return "Refers";
  };

  const handleViewClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="user-table" style={{ width: "100%", borderCollapse: "collapse", color: "black" }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "left" }}>Sno</th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "left" }}>Phone</th>
              <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "left" }}>Status</th>
              {type !== "customer" && <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "center" }}>Earnings</th>}
              {type !== "customer" && <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "center" }}>{getReferralLabel()}</th>}
              <th style={{ backgroundColor: "#6C5CE7", color: "white", padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id || user.user_id}
                style={{ 
                    borderBottom: "1px solid #eee",
                    transition: "background-color 0.2s" 
                }}
              >
                <td style={{ padding: "12px" }}>{(currentPage - 1) * 10 + index + 1}</td>
                <td style={{ padding: "12px" }}>{user.name}</td>
                <td style={{ padding: "12px" }}>{user.phone}</td>
                <td style={{ padding: "12px" }}>
                  <span className={`status-badge ${user.status}`} style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      textTransform: "capitalize",
                      backgroundColor: user.status === 'active' ? "#e6f8f4" : "#feeaea",
                      color: user.status === 'active' ? "#00b894" : "#e74c3c"
                  }}>
                    {user.status || 'active'}
                  </span>
                </td>
                {type !== "customer" && <td style={{ padding: "12px", textAlign: "center" }}>₹{user.earnings || 0}</td>}
                {type !== "customer" && <td style={{ padding: "12px", textAlign: "center" }}>{user.directReferrals}</td>}
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <div className="action-buttons" style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    {type !== "customer" && (
                        <IconButton 
                            size="small" 
                            onClick={() => handleViewClick(user.phone)}
                            style={{ color: "#6C5CE7" }}
                            title="View Details"
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    )}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onToggleStatus(user.id || user.user_id, user.status || 'active'); 
                      }} 
                      style={{ 
                        color: "white", 
                        backgroundColor: user.status === 'inactive' ? "#2ecc71" : "#e74c3c",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        minWidth: "70px"
                      }}
                    >
                      {user.status === 'inactive' ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px", gap: "15px" }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "8px", 
              border: "1px solid #dfe6e9", 
              backgroundColor: currentPage === 1 ? "#f5f6fa" : "white",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              color: "black"
            }}
          >
            Previous
          </button>
          
          <span style={{ color: "#2d3436", fontWeight: "500" }}>
            Page {currentPage} of {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "8px", 
              border: "1px solid #dfe6e9", 
              backgroundColor: currentPage === totalPages ? "#f5f6fa" : "white",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              color: "black"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserTable;