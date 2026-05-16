import { useEffect, useState, useCallback } from "react";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import CallIcon from "@mui/icons-material/Call";

export default function useClientTableData() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
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
    { Header: "Client", accessor: "client", width: "30%" },
    { Header: "Client ID", accessor: "clientId", width: "15%" },
    { Header: "Date", accessor: "date", width: "20%" },
    { Header: "Status", accessor: "status", width: "15%" },
    { Header: "Actions", accessor: "actions", width: "15%" },
  ];

  // LOAD DATA
  const loadData = useCallback(async () => {
    try {
      const res = await fetch(
        "https://backend-tlar.onrender.com/api/clients",
      );
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  }, []);

  // STATUS UPDATE
  const handleStatusChange = useCallback(async (id, value) => {
    setClients((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: value } : c)),
    );

    const clientToUpdate = clients.find((c) => c._id === id);
    if (!clientToUpdate) return;

    await fetch(
      `https://backend-tlar.onrender.com/api/clients/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clientToUpdate, status: value }),
      },
    );
  }, [clients]);

  // DELETE
  const deleteClient = async (id) => {
    try {
      await fetch(
        `https://backend-tlar.onrender.com/api/clients/${id}`,
        {
          method: "DELETE",
        },
      );
      loadData();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  // EDIT
  const editClient = useCallback((c) => {
    localStorage.setItem("editClient", JSON.stringify(c));
    navigate("/add-clients");
  }, [navigate]);

  // FORMAT ROWS
  const formatRows = useCallback((data) => {
    return data
      .slice()
      .reverse()
      .map((c, i) => {
        const currentStatus = c.status || "Active";

        return {
          serial: (
            <MDBox display="flex" alignItems="center">
              <MDTypography variant="caption" fontWeight="bold" color="dark">
                {i + 1}
              </MDTypography>
              <IconButton
                size="small"
                onClick={() => setSelectedClient(c)}
                sx={{ ml: 1, color: "#1976d2" }}
              >
                <AddCircleIcon fontSize="small" />
              </IconButton>
            </MDBox>
          ),
          tenant: (
            <MDTypography variant="caption" fontWeight="bold" color="secondary">
              {c.tenantId?.companyName || "N/A"}
            </MDTypography>
          ),

          client: (
            <MDBox display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "#3b82f6", width: 24, height: 24, fontSize: 11, mr: 1 }}>
                {c.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <MDTypography variant="caption" fontWeight="bold" color="dark">
                {c.name}
              </MDTypography>
            </MDBox>
          ),

          clientId: (
            <Chip
              label={c.clientId || c._id?.slice(-6)}
              size="small"
              sx={{ bgcolor: "#f1f5f9", fontWeight: "bold", color: "#64748b" }}
            />
          ),

          date: (
            <MDBox>
              <MDTypography variant="caption" fontWeight="bold" display="block">
                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </MDTypography>
              <MDTypography variant="xxs" color="text">
                {new Date(c.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
              </MDTypography>
            </MDBox>
          ),

          status: (
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontSize: "0.75rem",
                fontWeight: "700",
                px: 1.5,              // 👈 horizontal padding
                py: 0.5,              // 👈 vertical padding
                bgcolor: currentStatus === "Active" ? "#f0fdf4" : "#fef2f2",
                color: currentStatus === "Active" ? "#16a34a" : "#dc2626",

                "& .MuiSelect-select": {
                  py: 1,              // 👈 inner text padding
                  px: 1               // 👈 inner horizontal padding
                },

                "& fieldset": {
                  border: "1px solid",
                  borderColor:
                    currentStatus === "Active" ? "#dcfce7" : "#fee2e2",
                },
              }}
            >
              <MenuItem value="Active" sx={{ py: 1, px: 2 }}>
                🟢 Active
              </MenuItem>
              <MenuItem value="Inactive" sx={{ py: 1, px: 2 }}>
                🔴 Inactive
              </MenuItem>
            </Select>
          ), actions: (
            <MDBox display="flex" gap={1}>
              <IconButton
                onClick={() => window.open(`tel:${c.phone}`, "_self")}
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#16a34a",
                  "&:hover": { bgcolor: "#f0fdf4" },
                  borderRadius: 2,
                }}
              >
                <CallIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => editClient(c)}
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#3b82f6",
                  "&:hover": { bgcolor: "#eff6ff" },
                  borderRadius: 2,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={() => setDeleteId(c._id)}
                sx={{
                  bgcolor: "#fef2f2",
                  color: "#ef4444",
                  "&:hover": { bgcolor: "#fef2f2" },
                  borderRadius: 2,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </MDBox>
          ),
        };
      });
  }, [handleStatusChange, editClient]);

  // EFFECTS
  useEffect(() => {
    const filtered = clients.filter(c =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.clientId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tenantId?.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setRows(formatRows(filtered));
  }, [clients, searchTerm, formatRows]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // RETURN
  return {
    columns,
    rows,
    dialog: (
      <>
        <Dialog
          open={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ fontWeight: "bold", background: "#22c55e", color: "#fff" }}>
            Client Details
          </DialogTitle>

          <DialogContent sx={{ p: 4 }}>
            {selectedClient && (
              <MDBox mt={2}>
                {/* HEADER */}
                <MDBox display="flex" alignItems="center" mb={3}>
                  <Avatar sx={{ bgcolor: "#3b82f6", width: 60, height: 60, fontSize: 24, mr: 2, boxShadow: 3 }}>
                    {selectedClient.name?.charAt(0)}
                  </Avatar>

                  <MDBox>
                    <MDTypography variant="h5" fontWeight="bold">
                      {selectedClient.name}
                    </MDTypography>

                    <Chip
                      label={`ID: ${selectedClient.clientId || selectedClient._id}`}
                      size="small"
                      sx={{ mt: 0.5, bgcolor: "#f1f5f9", fontWeight: "bold" }}
                    />
                  </MDBox>
                </MDBox>

                <Divider sx={{ my: 3 }} />

                {/* DETAILS */}
                <MDBox display="flex" flexDirection="column" gap={2}>
                  <MDBox display="flex" alignItems="center" gap={1.5}>
                    <MDTypography variant="button" fontWeight="bold" color="info">📞 Phone:</MDTypography>
                    <MDTypography variant="body2">{selectedClient.phone || "-"}</MDTypography>
                  </MDBox>

                  <MDBox display="flex" alignItems="center" gap={1.5}>
                    <MDTypography variant="button" fontWeight="bold" color="info">📧 Email:</MDTypography>
                    <MDTypography variant="body2">{selectedClient.email || "-"}</MDTypography>
                  </MDBox>

                  <MDBox display="flex" alignItems="center" gap={1.5}>
                    <MDTypography variant="button" fontWeight="bold" color="info">📍 Address:</MDTypography>
                    <MDTypography variant="body2">{selectedClient.address || "-"}</MDTypography>
                  </MDBox>

                  <MDBox display="flex" alignItems="center" gap={1.5}>
                    <MDTypography variant="button" fontWeight="bold" color="info">📅 Joined:</MDTypography>
                    <MDTypography variant="body2">
                      {new Date(selectedClient.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      {" • "}
                      {new Date(selectedClient.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </MDTypography>
                  </MDBox>

                  <MDBox display="flex" alignItems="center" gap={1.5}>
                    <MDTypography variant="button" fontWeight="bold" color="info">📊 Status:</MDTypography>
                    <Chip
                      label={selectedClient.status || "Active"}
                      size="small"
                      color={selectedClient.status === "Inactive" ? "error" : "success"}
                      sx={{ fontWeight: "bold", height: 24 }}
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setSelectedClient(null)} variant="outlined" sx={{ bgcolor: "red", color: "#fff", borderRadius: 2 }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon color="error" /> Confirm Delete
          </DialogTitle>
          <DialogContent>
            Are you sure you want to remove this client? This cannot be undone.
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => { deleteClient(deleteId); setDeleteId(null); }}
              sx={{ borderRadius: 2, color: "#fff" }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    ),
  };
}
