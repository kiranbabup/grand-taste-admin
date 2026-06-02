import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Button,
    CircularProgress,
    Tooltip,
    Container,
    Card,
    CardContent,
    Avatar,
    Stack,
    useTheme,
    alpha,
    Fade,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UnreadIcon,
    ShoppingCart as OrderIcon,
    AccountBalanceWallet as EarningIcon,
    Payment as WithdrawIcon,
    Warning as AlertIcon,
    Info as SystemIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import API from "../services/api";
import LsService from "../services/localstorage";

const NotificationCenter = () => {
    const theme = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await API.get("/users/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await API.put(`/users/notifications/read/${id}`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            toast.success("Notification marked as read");
        } catch (error) {
            console.error("Error marking notification as read:", error);
            toast.error("Failed to update notification");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await API.put(`/users/notifications/delete/${id}`);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== id)
            );
            toast.success("Notification deleted successfully");
        } catch (error) {
            console.error("Error deleting notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Frontend Pagination
    const paginatedNotifications = useMemo(() => {
        return notifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [notifications, page, rowsPerPage]);

    const getNotificationStyles = (type) => {
        switch (type) {
            case "order":
                return { color: "#3b82f6", icon: <OrderIcon />, bg: alpha("#3b82f6", 0.1) };
            case "earning":
                return { color: "#10b981", icon: <EarningIcon />, bg: alpha("#10b981", 0.1) };
            case "withdraw":
                return { color: "#f59e0b", icon: <WithdrawIcon />, bg: alpha("#f59e0b", 0.1) };
            case "alert":
                return { color: "#ef4444", icon: <AlertIcon />, bg: alpha("#ef4444", 0.1) };
            case "system":
                return { color: "#6366f1", icon: <SystemIcon />, bg: alpha("#6366f1", 0.1) };
            default:
                return { color: "#64748b", icon: <NotificationsIcon />, bg: alpha("#64748b", 0.1) };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            width: 56,
                            height: 56,
                        }}
                    >
                        <NotificationsIcon fontSize="large" />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: "-0.02em" }}>
                            Notification Center
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Stay updated with your latest activities and system alerts
                        </Typography>
                    </Box>
                </Stack>

                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchNotifications}
                    disabled={loading}
                    sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        px: 3,
                        fontWeight: 600,
                        borderColor: alpha(theme.palette.divider, 0.2),
                        "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                    }}
                >
                    Refresh
                </Button>
            </Box>

            <Fade in={!loading}>
                <Card
                    sx={{
                        borderRadius: "24px",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
                            theme.palette.background.paper,
                            0.9
                        )} 100%)`,
                        backdropFilter: "blur(10px)",
                        overflow: "hidden",
                    }}
                >
                    <CardContent sx={{ p: 0 }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                                <CircularProgress size={40} thickness={4} />
                            </Box>
                        ) : notifications.length === 0 ? (
                            <Box sx={{ py: 15, textAlign: "center" }}>
                                <NotificationsIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2, opacity: 0.3 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No notifications yet
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    When you have notifications, they will appear here.
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <TableContainer>
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                                <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }}>TYPE</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }}>TITLE & MESSAGE</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }}>TIME</TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }} align="right">
                                                    MARK
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }} align="right">
                                                    ACTION
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedNotifications.map((notification) => {
                                                const styles = getNotificationStyles(notification.type);
                                                return (
                                                    <TableRow
                                                        key={notification.id}
                                                        sx={{
                                                            "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.3) },
                                                            opacity: notification.isRead ? 0.7 : 1,
                                                            transition: "all 0.2s",
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: styles.bg,
                                                                        color: styles.color,
                                                                        width: 40,
                                                                        height: 40,
                                                                    }}
                                                                >
                                                                    {styles.icon}
                                                                </Avatar>
                                                                <Chip
                                                                    label={notification.type?.toUpperCase()}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        fontSize: "0.65rem",
                                                                        bgcolor: styles.bg,
                                                                        color: styles.color,
                                                                        border: `1px solid ${alpha(styles.color, 0.2)}`,
                                                                    }}
                                                                />
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box>
                                                                <Typography
                                                                    variant="subtitle1"
                                                                    fontWeight={notification.isRead ? 600 : 800}
                                                                    sx={{ color: notification.isRead ? "text.secondary" : "text.primary" }}
                                                                >
                                                                    {notification.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
                                                                    {notification.message}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {formatDate(notification.createdAt)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {notification.updatedAt !== notification.createdAt && "Updated: " + formatDate(notification.updatedAt)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {notification.isRead ? (
                                                                <Tooltip title="Read">
                                                                    <CheckCircleIcon sx={{ color: "success.light", opacity: 0.5 }} />
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="Mark as Read">
                                                                    <IconButton
                                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                                        sx={{
                                                                            color: theme.palette.primary.main,
                                                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                                            "&:hover": {
                                                                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                                            },
                                                                        }}
                                                                    >
                                                                        <UnreadIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleDeleteNotification(notification.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </TableCell>

                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    rowsPerPageOptions={[10, 30, 50]}
                                    component="div"
                                    count={notifications.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    sx={{
                                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                                            fontWeight: 600,
                                            color: "text.secondary",
                                        },
                                    }}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </Fade>
        </Container>
    );
};

export default NotificationCenter;
