import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Chip,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus } from "../services/adminService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData && userData !== "undefined") {
      try {
        const user = JSON.parse(userData);
        if (user) {
          setUserRole(user.role);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(page + 1, rowsPerPage);
      setOrders(data.orders || []);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      toast.success(`Order status updated to ${nextStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", "");
  };

  const renderStatusButtons = (order) => {
    const status = order.status;
    const id = order.id;

    switch (status) {
      case "Pending":
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(id, "Accepted");
              }}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Accept Order
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(id, "Rejected");
              }}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Reject Order
            </Button>
          </Box>
        );
      case "Accepted":
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusUpdate(id, "Shipped");
            }}
            sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#2563eb" }}
          >
            Shipped
          </Button>
        );
      case "Shipped":
        return (
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusUpdate(id, "Out for Delivery");
            }}
            sx={{ 
              textTransform: "none", 
              borderRadius: "8px", 
              bgcolor: "#f59e0b",
              "&:hover": { bgcolor: "#d97706" }
            }}
          >
            Out for Delivery
          </Button>
        );
      case "Out for Delivery":
        return (
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusUpdate(id, "Delivered");
            }}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Delivered
          </Button>
        );
      case "Delivered":
        return (
          <Typography sx={{ color: "#16a34a", fontWeight: "600", fontSize: "0.875rem" }}>
            Delivered
          </Typography>
        );
      case "Rejected":
        return (
          <Typography sx={{ color: "#dc2626", fontWeight: "600", fontSize: "0.875rem" }}>
            Rejected
          </Typography>
        );
      default:
        return (
          <Chip label={status} size="small" variant="outlined" />
        );
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "700", color: "#1e293b" }}>
        Orders
      </Typography>

      {/* Table Header Wrapper */}
      <Box sx={{ 
        display: "flex", 
        bgcolor: "#0f766e", 
        color: "white", 
        p: 2, 
        borderRadius: "8px 8px 0 0",
        fontWeight: "600",
        textAlign: "center",
        alignItems: "center"
      }}>
        <Box sx={{ width: "48px" }} /> {/* Spacer for Expand Icon */}
        <Box sx={{ flex: 0.5 }}>S No</Box>
        <Box sx={{ flex: 1 }}>Invoice No</Box>
        <Box sx={{ flex: 2 }}>Order Date</Box>
        <Box sx={{ flex: 1 }}>Payment Type</Box>
        <Box sx={{ flex: 1 }}>GST</Box>
        <Box sx={{ flex: 1 }}>Total</Box>
        <Box sx={{ flex: 1 }}>Payment Status</Box>
        <Box sx={{ flex: 2 }}>Action</Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress color="inherit" sx={{ color: "#0f766e" }} />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: "0 0 8px 8px" }}>
          <Typography color="textSecondary">No orders found.</Typography>
        </Paper>
      ) : (
        <Box sx={{ borderRadius: "0 0 8px 8px", overflow: "hidden", border: "1px solid #e2e8f0", borderTop: "none" }}>
          {orders.map((order, index) => (
            <Accordion key={order.id} sx={{ 
              boxShadow: "none", 
              borderBottom: "1px solid #e2e8f0",
              "&:before": { display: "none" },
              "&.Mui-expanded": { margin: 0 }
            }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                component="div"
                sx={{ 
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(180deg)",
                  },
                  "& .MuiAccordionSummary-content": { 
                    display: "flex", 
                    alignItems: "center", 
                    textAlign: "center",
                    margin: "12px 0",
                    ml: 1
                  },
                  px: 2
                }}
              >
                <Box sx={{ flex: 0.5 }}>{page * rowsPerPage + index + 1}</Box>
                <Box sx={{ flex: 1 }}>{order.orderId}</Box>
                <Box sx={{ flex: 2 }}>{formatDate(order.createdAt)}</Box>
                <Box sx={{ flex: 1 }}>{order.paymentMethod === "Cash on Delivery" ? "cash" : order.paymentMethod}</Box>
                <Box sx={{ flex: 1 }}>₹{(order.totalPrice * 0.05).toFixed(2)}</Box>
                <Box sx={{ flex: 1, fontWeight: "600" }}>₹{Number(order.totalPrice).toFixed(2)}</Box>
                <Box sx={{ flex: 1 }}>{order.isPaid ? "Paid" : "Pending"}</Box>
                <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
                  {renderStatusButtons(order)}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "#f1f5f9", p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "700", mb: 2, color: "#334155" }}>
                  Cart Items
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: "none", borderRadius: "8px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#2dd4bf" }}>
                        <TableCell sx={{ color: "white", fontWeight: "700" }}>Product Name</TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "700" }}>Qty</TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "700" }}>Item Price</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "700" }}>Item Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems?.map((item) => (
                        <TableRow key={item.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ color: "#475569" }}>{item.productname}</TableCell>
                          <TableCell align="center" sx={{ color: "#475569" }}>{item.qty}</TableCell>
                          <TableCell align="center" sx={{ color: "#475569" }}>{item.price}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: "600", color: "#475569" }}>
                            ₹{(item.qty * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.875rem" }}>
                  <Box>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: "700" }}>Name</Typography>
                      <Typography variant="body2">
                        {order.User?.name || 'N/A'
                        }
                      </Typography>
                   </Box>
                   <Box>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: "700" }}>Shipping Address</Typography>
                      <Typography variant="body2">
                        {order.shippingAddress 
                          ? `Dr_no: ${order.shippingAddress.h_no}, Street: ${order.shippingAddress.street}, Address: ${order.shippingAddress.address}, Landmark: ${order.shippingAddress.landmark}, City: ${order.shippingAddress.city}, State: ${order.shippingAddress.state}, Pin Code: ${order.shippingAddress.pincode}`
                          : 'N/A'
                        }
                      </Typography>
                   </Box>
                   <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: "700" }}>Contact</Typography>
                      <Typography variant="body2">{order.phone}</Typography>
                   </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, border: "none" }}
      />
    </Box>
  );
};

export default Orders;
