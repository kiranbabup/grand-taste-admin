import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { getAllAdmins, getMonthlyIncome, getAllStaffByRole } from "../services/adminService";

const Dashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminRes, supervisorRes, employeeRes, customerRes, incomeRes] = await Promise.all([
        getAllAdmins(),
        getAllStaffByRole("supervisor"),
        getAllStaffByRole("employee"),
        getAllStaffByRole("customer"),
        getMonthlyIncome()
      ]);

      setAdmins(adminRes.data || []);
      setSupervisors(supervisorRes.data || []);
      setEmployees(employeeRes.data || []);
      setCustomers(customerRes.users || []); // getUsersByRole returns { users: [...] }
      setMonthlyIncomeData(incomeRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  /* ============================= */
  /* 📊 EARNINGS CALCULATION */
  /* ============================= */

  const totalAdminEarnings = admins.reduce(
    (sum, user) => sum + (Number(user.earnings) || 0),
    0
  );

  const totalSupervisorEarnings = supervisors.reduce(
    (sum, user) => sum + (Number(user.earnings) || 0),
    0
  );

  const totalEmployeeEarnings = employees.reduce(
    (sum, user) => sum + (Number(user.earnings) || 0),
    0
  );

  /* ============================= */
  /* 📊 BAR CHART DATA (EARNINGS) */
  /* ============================= */

  const earningsData = [
    { name: "Admin", earnings: totalAdminEarnings },
    { name: "Supervisor", earnings: totalSupervisorEarnings },
    { name: "Employee", earnings: totalEmployeeEarnings },
  ];

  /* ============================= */
  /* 🥧 PIE CHART DATA (COUNTS) */
  /* ============================= */

  const countData = [
    { name: "Admins", value: admins.length },
    { name: "Supervisors", value: supervisors.length },
    { name: "Employees", value: employees.length },
    { name: "Customers", value: customers.length },
  ];

  const COLORS = ["#6C5CE7", "#00B894", "#FD9644", "#3498db"];




  const formatCurrency = (amount) => {
    const number = Number(amount);

    if (isNaN(number)) return 0; // prevent NaN

    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  return (
    <div>
      <h2 style={{ color: "black" }}>Dashboard Overview</h2>

      <div className="cards">
        <div className="card" style={{ backgroundColor: "#E8E6F9" }}>
          <h3>Total Admin Earnings</h3>
          <h2>₹ {formatCurrency(totalAdminEarnings)}</h2>
        </div>

        <div className="card" style={{ backgroundColor: "#E6F8F4" }}>
          <h3>Total Supervisor Earnings</h3>
          <h2>₹ {formatCurrency(totalSupervisorEarnings)}</h2>
        </div>

        <div className="card" style={{ backgroundColor: "#FFF4EB" }}>
          <h3>Total Employee Earnings</h3>
          <h2>₹ {formatCurrency(totalEmployeeEarnings)}</h2>
        </div>
      </div>

      <div className="charts">
        {/* 📊 BAR CHART - Earnings */}
        <div className="chart-container">
          <h3>Earnings Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#6C5CE7" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🥧 PIE CHART - User Count */}
        <div className="chart-container">
          <h3>User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={countData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {countData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts full-width-chart-container" style={{ marginTop: "30px" }}>
        <div className="chart-container" style={{ minWidth: "100%" }}>
          <h3>Monthly Income Trends</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyIncomeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#6C5CE7"
                strokeWidth={3}
                dot={{ r: 6, fill: '#6C5CE7', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;