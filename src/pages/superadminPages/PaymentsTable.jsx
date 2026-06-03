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
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import {
  PaymentsOutlined,
  PersonOutline,
  ReceiptOutlined,
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import API from "../../services/api";
import toast from "react-hot-toast";

const PaymentsTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const fetchPayments = async (currentPage, currentLimit) => {
    try {
      setLoading(true);
      const response = await API.get(`/users/getpayments?page=${currentPage}&limit=${currentLimit}`);
      setData(response.data.payments);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payment records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to first page when limit changes
  };

  const handleDownloadPayments = async () => {
    if (!exportStartDate || !exportEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (exportEndDate < exportStartDate) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    const minDate = "2026-05-15";
    const today = new Date().toISOString().split("T")[0];

    if (exportStartDate < minDate) {
      toast.error("Start date cannot be earlier than 2026-05-15");
      return;
    }

    if (exportEndDate > yesterday) {
      toast.error("End date cannot be later than yesterday");
      return;
    }

    try {
      const response = await API.get("/users/getpayments/export", {
        params: {
          startDate: exportStartDate,
          endDate: exportEndDate,
        },
      });

      const payments = response.data.payments || [];
      if (payments.length === 0) {
        toast.error("No successful payments found for selected dates");
        return;
      }

      const XLSX = await import("xlsx");
      const formattedData = payments.map((item, index) => ({
        "S.No": index + 1,
        Date: item.createdAt || "",
        "User Name": item.user?.name || item.username || "",
        "Phone Number": item.user?.phone || "",
        Role: item.user?.role || item.role || "",
        "Order ID": item.order?.orderId || "",
        Method: item.payment_method || "",
        "Transaction ID": item.transaction_id || "",
        "Amount (₹)": parseFloat(item.credited_amount || 0).toFixed(2),
        Status: item.status || "",
      }));

      const totalAmount = payments.reduce(
        (sum, item) => sum + parseFloat(item.credited_amount || 0),
        0,
      );
      const gstAmount = totalAmount * 0.06;
      const grandTotalInclusiveGst = totalAmount + gstAmount;

      formattedData.push({
        "S.No": "",
        Date: "",
        "User Name": "Grand Total",
        "Phone Number": "",
        Role: "",
        "Order ID": "",
        Method: "",
        "Transaction ID": "",
        "Amount (₹)": totalAmount.toFixed(2),
        Status: "",
      });
      formattedData.push({
        "S.No": "",
        Date: "",
        "User Name": "GST 6% (included in total)",
        "Phone Number": "",
        Role: "",
        "Order ID": "",
        Method: "",
        "Transaction ID": "",
        "Amount (₹)": gstAmount.toFixed(2),
        Status: "",
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payments Export");

      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");

      XLSX.writeFile(workbook, `payments_export_${timestamp}.xlsx`);
      toast.success("Payment export downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to download payment export");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return { bg: "#e6f8f4", color: "#00b894", border: "#b2ece1" };
      case "Pending":
        return { bg: "#fff9db", color: "#f59f00", border: "#ffec99" };
      case "Failed":
        return { bg: "#fff5f5", color: "#fa5252", border: "#ffc9c9" };
      default:
        return { bg: "#f1f3f5", color: "#495057", border: "#dee2e6" };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a237e", mb: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <PaymentsOutlined sx={{ fontSize: 40 }} /> Payment Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitoring all incoming payments and transaction statuses
          </Typography>
        </Box>
        <Chip
          label={`Total Transactions: ${totalItems}`}
          color="primary"
          variant="filled"
          sx={{ fontWeight: "bold", px: 1, height: 40, borderRadius: 2 }}
        />
      </Box>

      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <TextField
          label="Start Date"
          type="date"
          value={exportStartDate}
          onChange={(e) => setExportStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: "2026-05-15", max: yesterday }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="End Date"
          type="date"
          value={exportEndDate}
          onChange={(e) => setExportEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: "2026-05-15", max: yesterday }}
          sx={{ minWidth: 180 }}
        />
        <Button
          variant="contained"
          onClick={handleDownloadPayments}
          sx={{ bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d645d" }, textTransform: "none" }}
        >
          Export Success Payments
        </Button>
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
            <Typography variant="body1" color="text.secondary">Loading transaction records...</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ bgcolor: "#f0f2f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2, }}>S. No</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutline fontSize="small" /> User Details
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2, }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ReceiptOutlined fontSize="small" /> Order ID
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CreditCardOutlined fontSize="small" /> Method
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceWalletOutlined fontSize="small" /> Amount (₹)
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item, index) => {
                    const statusStyle = getStatusColor(item.status);
                    return (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: "0.2s", '&:hover': { bgcolor: "rgba(26, 35, 126, 0.02)" } }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.createdAt}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2c3e50" }}>
                              {item.user?.name || item.username || "N/A"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.user?.phone || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.role || item.user?.role || "N/A"}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "capitalize", fontSize: "0.75rem" }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#34495e" }}>
                          {item.order?.orderId || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: "uppercase", fontWeight: 500 }}>
                            {item.payment_method || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {item.transaction_id || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: "#1a237e", textAlign: "right", paddingRight: 5 }}>
                          ₹{parseFloat(item.credited_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <PaymentsOutlined sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6">No payment records found</Typography>
                        <Typography variant="body2">There are no transactions recorded in the system.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3, bgcolor: "#fff", flexWrap: "wrap", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Rows per page:</Typography>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
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

export default PaymentsTable;
