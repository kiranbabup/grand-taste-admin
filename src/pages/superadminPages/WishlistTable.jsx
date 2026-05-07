import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { InfoOutlined, ShoppingBagOutlined, PersonOutline } from "@mui/icons-material";
import API from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const WishlistTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const navigate = useNavigate();
  
  const fetchWishlistDetails = async (currentPage) => {
    try {
      setLoading(true);
      const response = await API.get(`/wishlist/getWishlistDetails?page=${currentPage}&limit=${limit}`);
      setData(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching wishlist details:", error);
      toast.error("Failed to fetch wishlist data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistDetails(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a237e", mb: 1 }}>
            Wishlist Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tracking customer interest for out-of-stock products
          </Typography>
        </Box>
        <Chip
          label={`Total: ${totalItems} Items`}
          color="primary"
          variant="filled"
          sx={{ fontWeight: "bold", px: 1 }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
            <CircularProgress thickness={4} size={50} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">Loading wishlist records...</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f0f2f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutline fontSize="small" /> Customer Details
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Contact Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ShoppingBagOutlined fontSize="small" /> Product Name
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Selling Price (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, py: 2 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: "0.2s", '&:hover': { bgcolor: "rgba(26, 35, 126, 0.02)" } }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#2c3e50" }}>{item.userName}</TableCell>
                      <TableCell>{item.userPhone}</TableCell>
                      <TableCell sx={{ color: "#34495e" }}>{item.productName}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#e67e22" }}>
                        ₹{parseFloat(item.sellingPrice).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Out of Stock"
                          color="error"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "#fff5f5",
                            color: "#c0392b",
                            border: "1px solid #feb2b2"
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <InfoOutlined fontSize="small" onClick={() => navigate(`/edit-product/${item.productId}`)} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <ShoppingBagOutlined sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6">No records found</Typography>
                        <Typography variant="body2">There are currently no wishlist items with zero stock.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3, bgcolor: "#fff" }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </TableContainer>
    </Box>
  );
};

export default WishlistTable;
