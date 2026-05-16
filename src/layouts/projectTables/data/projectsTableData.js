import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DialogActions from "@mui/material/DialogActions";

export default function useProjectData() {
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const target = params.get("target");
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "superadmin";

  // SEARCH LISTENER
  useEffect(() => {
    const handleSearch = (e) => setSearchTerm(e.detail.query || "");
    window.addEventListener("searchChanged", handleSearch);
    return () => window.removeEventListener("searchChanged", handleSearch);
  }, []);



  const columns = [
    { Header: "S.No.", accessor: "serial", width: "5%" },
    ...(isSuperAdmin ? [{ Header: "Tenant", accessor: "tenant", width: "15%" }] : []),
    { Header: "Project", accessor: "project", width: "25%" },
    { Header: "Client", accessor: "client", width: "20%" },
    { Header: "Total", accessor: "total", width: "15%" },
    { Header: "Visits", accessor: "visits", width: "10%" },
    { Header: "Date", accessor: "date", width: "15%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ];

  // Edit project
  const editProject = useCallback((p) => {
    navigate("/projects", { state: p });
  }, [navigate]);

  // Update project status
  const handleStatusChange = useCallback(async (id, value) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, status: value } : p)));

    await fetch(`https://backend-tlar.onrender.com/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
  }, []);

  // Load projects from backend
  const loadData = useCallback(async () => {
    const res = await fetch("https://backend-tlar.onrender.com/api/projects");
    const data = await res.json();
    if (Array.isArray(data)) {
      setProjects(data);
    } else {
      console.error("Projects API error:", data);
      setProjects([]);
    }
  }, []);

  // Delete project
  const deleteProject = useCallback(async (id) => {
    await fetch(`https://backend-tlar.onrender.com/api/projects/${id}`, {
      method: "DELETE",
    });
    loadData();
  }, [loadData]);

  // Function to format project data into table rows
  const formatRows = useCallback((data) => {
    return data.map((p, i) => {
      const currentStatus = p.status || "Pending";

      return {
        serial: <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#3b82f6" }}>{i + 1}</MDTypography>,
        tenant: (
          <MDTypography variant="caption" fontWeight="bold" color="secondary">
            {p.tenantId?.companyName || "N/A"}
          </MDTypography>
        ),

        project: (
          <MDBox display="flex" alignItems="center">
            <MDBox
              sx={{
                width: 26,
                height: 26,
                borderRadius: "6px",
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                mr: 1,
                fontSize: 12,
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)"
              }}
            >
              {p.projectName?.charAt(0)?.toUpperCase()}
            </MDBox>
            <MDBox>
              <MDTypography variant="caption" fontWeight="bold" display="block" sx={{ color: "#1e293b" }}>
                {p.projectName}
              </MDTypography>
              <MDTypography variant="xxs" color="text">ID: {p.projectId || p._id?.slice(-6)}</MDTypography>
            </MDBox>
          </MDBox>
        ),

        client: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="bold" color="info" display="block">
              {p.clientName}
            </MDTypography>
            <MDTypography variant="xxs" color="text">{p.clientId}</MDTypography>
          </MDBox>
        ),

        total: (
          <MDBox sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: "#f0fdf4", border: "1px solid #dcfce7" }}>
            <MDTypography variant="caption" fontWeight="bold" color="success">
              ₹ {p.totalAmount?.toLocaleString("en-IN")}
            </MDTypography>
          </MDBox>
        ),
        visits: (
          <MDBox sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: p.visitCounter > 0 ? "#eff6ff" : "#fef2f2", border: `1px solid ${p.visitCounter > 0 ? "#dbeafe" : "#fee2e2"}`, textAlign: "center" }}>
            <MDTypography variant="caption" fontWeight="bold" sx={{ color: p.visitCounter > 0 ? "#2563eb" : "#dc2626" }}>
              {p.visitCounter ?? 5} Left
            </MDTypography>
            {p.visitNotes?.length > 0 && (
              <MDTypography variant="xxs" display="block" sx={{ color: "#64748b", mt: 0.2 }}>
                Last: {new Date(p.visitNotes[p.visitNotes.length - 1].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </MDTypography>
            )}
          </MDBox>
        ),

        date: (
          <MDBox>
            <MDTypography variant="caption" fontWeight="bold" display="block">
              {new Date(p.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
            </MDTypography>
            <MDTypography variant="xxs" color="text">
              {new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
            </MDTypography>
          </MDBox>
        ),

        status: (() => {
          const statusConfig = {
            Pending: { bg: "#f59e0b", hover: "#d97706", label: "Pending" },
            Running: { bg: "#3b82f6", hover: "#2563eb", label: "Running" },
            Assigned: { bg: "#8b5cf6", hover: "#7c3aed", label: "Assigned" },
            Completed: { bg: "#10b981", hover: "#059669", label: "Completed" },
          };
          const cfg = statusConfig[currentStatus] || statusConfig.Pending;
          return (
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(p._id, e.target.value)}
              sx={{
                fontSize: 11,
                height: 30,
                minWidth: 110,
                borderRadius: "20px",
                fontWeight: "700",
                bgcolor: cfg.bg,
                color: "#fff !important",
                letterSpacing: "0.5px",
                "& .MuiSelect-select": { color: "#fff !important", py: "4px" },
                "& .MuiSelect-icon": { color: "#fff !important" },
                "& fieldset": { border: "none" },
                "&:hover": { bgcolor: cfg.bg },
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
                transition: "background 0.2s",
              }}
            >
              <MenuItem value="Pending">🟡 Pending</MenuItem>
              <MenuItem value="Running">🔵 Running</MenuItem>
              <MenuItem value="Assigned">🟣 Assigned</MenuItem>
              <MenuItem value="Completed">🟢 Completed</MenuItem>
            </Select>
          );
        })(),

        actions: (
          <MDBox display="flex" gap={0.5} alignItems="center">
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const tabMap = { drawings: 1, accounts: 2, scope: 3 };
                const tab = tabMap[target] || 0;
                navigate(`/project-details/${p._id}?tab=${tab}`, { state: p });
              }}
              sx={{
                textTransform: "none",
                fontSize: "10px",
                px: 1.5,
                py: 0.5,
                bgcolor: "#6366f1",
                color: "#fff",
                borderRadius: "8px",
                fontWeight: "bold",
                boxShadow: "none",
                "&:hover": { bgcolor: "#6366f1", boxShadow: "0 4px 12px rgba(99,102,241,0.4)", transform: "translateY(-1px)" },
                transition: "all 0.2s",
              }}
            >
              Details
            </Button>

            <IconButton
              size="small"
              onClick={() => editProject(p)}
              sx={{
                color: "#2563eb",
                bgcolor: "#eff6ff",
                borderRadius: "8px",
                p: "5px",
                "&:hover": { bgcolor: "#eff6ff", color: "#2563eb", boxShadow: "0 4px 12px rgba(37,99,235,0.4)", transform: "translateY(-1px)" },
                transition: "all 0.2s",
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setDeleteId(p._id)}
              sx={{
                color: "#dc2626",
                bgcolor: "#fef2f2",
                borderRadius: "8px",
                p: "5px",
                "&:hover": { bgcolor: "#fef2f2", color: "#dc2626", boxShadow: "0 4px 12px rgba(220,38,38,0.4)", transform: "translateY(-1px)" },
                transition: "all 0.2s",
              }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </MDBox>
        ),
      };
    });
  }, [editProject, handleStatusChange, navigate, target]);

  // Update rows whenever projects or search term changes
  useEffect(() => {
    const filtered = projects.filter(p =>
      (p.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tenantId?.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setRows(formatRows(filtered));
  }, [projects, searchTerm, formatRows]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    columns,
    rows,
    dialog: (
      <>
        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon color="error" /> Delete Project
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete this project? All associated data will be lost.
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => { deleteProject(deleteId); setDeleteId(null); }}
              sx={{ borderRadius: 2, color: "#fff", bgcolor: "red" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  };
}
