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
    CircularProgress
} from "@mui/material";
import API from "../services/api";

const OrderDetails = ({ orderId, open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (open && orderId) {
            fetchOrderDetails();
        }
    }, [open, orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            setError("");
            const response = await API.get(`/orders/getOrderById/${orderId}`);
            if (response.data) {
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

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getStatusColor = (status) => {
        const blue = ["Pending", "Shipped", "Cancel Request", "Return Request", "Return - Approved"];
        const orange = ["Accepted", "Out for Delivery", "Return - Initiated"];
        const red = ["Rejected", "Cancelled", "Return - Rejected"];
        const green = ["Delivered", "Returned & Refunded"];

        if (blue.includes(status)) return "#2563eb";
        if (orange.includes(status)) return "#f59e0b";
        if (red.includes(status)) return "#dc2626";
        if (green.includes(status)) return "#16a34a";
        return "#64748b";
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: "12px" }
            }}
        >
            <DialogTitle sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", py: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" fontWeight="700">Order Details: {orderData?.orderId}</Typography>
                    {orderData?.status && (
                        <Chip 
                            label={orderData.status} 
                            size="small" 
                            sx={{ bgcolor: getStatusColor(orderData.status), color: "white", fontWeight: "700" }} 
                        />
                    )}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center" py={3}>{error}</Typography>
                ) : orderData ? (
                    <Box>
                        {/* Section 1: Customer & Order Overview */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Customer Details</Typography>
                                <Typography variant="body1"><strong>Name:</strong> {orderData.User?.name}</Typography>
                                <Typography variant="body1"><strong>Phone:</strong> {orderData.User?.phone}</Typography>
                                <Typography variant="body1"><strong>Role:</strong> {orderData.User?.role}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Order Info</Typography>
                                <Typography variant="body1"><strong>Created At:</strong> {formatDate(orderData.createdAt)}</Typography>
                                <Typography variant="body1"><strong>Payment Method:</strong> {orderData.paymentMethod}</Typography>
                                <Typography variant="body1">
                                    <strong>Status:</strong> {orderData.paymentStatus} 
                                    ({orderData.isPaid ? "Paid" : "Unpaid"})
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ mb: 3 }} />

                        {/* Section 2: Items */}
                        <Typography variant="subtitle1" fontWeight="700" gutterBottom>Order Items</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: "8px", overflow: "hidden" }}>
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
                                                <Typography variant="body2" fontWeight="600">{item.productname}</Typography>
                                                <Typography variant="caption" color="textSecondary">{item.category}</Typography>
                                            </TableCell>
                                            <TableCell align="center">₹{item.productprice}</TableCell>
                                            <TableCell align="center">₹{item.sellingPrice}</TableCell>
                                            <TableCell align="center">{item.qty}</TableCell>
                                            <TableCell align="right">₹{(item.qty * item.sellingPrice).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Section 3: Earnings & Summary */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Earnings Distribution</Typography>
                                <Typography variant="body2"><strong>Employee:</strong> ₹{orderData.totalEmployeeEarning}</Typography>
                                <Typography variant="body2"><strong>Supervisor:</strong> ₹{orderData.totalSupervisorEarning}</Typography>
                                <Typography variant="body2"><strong>Admin:</strong> ₹{orderData.totalAdminEarning}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>Order Summary</Typography>
                                <Typography variant="body2"><strong>GST Amount:</strong> ₹{orderData.totalGstAmount}</Typography>
                                <Typography variant="h6" sx={{ mt: 1, color: "#0f766e" }}>
                                    <strong>Total Price:</strong> ₹{Number(orderData.totalPrice).toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ mb: 3 }} />

                        {/* Section 4: Shipping Address */}
                        <Typography variant="subtitle1" fontWeight="700" gutterBottom>Shipping Address</Typography>
                        <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <Typography variant="body2"><strong>Name:</strong> {orderData.shippingAddress?.name}</Typography>
                            <Typography variant="body2"><strong>Phone:</strong> {orderData.shippingAddress?.phone}</Typography>
                            <Typography variant="body2">
                                <strong>Address:</strong> {orderData.shippingAddress?.h_no}, {orderData.shippingAddress?.street}, {orderData.shippingAddress?.landmark}
                            </Typography>
                            <Typography variant="body2">
                                {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.deliveryPincode}
                            </Typography>
                        </Box>
                    </Box>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
                <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: "8px", textTransform: "none" }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetails;
