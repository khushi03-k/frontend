import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import RecentClients from "./components/RecentClients/index.js";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PeopleIcon from "@mui/icons-material/People";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const STATS = [
  {
    icon: <PeopleIcon sx={{ fontSize: 32, color: "#fff" }} />,
    label: "Total Clients",
    key: "clients",
    route: "/tables",
    grad: "#fb923c",
    shadow: "rgba(249,115,22,0.35)",
    bg: "#fff7ed",
    textColor: "#f97316",
    desc: "Registered Clients",
  },
  {
    icon: <AccountTreeIcon sx={{ fontSize: 32, color: "#fff" }} />,
    label: "Active Projects",
    key: "projects",
    route: "/projectTables",
    grad: "#2563eb",
    shadow: "rgba(37,99,235,0.35)",
    bg: "#eff6ff",
    textColor: "#2563eb",
    desc: "Running Projects",
  },
  {
    icon: <ReceiptLongIcon sx={{ fontSize: 32, color: "#fff" }} />,
    label: "Total Invoices",
    key: "invoices",
    route: "/billing",
    grad: "#16a34a",
    shadow: "rgba(22,163,74,0.35)",
    bg: "#f0fdf4",
    textColor: "#16a34a",
    desc: "Billing Records",
  },
  {
    icon: <StorefrontIcon sx={{ fontSize: 32, color: "#fff" }} />,
    label: "Vendors",
    key: "vendors",
    route: "/vendor",
    grad: "#9333ea",
    shadow: "rgba(147,51,234,0.35)",
    bg: "#faf5ff",
    textColor: "#9333ea",
    desc: "Verified Suppliers",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ clients: 0, projects: 0, invoices: 0, vendors: 0 });

  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then(r => r.json()).then(d => setCounts(p => ({ ...p, clients: d.length }))).catch(() => { });

    fetch("http://localhost:5000/api/projects")
      .then(r => r.json()).then(d => setCounts(p => ({ ...p, projects: d.length }))).catch(() => { });

    fetch("http://localhost:5000/api/invoices")
      .then(r => r.json()).then(d => setCounts(p => ({ ...p, invoices: d.length || d.data?.length || 0 }))).catch(() => { });

    fetch("http://localhost:5000/api/vendors")
      .then(r => r.json()).then(d => setCounts(p => ({ ...p, vendors: d.length || d.data?.length || 0 }))).catch(() => { });
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3} px={1}>

        {/* ====== HERO BANNER ====== */}
        <Box sx={{
          mb: 4, p: { xs: 3, md: 5 }, borderRadius: 5,
          background: "#1a73e8",
          color: "#fff",
          boxShadow: "0 20px 60px rgba(249,115,22,0.3)",
          position: "relative", overflow: "hidden",
        }}>
          <Box sx={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <Box sx={{ position: "absolute", bottom: -60, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", letterSpacing: -1, mb: 1 }}>
              🏛️ Architect CRM
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 400, mb: 2 }}>
              Architectural Management System · All modules synchronized
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {[
                { label: "Add Project", route: "/projects", color: "#fff", text: "#f97316" },
                { label: "Add Client", route: "/add-clients", color: "rgba(255,255,255,0.2)", text: "#fff" },
                { label: "New Estimate", route: "/estimate", color: "rgba(255,255,255,0.2)", text: "#fff" },
              ].map((btn, i) => (
                <Button
                  key={i}
                  onClick={() => navigate(btn.route)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: btn.color,
                    color: btn.text,
                    fontWeight: "bold",
                    borderRadius: 3,
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    transition: "all 0.25s",

                    "&:hover": {
                      bgcolor: "#000",        // ✅ BLACK HOVER
                      color: "#fff",          // white text
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                      opacity: 1              // override old opacity
                    },

                    boxShadow: i === 0 ? "0 6px 20px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ====== STAT CARDS ====== */}
        <Grid container spacing={3} mb={4}>
          {STATS.map((s) => (
            <Grid item xs={12} sm={6} lg={3} key={s.key}>
              <Card
                onClick={() => navigate(s.route)}
                sx={{
                  borderRadius: 5, overflow: "hidden", cursor: "pointer",
                  boxShadow: `0 8px 30px ${s.shadow}`,
                  transition: "all 0.35s",
                  "&:hover": { transform: "translateY(-10px)", boxShadow: `0 20px 50px ${s.shadow}` },
                }}
              >
                {/* Colored top strip */}
                <Box sx={{ background: s.grad, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 }}>
                      {s.label}
                    </Typography>
                    <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", lineHeight: 1.1 }}>
                      {counts[s.key]}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 3, p: 1.5, display: "flex" }}>
                    {s.icon}
                  </Box>
                </Box>
                {/* Bottom info */}
                <Box sx={{ p: 2, bgcolor: s.bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ color: s.textColor }}>
                    {s.desc}
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: s.textColor }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ====== QUICK ACTIONS ====== */}
        <Grid container spacing={3} mb={4}>
          {[
            { label: "🏗️ Civil Drawings", route: "/projectTables?target=drawings", grad: "#f97316" },
            { label: "💰 Accounts", route: "/projectTables?target=accounts", grad: "#16a34a" },
            { label: "📋 Scope of Work", route: "/projectTables?target=scope", grad: "#2563eb" },
            { label: "📄 Estimates", route: "/estimate", grad: "#9333ea" },
          ].map((q, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card
                onClick={() => navigate(q.route)}
                sx={{
                  p: 3, textAlign: "center", borderRadius: 4, cursor: "pointer",
                  background: q.grad, color: "#fff",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  transition: "all 0.3s",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" },
                }}
              >
                <Typography variant="h6" fontWeight="900" sx={{ color: "#fff" }}>{q.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ====== MAIN CONTENT ====== */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <RecentClients />
          </Grid>
          <Grid item xs={12} md={4}>
            <OrdersOverview />
          </Grid>
        </Grid>

        {/* ====== SYSTEM STATUS ====== */}
        <Box sx={{
          mt: 4, p: 3, borderRadius: 4,
          background: "linear-gradient(135deg, #1e293b, #334155)",
          display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap",
        }}>
          <Box sx={{ bgcolor: "rgba(249,115,22,0.2)", borderRadius: 3, p: 1.5, display: "flex" }}>
            <TrendingUpIcon sx={{ color: "#f97316", fontSize: 30 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="900" sx={{ color: "#fff" }}>
              Architectural Management System v2.0
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              ✓ All modules operational · Cloud backend synchronized · Real-time updates active
            </Typography>
          </Box>
          <Box sx={{
            px: 2, py: 0.8, borderRadius: 3,
            background: "#16a34a",
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#fff", animation: "pulse 2s infinite" }} />
            <Typography variant="caption" fontWeight="bold" sx={{ color: "#fff" }}>LIVE</Typography>
          </Box>
        </Box>

      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
