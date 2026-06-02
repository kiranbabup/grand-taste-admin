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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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

const WithdrawRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");

  const [updateData, setUpdateData] = useState({
    status: "",
    payment_transaction_ID: "",
    payment_mode: "",
  });

  const fetchPayments = async (currentPage, currentLimit) => {
    try {
      setLoading(true);
      const response = await API.get(
        `/users/withdraw/all?page=${currentPage}&limit=${currentLimit}`,
      );
      console.log(response.data);

      setData(response.data.withdrawRequests);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      toast.error("Failed to fetch withdraw requests");
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

  const openStatusModal = (withdraw) => {
    setSelectedWithdraw(withdraw);

    setUpdateData({
      status: withdraw.status,
      payment_transaction_ID: "",
      payment_mode: withdraw.payment_mode || "",
    });

    setOpenModal(true);
  };

  const updateWithdrawStatus = async () => {
    try {
      if (
        updateData.status === "sent" &&
        (!updateData.payment_transaction_ID || !updateData.payment_mode)
      ) {
        toast.error("Transaction ID and Payment Mode required");
        return;
      }

      await API.put(
        `/users/withdraw/status/${selectedWithdraw.id}`,
        updateData,
      );

      toast.success("Withdraw updated");

      setOpenModal(false);

      setUpdateData({
        status: "",
        payment_transaction_ID: "",
        payment_mode: "",
      });

      fetchPayments(page, rowsPerPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDownload = async () => {
    if (!downloadStartDate || !downloadEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (downloadEndDate < downloadStartDate) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    try {
      const response = await API.get("/users/withdraw/export", {
        params: {
          startDate: downloadStartDate,
          endDate: downloadEndDate,
        },
      });

      const list = response.data.withdrawRequests || [];
      if (list.length === 0) {
        toast.error("No withdraw requests found for selected dates");
        return;
      }

      const XLSX = await import("xlsx");

      const formattedData = list.map((item, index) => ({
        "S.No": index + 1,
        "Requested Date": item.createdAt || "",
        "Account Holder Name": item.ac_holder_name || "",
        "Withdraw Amount": item.withdrawAmount || "",
        "Payment Mode": item.payment_mode || "",
        "Account Number": item.ac_no || "",
        "Branch Name": item.branch_name || "",
        "IFSC Code": item.ifsc_code || "",
        "UPI ID": item.upi || "",
        Status: item.status || "",
        "Transaction ID": item.payment_transaction_ID || "",
        "Phone Number": item.user?.phone || "",
        Role: item.user?.role || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Withdraw Requests");

      const now = new Date();
      const timestamp =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");

      XLSX.writeFile(workbook, `withdraw_requests_${timestamp}.xlsx`);

      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to download excel");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#1a237e",
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <PaymentsOutlined sx={{ fontSize: 40 }} /> Withdraw Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitoring all withdrawal transactions and managing their statuses.
          </Typography>
        </Box>

        <Chip
          label={`Total Transactions: ${totalItems}`}
          color="primary"
          variant="filled"
          sx={{ fontWeight: "bold", px: 1, height: 40, borderRadius: 2 }}
        />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Start Date"
            type="date"
            value={downloadStartDate}
            onChange={(e) => setDownloadStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: "2026-05-20",
              max: today,
            }}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            value={downloadEndDate}
            onChange={(e) => setDownloadEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: downloadStartDate || "2026-05-20",
              max: today,
            }}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!downloadStartDate || !downloadEndDate}
            onClick={() => handleDownload()}
          >
            Download Withdraw List
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
            }}
          >
            <CircularProgress thickness={4} size={50} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading transaction records...
            </Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ bgcolor: "#f0f2f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>S. No</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    Requested Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutline fontSize="small" /> User Details
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalanceWalletOutlined fontSize="small" />
                      Withdrawal Amount (₹)
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CreditCardOutlined fontSize="small" /> Payment Mode
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ReceiptOutlined fontSize="small" /> Credit To
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    Updated Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>
                    Transaction ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                  <TableCell>Action</TableCell>
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
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          transition: "0.2s",
                          "&:hover": { bgcolor: "rgba(26, 35, 126, 0.02)" },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.createdAt}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "#2c3e50" }}
                            >
                              {item.ac_holder_name || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.user?.phone || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.user?.role || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            color: "#34495e",
                            textAlign: "center",
                          }}
                        >
                          {item.withdrawAmount || "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            label={item.payment_mode || "N/A"}
                            size="small"
                            variant="outlined"
                            sx={{
                              textTransform: "uppercase",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            {item.payment_mode === "upi" ? (
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, color: "#2c3e50" }}
                              >
                                {item.upi || "N/A"}
                              </Typography>
                            ) : (
                              <>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, color: "#2c3e50" }}
                                >
                                  {item.ac_no || "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item.branch_name || "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {item.ifsc_code || "N/A"}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>{item.updatedAt || "N/A"}</TableCell>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                        >
                          {item.payment_transaction_ID || "N/A"}
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
                        <TableCell>
                          {!["sent", "failed", "rejected"].includes(
                            item.status,
                          ) && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => openStatusModal(item)}
                            >
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <PaymentsOutlined sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6">
                          No payment records found
                        </Typography>
                        <Typography variant="body2">
                          There are no transactions recorded in the system.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 3,
                  bgcolor: "#fff",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rows per page:
                  </Typography>
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

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Withdraw</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              displayEmpty
              value={updateData.status}
              onChange={(e) => {
                const value = e.target.value;

                setUpdateData((prev) => ({
                  ...prev,
                  status: value,
                }));
              }}
            >
              {selectedWithdraw?.status === "pending" ? (
                <MenuItem value="inprogress">Move to In Progress</MenuItem>
              ) : (
                [
                  <MenuItem key="sent" value="sent">
                    Sent
                  </MenuItem>,

                  <MenuItem key="failed" value="failed">
                    Failed
                  </MenuItem>,

                  <MenuItem key="rejected" value="rejected">
                    Rejected
                  </MenuItem>,
                ]
              )}
            </Select>
          </FormControl>

          {/* SENT ONLY */}

          {updateData?.status?.trim() === "sent" && (
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                label="Transaction ID"
                fullWidth
                required
                value={updateData.payment_transaction_ID}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    payment_transaction_ID: e.target.value,
                  }))
                }
              />

              <FormControl fullWidth>
                <Select
                  displayEmpty
                  value={updateData.payment_mode}
                  onChange={(e) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      payment_mode: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="">Select Payment Mode</MenuItem>

                  <MenuItem value="upi">UPI</MenuItem>

                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>

          <Button variant="contained" onClick={updateWithdrawStatus}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawRequests;
