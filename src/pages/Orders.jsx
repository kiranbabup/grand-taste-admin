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
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import toast from "react-hot-toast";
import { getAllOrders, searchByPhone, staffUpdateOrderStatus, superadminUpdateOrderStatus } from "../services/orderApis";
import { Visibility } from "@mui/icons-material";
import OrderDetails from "./OrderDetails";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);



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
    if (isSearching && searchPhone) {
      handleSearch();
      return;
    }
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

  const handleSearch = async () => {
    if (!searchPhone) {
      setIsSearching(false);
      setPage(0);
      fetchOrders();
      return;
    }
    setLoading(true);
    setIsSearching(true);
    try {
      const data = await searchByPhone(searchPhone);
      // Search API returns an array directly or { orders: [] }
      const ordersArray = Array.isArray(data) ? data : (data.orders || []);
      setOrders(ordersArray);
      setTotalItems(ordersArray.length);
      setPage(0);
    } catch (error) {
      console.error("Error searching orders:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      const superadminStatuses = ["Return - Initiated", "Return - Rejected", "Returned & Refunded"];

      if (superadminStatuses.includes(nextStatus)) {
        if (userRole !== "superadmin") {
          toast.error("Only Superadmin can perform this action");
          return;
        }
        await superadminUpdateOrderStatus(orderId, nextStatus);
      } else {
        await staffUpdateOrderStatus(orderId, nextStatus);
      }

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

  const getStatusColor = (status) => {
    const blue = ["Pending", "Shipped", "Cancel Request", "Return Request", "Return - Approved"];
    const orange = ["Accepted", "Out for Delivery", "Return - Initiated"];
    const red = ["Rejected", "Cancelled", "Return - Rejected"];
    const green = ["Delivered", "Returned & Refunded"];

    if (blue.includes(status)) return "#2563eb"; // Blue
    if (orange.includes(status)) return "#f59e0b"; // Orange
    if (red.includes(status)) return "#dc2626"; // Red
    if (green.includes(status)) return "#16a34a"; // Green
    return "#64748b";
  };

  const renderStatusButtons = (order) => {
    const status = order.status;
    const id = order.id;

    const ActionButton = ({ label, nextStatus, buttonColor, sx = {} }) => (
      <Button
        variant="contained"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleStatusUpdate(id, nextStatus);
        }}
        sx={{
          textTransform: "none",
          borderRadius: "6px",
          fontSize: "0.75rem",
          fontWeight: "600",
          px: 1.5,
          bgcolor: buttonColor,
          "&:hover": { bgcolor: buttonColor, opacity: 0.9 },
          ...sx
        }}
      >
        {label}
      </Button>
    );

    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Chip
          label={status}
          size="small"
          sx={{
            bgcolor: getStatusColor(status),
            color: "white",
            fontWeight: "700",
            fontSize: "0.7rem",
            mb: 0.5
          }}
        />

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "center" }}>
          {status === "Pending" && (
            <>
              {/* Added Accept button as it's implied for the Accepted state to exist */}
              <ActionButton label="Accept" nextStatus="Accepted" buttonColor="#16a34a" />
              <ActionButton label="Reject" nextStatus="Rejected" buttonColor="#dc2626" />
            </>
          )}

          {status === "Accepted" && (
            <>
              <ActionButton label="Shipped" nextStatus="Shipped" buttonColor="#2563eb" />
              <ActionButton label="Reject" nextStatus="Rejected" buttonColor="#dc2626" />
            </>
          )}

          {status === "Cancel Request" && (
            <ActionButton label="Cancelled" nextStatus="Cancelled" buttonColor="#dc2626" />
          )}

          {status === "Return Request" && userRole === "superadmin" && (
            <>
              <ActionButton label="Return - Initiated" nextStatus="Return - Initiated" buttonColor="#f59e0b" />
              <ActionButton label="Return - Rejected" nextStatus="Return - Rejected" buttonColor="#dc2626" />
            </>
          )}

          {status === "Return - Approved" && userRole === "superadmin" && (
            <ActionButton label="Returned & Refunded" nextStatus="Returned & Refunded" buttonColor="#16a34a" />
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "700", color: "#1e293b" }}>
          Orders Management
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              outline: "none",
              width: "250px"
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d645d" }, borderRadius: "8px", textTransform: "none" }}
          >
            Search
          </Button>
          {isSearching && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchPhone("");
                setIsSearching(false);
                setPage(0);
                fetchOrders();
              }}
              sx={{ color: "#0f766e", borderColor: "#0f766e", borderRadius: "8px", textTransform: "none" }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

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
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrderId(order.id);
                      setOrderModalOpen(true);
                    }}
                    style={{ color: "#6C5CE7" }}
                    title="View Details"
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
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
                        <TableCell align="center" sx={{ color: "white", fontWeight: "700" }}>Item Price</TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "700" }}>Item Sell Price</TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "700" }}>Qty</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "700" }}>Item Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems?.map((item) => (
                        <TableRow key={item.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ color: "#475569" }}>{item.productname}</TableCell>
                          <TableCell align="center" sx={{ color: "#475569" }}>{item.productprice}</TableCell>
                          <TableCell align="center" sx={{ color: "#475569" }}>{item.sellingPrice}</TableCell>
                          <TableCell align="center" sx={{ color: "#475569" }}>{item.qty}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: "600", color: "#475569" }}>
                            ₹{(item.qty * item.sellingPrice).toFixed(2)}
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
      <OrderDetails 
        orderId={selectedOrderId} 
        open={orderModalOpen} 
        onClose={() => {
          setOrderModalOpen(false);
          setSelectedOrderId(null);
        }} 
      />
    </Box>
  );
};

export default Orders;
