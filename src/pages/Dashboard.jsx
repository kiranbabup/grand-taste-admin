import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend,
  ResponsiveContainer, AreaChart, Area, CartesianGrid
} from "recharts";
import { Box, Grid, Typography, Paper, Card, CardContent, CircularProgress } from "@mui/material";
import {
  PeopleAltOutlined,
  ShoppingBagOutlined,
  Inventory2Outlined,
  TrendingUpOutlined,
  AdminPanelSettingsOutlined,
  SupervisedUserCircleOutlined,
  GroupOutlined,
} from "@mui/icons-material";
import API from "../services/api";
import LsService from "../services/localstorage";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [roleCounts, setRoleCounts] = useState(null);
  const [orderCounts, setOrderCounts] = useState(null);
  const [stockCounts, setStockCounts] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [incomeTrends, setIncomeTrends] = useState([]);
  
  const user = LsService.getCurrentUser();
  const isSuperAdmin = user?.role === "superadmin";

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoints = [
        API.get("/admin/dashboard/role-counts"),
        API.get("/admin/dashboard/order-counts"),
        API.get("/admin/dashboard/stock-products"),
      ];

      if (isSuperAdmin) {
        endpoints.push(API.get("/admin/dashboard/sales?type=daily"));
        endpoints.push(API.get("/admin/dashboard/income-trends"));
      }

      const results = await Promise.all(endpoints);

      setRoleCounts(results[0].data.counts);
      setOrderCounts(results[1].data.counts);
      setStockCounts(results[2].data);

      if (isSuperAdmin) {
        setSalesData(results[3].data.data);
        setIncomeTrends(results[4].data.monthly);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ["#6C5CE7", "#00B894", "#FD9644", "#3498db", "#e74c3c", "#9b59b6"];

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.05)", height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={800}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress thickness={4} />
      </Box>
    );
  }

  const orderChartData = orderCounts ? Object.entries(orderCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value })) : [];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a237e", mb: 4 }}>
        Dashboard Overview
      </Typography>

      {/* Role Counts Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Admins" 
            value={roleCounts?.totalAdminsCount || 0} 
            icon={<AdminPanelSettingsOutlined />} 
            color="#6C5CE7" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Supervisors" 
            value={roleCounts?.totalSupervisorsCount || 0} 
            icon={<SupervisedUserCircleOutlined />} 
            color="#00B894" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Employees" 
            value={roleCounts?.totalEmployeesCount || 0} 
            icon={<GroupOutlined />} 
            color="#FD9644" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Customers" 
            value={roleCounts?.totalCustomersCount || 0} 
            icon={<PeopleAltOutlined />} 
            color="#3498db" 
          />
        </Grid>
      </Grid>

      {/* Stock & Product Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Total Products Catalog" 
            value={stockCounts?.totalProducts || 0} 
            icon={<Inventory2Outlined />} 
            color="#e74c3c" 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard 
            title="Available Inventory" 
            value={stockCounts?.totalStock || 0} 
            icon={<ShoppingBagOutlined />} 
            color="#9b59b6" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Order Status Distribution (Pie Chart) */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '450px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Order Status Distribution</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderChartData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {orderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sales/Income Charts (SuperAdmin Only) */}
        {isSuperAdmin && (
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '450px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Daily Sales Performance</Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" fontSize={11} tick={{fill: '#666'}} />
                    <YAxis tick={{fill: '#666'}} />
                    <Tooltip cursor={{fill: 'rgba(108, 92, 231, 0.05)'}} />
                    <Bar dataKey="totalSales" fill="#6C5CE7" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}

        {isSuperAdmin && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 4, height: '400px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpOutlined sx={{ color: "#6C5CE7" }} />
                <Typography variant="h6" fontWeight={700}>Income Growth Trend (Monthly)</Typography>
              </Box>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeTrends}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="month" tick={{fill: '#666'}} />
                    <YAxis tick={{fill: '#666'}} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="totalIncome" 
                      stroke="#6C5CE7" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      strokeWidth={4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;