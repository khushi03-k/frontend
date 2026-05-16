import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const API = "https://backend-1-vxvg.onrender.com/api/estimate";

export default function EstimatePage() {
  // GET LOGGED IN USER DATA
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    projectTitle: "",
    ownerName: "",
    location: "",
    plotArea: "",
    notes: "",
    description: "",
    // Profile Fields
    company: user.companyName || "Your Company",
    address: user.address || "Your Address",
    phone: user.phone || "Phone",
    sellerName: user.ownerName || "",
    specialization: user.specialization || "",
    regNo: user.regNo || "",
    logo: user.companyLogo || "",
    logoFile: null,
  });

  const [items, setItems] = useState([
    { sno: 1, desc: "", qty: "", unit: "", rate: "" },
  ]);

  const [estimates, setEstimates] = useState([]);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  /* ================= FETCH ALL ================= */
  const loadEstimates = useCallback(async () => {
    try {
      const res = await fetch(API, {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      setEstimates(data);
    } catch (err) {
      console.error("Error fetching estimates:", err);
    }
  }, [user.token]);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  /* ================= ADD ROW ================= */
  const addRow = () => {
    setItems([
      ...items,
      { sno: items.length + 1, desc: "", qty: "", unit: "", rate: "" },
    ]);
  };

  /* ================= DELETE ROW ================= */
  const deleteRow = (i) => {
    const updated = items
      .filter((_, index) => index !== i)
      .map((item, idx) => ({
        ...item,
        sno: idx + 1,
      }));
    setItems(
      updated.length > 0
        ? updated
        : [{ sno: 1, desc: "", qty: "", unit: "", rate: "" }],
    );
  };

  /* ================= TOTAL ================= */
  const total = items.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.rate || 0),
    0,
  );

  /* ================= SAVE / UPDATE ================= */
  const saveEstimate = async () => {
    try {
      if (!form.projectTitle || !items[0].desc) {
        Swal.fire("Warning", "Project Title and at least one item are required.", "warning");
        return;
      }

      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'logoFile' && key !== 'logo') {
          formData.append(key, form[key]);
        }
      });

      formData.append("items", JSON.stringify(items));
      formData.append("totalEstimate", total);

      if (form.logoFile) {
        formData.append("logo", form.logoFile);
      } else if (form.logo) {
        formData.append("logo", form.logo);
      }

      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API}/${editId}` : API;

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
        body: formData,
      });

      if (res.ok) {
        Swal.fire("Success", editId ? "Updated Successfully" : "Saved Successfully", "success");
        setEditId(null);
        setForm({
          projectTitle: "",
          ownerName: "",
          location: "",
          plotArea: "",
          notes: "",
          description: "",
          company: user.companyName || "Your Company",
          address: user.address || "Your Address",
          phone: user.phone || "Phone",
          logo: user.companyLogo || "",
          logoFile: null,
        });
        setItems([{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
        loadEstimates();
      } else {
        Swal.fire("Error", "Failed to save estimate", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("Error", "Error saving estimate", "error");
    }
  };

  /* ================= DELETE ================= */
  const deleteEstimate = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this estimate?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadEstimates();
        Swal.fire("Deleted!", "Estimate has been deleted.", "success");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error", "Error deleting estimate", "error");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (est) => {
    setEditId(est._id);
    setForm({
      projectTitle: est.projectTitle || "",
      ownerName: est.ownerName || "",
      location: est.location || "",
      plotArea: est.plotArea || "",
      notes: est.notes || "",
      description: est.description || "",
    });
    setItems(est.items || [{ sno: 1, desc: "", qty: "", unit: "", rate: "" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const filteredEstimates = estimates.filter((est) =>
    `${est.projectTitle} ${est.ownerName} ${est.totalEstimate} ${est.tenantId?.companyName || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  /* ================= PDF ================= */
  const generatePDF = (est = null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const addHeader = () => {
      // LEFT: LOGO
      if (form.logo) {
        try {
          doc.addImage(form.logo, "JPEG", 15, 10, 22, 22);
        } catch (e) {
          console.error("PDF Logo Error:", e);
        }
      }

      // CENTER: COMPANY DETAILS
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); 
      doc.text(form.company.toUpperCase(), pageWidth / 2, 15, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Architects, Interior Designers, Planners", pageWidth / 2, 20, { align: "center" });
      
      const splitAddress = doc.splitTextToSize(form.address, 100);
      doc.text(splitAddress, pageWidth / 2, 24, { align: "center" });

      // RIGHT: OWNER/ARCHITECT INFO
      if (form.sellerName) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(form.sellerName.toUpperCase(), pageWidth - 15, 15, { align: "right" });
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        if (form.specialization) doc.text(form.specialization, pageWidth - 15, 20, { align: "right" });
        if (form.regNo) doc.text(`Reg No: ${form.regNo}`, pageWidth - 15, 24, { align: "right" });
      }

      doc.setDrawColor(0, 0, 0);
      doc.line(15, 35, pageWidth - 15, 35);
    };

    addHeader();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("ESTIMATE / PROPOSAL", pageWidth / 2, 45, { align: "center" });

    autoTable(doc, {
      startY: 50,
      theme: "grid",
      head: [
        [
          {
            content: "Project Details",
            colSpan: 4,
            styles: {
              halign: "left",
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
            },
          },
        ],
      ],
      body: [
        [
          "Project Title:",
          { content: form.projectTitle || "-", styles: { fontStyle: "bold" } },
          "Owner Name:",
          form.ownerName || "-",
        ],
        [
          "Location:",
          form.location || "-",
          "Plot Area:",
          form.plotArea ? `${form.plotArea} Sq.Ft` : "-",
        ],
        [
          "Total Estimated Amount:",
          {
            content: `Rs. ${total.toLocaleString("en-IN")}`,
            colSpan: 3,
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      styles: { fontSize: 9, textColor: [0, 0, 0], lineColor: [200, 200, 200] },
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    if (form.description) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Introduction:", 15, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitDesc = doc.splitTextToSize(form.description, pageWidth - 30);
      doc.text(splitDesc, 15, currentY + 6);
      currentY += splitDesc.length * 4.5 + 10;
    }

    const tableData = items.map((row) => [
      row.sno,
      row.desc,
      row.qty,
      row.unit,
      row.rate,
      (Number(row.qty) * Number(row.rate)).toLocaleString("en-IN"),
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: "grid",
      head: [["No.", "Description", "Qty", "Unit", "Rate (Rs)", "Amount (Rs)"]],
      body: tableData,
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8.5,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
      },
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `GRAND TOTAL: Rs. ${total.toLocaleString("en-IN")}`,
      pageWidth - 20,
      finalY + 12,
      { align: "right" },
    );

    if (form.notes) {
      doc.text("Notes:", 15, finalY + 25);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(form.notes, pageWidth - 30);
      doc.text(splitNotes, 15, finalY + 31);
    }

    doc.save(`Estimate_${form.projectTitle || "Project"}.pdf`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox
        pt={6}
        pb={3}
        px={3}
        sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}
      >
        <Grid container spacing={3}>
          {/* ================= QUICK STATS (COLORFUL) ================= */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #1A73E8 0%, #0d47a1 100%)",
                boxShadow: "0 10px 20px rgba(26, 115, 232, 0.2)",
              }}
            >
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox
                  bgcolor="rgba(255,255,255,0.2)"
                  color="white"
                  borderRadius="lg"
                  p={2}
                >
                  <AssignmentIcon fontSize="medium" />
                </MDBox>
                <Box>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="white"
                    sx={{ textTransform: "uppercase", opacity: 0.8 }}
                  >
                    Total Estimates
                  </MDTypography>
                  <MDTypography variant="h4" fontWeight="bold" color="white">
                    {estimates.length}
                  </MDTypography>
                </Box>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #4CAF50 0%, #1b5e20 100%)",
                boxShadow: "0 10px 20px rgba(76, 175, 80, 0.2)",
              }}
            >
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox
                  bgcolor="rgba(255,255,255,0.2)"
                  color="white"
                  borderRadius="lg"
                  p={2}
                >
                  <BusinessIcon fontSize="medium" />
                </MDBox>
                <Box>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="white"
                    sx={{ textTransform: "uppercase", opacity: 0.8 }}
                  >
                    Pipeline Value
                  </MDTypography>
                  <MDTypography variant="h4" fontWeight="bold" color="white">
                    Rs. {total.toLocaleString("en-IN")}
                  </MDTypography>
                </Box>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #FF9800 0%, #e65100 100%)",
                boxShadow: "0 10px 20px rgba(255, 152, 0, 0.2)",
              }}
            >
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox
                  bgcolor="rgba(255,255,255,0.2)"
                  color="white"
                  borderRadius="lg"
                  p={2}
                >
                  <AspectRatioIcon fontSize="medium" />
                </MDBox>
                <Box>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="white"
                    sx={{ textTransform: "uppercase", opacity: 0.8 }}
                  >
                    Avg. Size
                  </MDTypography>
                  <MDTypography variant="h4" fontWeight="bold" color="white">
                    Rs.{" "}
                    {estimates.length
                      ? Math.round(
                        estimates.reduce(
                          (s, e) => s + (e.totalEstimate || 0),
                          0,
                        ) / estimates.length,
                      ).toLocaleString("en-IN")
                      : 0}
                  </MDTypography>
                </Box>
              </MDBox>
            </Card>
          </Grid>

          {/* ================= ACTION HEADER (COLORFUL) ================= */}
          <Grid item xs={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={3}
              sx={{
                background: "linear-gradient(90deg, #1e293b 0%, #334155 100%)",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <MDTypography variant="h4" fontWeight="bold" color="white">
                Estimate Studio
              </MDTypography>
              <MDBox display="flex" gap={2}>
                <MDButton
                  variant="gradient"
                  color="light"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={generatePDF}
                >
                  Download PDF
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="info"
                  startIcon={<SaveIcon />}
                  onClick={saveEstimate}
                >
                  Save Proposal
                </MDButton>
              </MDBox>
            </MDBox>
          </Grid>

          {/* ================= LEFT: PROJECT INFO ================= */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: "16px", overflow: "hidden", mb: 3 }}>
              <MDBox p={3} sx={{ background: "#1e293b" }} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" fontWeight="bold" color="white">
                  Seller Profile
                </MDTypography>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="est-logo-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setForm({ ...form, logoFile: file, logo: URL.createObjectURL(file) });
                      }
                    }}
                  />
                  <label htmlFor="est-logo-upload">
                    <MDButton component="span" variant="contained" color="dark" size="small">
                      Change Logo
                    </MDButton>
                  </label>
                </Box>
              </MDBox>
              <MDBox p={3} display="flex" flexDirection="column" gap={2}>
                <MDBox display="flex" justifyContent="center" mb={1}>
                  <MDBox sx={{ border: "1px solid #ddd", p: 1, borderRadius: "8px", height: "100px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", bgcolor: "#f8f9fa" }}>
                    {form.logo ? <img src={form.logo} alt="logo" style={{ maxHeight: "100%", maxWidth: "100%" }} /> : <MDTypography variant="caption">No Logo</MDTypography>}
                  </MDBox>
                </MDBox>
                <TextField label="Company" fullWidth value={form.company} disabled />
                <TextField label="Address" fullWidth value={form.address} disabled multiline rows={2} />
                <TextField label="Phone" fullWidth value={form.phone} disabled />
              </MDBox>
            </Card>

            <Card sx={{ borderRadius: "16px", overflow: "hidden" }}>
              <MDBox p={3} sx={{ background: "#1e293b" }}>
                <MDTypography variant="h6" fontWeight="bold" color="white">
                  Project Scope
                </MDTypography>
              </MDBox>
              <MDBox p={3} display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="Project Title"
                  fullWidth
                  value={form.projectTitle}
                  onChange={(e) =>
                    setForm({ ...form, projectTitle: e.target.value })
                  }
                  inputProps={{ style: { color: "#000", fontWeight: 600 } }}
                />
                <TextField
                  label="Owner Name"
                  fullWidth
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                  inputProps={{ style: { color: "#000", fontWeight: 600 } }}
                />
                <TextField
                  label="Location"
                  fullWidth
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  inputProps={{ style: { color: "#000", fontWeight: 600 } }}
                />
                <TextField
                  label="Plot Area (Sq.Ft)"
                  fullWidth
                  value={form.plotArea}
                  onChange={(e) =>
                    setForm({ ...form, plotArea: e.target.value })
                  }
                  inputProps={{ style: { color: "#000", fontWeight: 600 } }}
                />
              </MDBox>
            </Card>
          </Grid>

          {/* ================= RIGHT: TABLE ================= */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: "16px", mb: 3, overflow: "hidden" }}>
              <MDBox
                p={2}
                sx={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}
              >
                <MDTypography variant="h6" fontWeight="bold" color="dark">
                  Introduction
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe the project overview..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  inputProps={{ style: { color: "#000" } }}
                />
              </MDBox>
            </Card>

            <Card sx={{ borderRadius: "16px", overflow: "hidden" }}>
              <MDBox
                p={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  background: "linear-gradient(90deg, #1A73E8, #0d47a1)",
                  color: "#white",
                }}
              >
                <MDTypography variant="h6" fontWeight="bold" color="white">
                  Itemized Breakdown
                </MDTypography>
                <MDBox
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    px: 2,
                    py: 0.5,
                    borderRadius: "10px",
                  }}
                >
                  <MDTypography variant="h5" fontWeight="bold" color="white">
                    Total: Rs. {total.toLocaleString("en-IN")}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox p={0}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ display: "table-header-group" }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          S.No
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            width: "40%",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          Description
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            textAlign: "center",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          Qty
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            textAlign: "center",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          Unit
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            textAlign: "right",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          Rate (Rs)
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            bgcolor: "#f1f5f9",
                            textAlign: "right",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          Amount (Rs)
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                          }}
                        ></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#000",
                              border: "1px solid #e2e8f0",
                              textAlign: "center",
                            }}
                          >
                            {row.sno}
                          </TableCell>
                          <TableCell sx={{ p: 1, border: "1px solid #e2e8f0" }}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="standard"
                              value={row.desc}
                              onChange={(e) =>
                                handleChange(i, "desc", e.target.value)
                              }
                              InputProps={{ disableUnderline: true }}
                              inputProps={{
                                style: {
                                  color: "#000",
                                  fontSize: "13px",
                                  padding: "8px",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1, border: "1px solid #e2e8f0" }}>
                            <TextField
                              type="number"
                              size="small"
                              variant="standard"
                              value={row.qty}
                              onChange={(e) =>
                                handleChange(i, "qty", e.target.value)
                              }
                              InputProps={{ disableUnderline: true }}
                              inputProps={{
                                style: {
                                  color: "#000",
                                  fontSize: "13px",
                                  textAlign: "center",
                                  padding: "8px",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1, border: "1px solid #e2e8f0" }}>
                            <TextField
                              size="small"
                              variant="standard"
                              value={row.unit}
                              onChange={(e) =>
                                handleChange(i, "unit", e.target.value)
                              }
                              InputProps={{ disableUnderline: true }}
                              inputProps={{
                                style: {
                                  color: "#000",
                                  fontSize: "13px",
                                  textAlign: "center",
                                  padding: "8px",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1, border: "1px solid #e2e8f0" }}>
                            <TextField
                              type="number"
                              size="small"
                              variant="standard"
                              value={row.rate}
                              onChange={(e) =>
                                handleChange(i, "rate", e.target.value)
                              }
                              InputProps={{ disableUnderline: true }}
                              inputProps={{
                                style: {
                                  color: "#000",
                                  fontSize: "13px",
                                  textAlign: "right",
                                  padding: "8px",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "right",
                              color: "#000",
                              fontWeight: "bold",
                              border: "1px solid #e2e8f0",
                              pr: 2,
                            }}
                          >
                            {(row.qty * row.rate || 0).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <IconButton
                              color="error"
                              onClick={() => deleteRow(i)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <MDBox p={2} display="flex" justifyContent="center">
                  <MDButton
                    variant="contained"
                    color="dark"
                    startIcon={<AddCircleIcon />}
                    onClick={addRow}
                    sx={{ textTransform: "none" }}
                  >
                    Add Item
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>

            <Card
              sx={{
                mt: 3,
                borderRadius: "16px",
                borderLeft: "5px solid #1A73E8",
              }}
            >
              <MDBox p={3}>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  color="dark"
                  mb={1}
                >
                  Notes / T&C
                </MDTypography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  inputProps={{ style: { color: "#000" } }}
                />
              </MDBox>
            </Card>
          </Grid>

          {/* ================= HISTORY ================= */}
          <Grid item xs={12}>
            <Card sx={{ mt: 4, borderRadius: "16px", overflow: "hidden" }}>
              {/* HEADER */}
              <MDBox
                p={3}
                sx={{
                  background: "linear-gradient(90deg, #1e293b, #334155)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <MDTypography variant="h5" fontWeight="bold" color="white">
                  Saved Estimates
                </MDTypography>

                {/* ✅ SEARCH BAR */}
                <TextField
                  placeholder="Search..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "8px",
                    width: { xs: "100%", sm: 250 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">🔍</InputAdornment>
                    ),
                  }}
                />
              </MDBox>

              {/* TABLE */}
              <MDBox pb={3}>
                <DataTable
                  table={{
                    columns: [
                      ...(user.role === "superadmin" ? [{
                        Header: "Tenant",
                        accessor: "tenantId.companyName",
                        width: "15%",
                        Cell: ({ value }) => (
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            {value || "System"}
                          </MDTypography>
                        ),
                      }] : []),
                      {
                        Header: "Project",
                        accessor: "projectTitle",
                        width: "20%",
                      },
                      { Header: "Client", accessor: "ownerName", width: "20%" },
                      {
                        Header: "Amount",
                        accessor: "totalEstimate",
                        width: "20%",
                        Cell: ({ value }) => (
                          <MDTypography
                            variant="button"
                            fontWeight="bold"
                            color="dark"
                          >
                            Rs. {value?.toLocaleString("en-IN")}
                          </MDTypography>
                        ),
                      },
                      {
                        Header: "Actions",
                        accessor: "actions",
                        Cell: ({ row }) => (
                          <MDBox display="flex" gap={1}>
                            <IconButton
                              color="info"
                              onClick={() => handleEdit(row.original)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => deleteEstimate(row.original._id)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="success"
                              onClick={() => generatePDF(row.original)}
                              fontSize="small"
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </MDBox>
                        ),
                      },
                    ],
                    rows: filteredEstimates,
                  }}
                  isSorted={true}
                  entriesPerPage={{
                    defaultValue: 5,
                    entries: [5, 10, 15, 20, 25],
                  }}
                  showTotalEntries={true}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
