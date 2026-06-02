import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import API from "../services/api";
import LsService from "../services/localstorage";
import {
  formatDate,
  generateReceipt,
  handlePrint,
} from "../components/cashFunctions";
import billIcon from "../assets/grandtasteLogo.jpeg";

const poweredBy = "KASI NATH FOODS";
const gstNumber = "37AOSPA7825F2ZP";
const companyName = "Grand Taste";

const OrderDetails = ({ orderId, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [billIconBase64, setBillIconBase64] = useState("");

  const user = LsService.getCurrentUser();
  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  useEffect(() => {
    fetch(billIcon)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setBillIconBase64(reader.result);
        reader.readAsDataURL(blob);
      });
  }, []);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      setError("");
      const response = await API.get(`/orders/getOrderById/${orderId}`);
      if (response.data) {
        console.log(response.data);
        setOrderData(response.data);
      } else {
        setError("Order data not found.");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const blue = [
      "Pending",
      "Shipped",
      "Cancel Request",
      "Return Request",
      "Return - Approved",
    ];
    const orange = ["Accepted", "Out for Delivery", "Return - Initiated"];
    const red = ["Rejected", "Cancelled", "Return - Rejected"];
    const green = ["Delivered", "Returned & Refunded"];

    if (blue.includes(status)) return "#2563eb";
    if (orange.includes(status)) return "#f59e0b";
    if (red.includes(status)) return "#dc2626";
    if (green.includes(status)) return "#16a34a";
    return "#64748b";
  };

  const onPrintReceipt = async (orderDetails) => {
    console.log(orderDetails);
    const receiptContent = generateReceipt(
      billIconBase64,
      orderDetails,
      poweredBy,
      gstNumber,
      companyName,
    );

    handlePrint(receiptContent);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "12px" },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor:
            orderData?.assignedEmployee?.referalcode ===
            orderData?.User?.referedby
              ? "lightgreen"
              : "red",
          borderBottom: "1px solid #e2e8f0",
          py: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="700">
            Order Details: {orderData?.orderId}
          </Typography>
          {orderData?.status && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Delivery Status:
              </Typography>
              <Chip
                label={orderData.status}
                size="small"
                sx={{
                  bgcolor: getStatusColor(orderData.status),
                  color: "white",
                  fontWeight: "700",
                }}
              />
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" py={3}>
            {error}
          </Typography>
        ) : orderData ? (
          <Box>
            {/* Section 1: Customer & Order Overview */}
            <Grid container spacing={3} sx={{ my: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Assigned Employee
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong>{" "}
                  {orderData.assignedEmployee?.name || "Not Assigned"}
                </Typography>
                <Typography variant="body1">
                  <strong>Phone:</strong>{" "}
                  {orderData.assignedEmployee?.phone || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Referral code:</strong>{" "}
                  {orderData.assignedEmployee?.referalcode || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Order Info
                </Typography>
                <Typography variant="body1">
                  <strong>Created At:</strong> {formatDate(orderData.createdAt)}
                </Typography>
                <Typography variant="body1">
                  <strong>Payment Method:</strong> {orderData.paymentMethod}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {orderData.paymentStatus}
                  &nbsp;({orderData.isPaid ? "Paid" : "Unpaid"})
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Shipping Address
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {orderData.shippingAddress?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Phone:</strong> {orderData.shippingAddress?.phone}
                </Typography>
                <Typography variant="body1">
                  <strong>Referred by code:</strong>{" "}
                  {orderData.User?.referedby || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Referred by:</strong>{" "}
                  {orderData.referredPerson?.name || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>R.P Contact:</strong>{" "}
                  {orderData.referredPerson?.phone || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Address:</strong> {orderData.shippingAddress?.h_no},{" "}
                  {orderData.shippingAddress?.city},{" "}
                  {orderData.shippingAddress?.landmark}
                </Typography>
                <Typography variant="body2">
                  {orderData.shippingAddress?.street},{" "}
                  {orderData.shippingAddress?.state} -{" "}
                  {orderData.shippingAddress?.pincode}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 1 }} />

            {/* Section 2: Items */}
            <Typography variant="subtitle1" fontWeight="700" gutterBottom>
              Order Items
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ mb: 1, borderRadius: "8px", overflow: "hidden" }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Price</TableCell>
                    <TableCell align="center">Sell Price</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderData.orderItems?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {item.productname}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          <b>HSN:</b> {item.hsncode}{" "}
                          <b style={{ color: "black" }}>/</b>{" "}
                          {item.category}{" "}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">₹{item.productprice}</TableCell>
                      <TableCell align="center">₹{item.sellingPrice}</TableCell>
                      <TableCell align="center">{item.qty}</TableCell>
                      <TableCell align="right">
                        ₹{(item.qty * item.sellingPrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Section 3: Earnings & Summary */}
            <Grid
              container
              spacing={3}
              sx={{
                display: "flex",
                justifyContent: isSuperAdmin ? "space-between" : "flex-end",
              }}
            >
              {isSuperAdmin && (
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Earnings Distribution
                  </Typography>
                  <Typography variant="body2">
                    <strong>Employee:</strong> ₹{orderData.totalEmployeeEarning}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Supervisor:</strong> ₹
                    {orderData.totalSupervisorEarning}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Admin:</strong> ₹{orderData.totalAdminEarning}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Order Summary
                </Typography>
                <Typography variant="body2">
                  <strong>Inclusive GST Amount:</strong> ₹
                  {orderData.totalGstAmount}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, color: "#0f766e" }}>
                  <strong>Total Bill Price:</strong> ₹
                  {Number(orderData.totalPrice).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
        {orderData?.status !== "Rejected" &&
          orderData?.status !== "Cancelled" && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onPrintReceipt(orderData)}
            >
              Print Receipt
            </Button>
          )}
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: "8px", textTransform: "none" }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetails;
