import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Card,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import go2webLogo from "assets/images/logo.png";

import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice as apiDeleteInvoice,
} from "./api/invoiceApi";
import Swal from "sweetalert2";



/* ================= PDF ================= */
const downloadPDF = async (el) => {
  if (!el) return Swal.fire("Error", "Invoice not ready", "error");
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#fff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("invoice.pdf");
};

/* ================= NUMBER TO WORD ================= */
const numberToWords = (num) => {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };
  return inWords(Math.floor(num)) + " Rupees Only";
};

/* ================= INVOICE COMPONENT ================= */
const Invoice = React.forwardRef(({ data, totals }, ref) => (
  <div ref={ref} style={styles.page}>
    <div style={styles.headerRow}>
      <div style={styles.headerLeft}>{data.logo && <img src={data.logo} alt="logo" style={styles.logo} crossOrigin="anonymous" />}</div>
      <div style={styles.headerCenter}><div style={styles.invoiceTitle}>TAX INVOICE</div></div>
      <div style={styles.headerRight}>
        <div style={styles.metaText}><b>Invoice No:</b> {data.invoiceNo}</div>
        <div style={styles.metaText}><b>Date:</b> {data.date ? new Date(data.date).toLocaleDateString("en-IN") : ""}</div>
      </div>
    </div>
    <div style={styles.flexRow}>
      <div style={styles.senderBox}><div style={styles.sectionTitle}>From</div><div style={styles.infoText}><b>{data.company}</b><br />{data.address}<br />Phone: {data.phone}<br />GSTIN: {data.gstin}</div></div>
      <div style={styles.receiverBox}><div style={styles.sectionTitle}>Bill To</div><div style={styles.infoText}><b>{data.billingName}</b><br />{data.email}<br />GSTIN: {data.billingGstin}</div></div>
    </div>
    <table style={styles.table}>
      <thead><tr><th style={styles.th}>Description</th><th style={styles.th}>HSN</th><th style={styles.th}>Qty</th><th style={styles.th}>Rate</th><th style={styles.th}>Amount</th></tr></thead>
      <tbody>
        {data.items.map((item, i) => (
          <tr key={i}><td style={styles.td}>{item.name}</td><td style={styles.td}>{item.hsn}</td><td style={styles.td}>{item.qty}</td><td style={styles.td}>₹{item.price}</td><td style={styles.td}>₹{item.qty * item.price}</td></tr>
        ))}
      </tbody>
    </table>
    <div style={styles.totalBox}>
      <div style={styles.totalRow}><span>Subtotal:</span><span>₹{totals.subtotal}</span></div>
      <div style={styles.totalRow}><span>GST:</span><span>₹{(Number(totals.sgst) + Number(totals.cgst)).toFixed(2)}</span></div>
      <div style={styles.finalTotal}><span>Grand Total:</span><span>₹{totals.total}</span></div>
    </div>
    <div style={styles.words}><b>Words:</b> {numberToWords(totals.total)}</div>
  </div>
));
Invoice.propTypes = { data: PropTypes.object.isRequired, totals: PropTypes.object.isRequired };

/* ================= MAIN COMPONENT ================= */
export default function InvoicePage() {
  const pdfRef = useRef();
  const navigate = useNavigate();

  // GET LOGGED IN USER DATA
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [invoices, setInvoices] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [data, setData] = useState({
    _id: null,
    logo: user.companyLogo || go2webLogo,
    billingName: "",
    email: "",
    company: user.companyName || "Your Company",
    address: user.address || "Your Address",
    gstin: user.gstNumber || "GSTIN",
    phone: user.phone || "Phone",
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    billingGstin: "",
    sgst: 9,
    cgst: 9,
    items: [{ name: "", hsn: "", qty: 1, price: 0 }]
  });

  const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const sgstAmount = (subtotal * data.sgst) / 100;
  const cgstAmount = (subtotal * data.cgst) / 100;
  const total = subtotal + sgstAmount + cgstAmount;
  const totals = { subtotal: subtotal.toFixed(2), sgst: sgstAmount.toFixed(2), cgst: cgstAmount.toFixed(2), total: total.toFixed(2) };

  const loadInvoices = useCallback(async () => {
    try {
      const response = await fetchInvoices(search, filter);
      if (response.success) {
        setInvoices(response.data);

        // AUTO GENERATE INVOICE NO PREVIEW (if not editing)
        if (!data._id && !data.invoiceNo) {
          const numbers = response.data.map(inv => {
            const match = inv.invoiceNo?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          }).filter(n => n > 0);

          const nextNo = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
          setData(prev => ({ ...prev, invoiceNo: `INV-${nextNo}` }));
        }
      }
    } catch (err) { console.error(err); }
  }, [search, filter, data._id, data.invoiceNo]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const handleSaveAndDownload = async () => {
    if (!data.billingName || !data.invoiceNo || !data.items[0].name) {
      Swal.fire("Warning", "Please fill in all mandatory fields: Billing Name, Invoice No, and at least one Item Name.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("invoiceName", data.billingName);
    formData.append("billingName", data.billingName);
    formData.append("email", data.email || "");
    formData.append("billingGstin", data.billingGstin || "");
    formData.append("clientGstin", data.billingGstin || ""); // For backend model
    formData.append("invoiceNo", data.invoiceNo);
    formData.append("date", data.date);
    formData.append("company", data.company);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("gstin", data.gstin);
    formData.append("sgst", data.sgst);
    formData.append("cgst", data.cgst);
    formData.append("items", JSON.stringify(data.items));
    formData.append("total", Number(totals.total));

    if (data.logoFile) {
      formData.append("logo", data.logoFile);
    } else if (data.logo) {
      formData.append("logo", data.logo);
    }

    try {
      let res = data._id
        ? await updateInvoice(data._id, formData)
        : await createInvoice(formData);

      if (res.success) {
        loadInvoices();
        // Update data with new logo URL if returned
        if (res.data.logo) {
          setData(prev => ({ ...prev, logo: res.data.logo }));
        }
        setTimeout(() => downloadPDF(pdfRef.current), 500);
        setData(prev => ({ ...prev, _id: null, billingName: "", invoiceNo: "" }));
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not save invoice", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    if (result.isConfirmed) {
      try { await apiDeleteInvoice(id); loadInvoices(); Swal.fire("Deleted!", "Invoice has been deleted.", "success"); } catch (err) { console.error(err); Swal.fire("Error", "Could not delete invoice.", "error"); }
    }
  };

  const handleDownloadExisting = async (inv) => {
    setData({ ...data, ...inv, billingName: inv.invoiceName, billingGstin: inv.clientGstin || inv.billingGstin });
    setTimeout(() => downloadPDF(pdfRef.current), 500);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={4} pb={3} px={3} sx={{ backgroundColor: "#f0f2f6", minHeight: "100vh" }}>
        <Grid container spacing={3}>
          {/* ================= STATS ================= */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "16px", background: "linear-gradient(135deg, #49a3f1 0%, #1A73E8 100%)", boxShadow: "0 8px 16px rgba(26, 115, 232, 0.2)" }}>
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox bgcolor="rgba(255,255,255,0.2)" color="white" borderRadius="lg" p={1.5}><ReceiptLongIcon fontSize="medium" /></MDBox>
                <Box><MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.8 }}>TOTAL INVOICES</MDTypography><MDTypography variant="h4" fontWeight="bold" color="white">{invoices.length}</MDTypography></Box>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "16px", background: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)", boxShadow: "0 8px 16px rgba(67, 160, 71, 0.2)" }}>
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox bgcolor="rgba(255,255,255,0.2)" color="white" borderRadius="lg" p={1.5}><AccountBalanceWalletIcon fontSize="medium" /></MDBox>
                <Box><MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.8 }}>TOTAL REVENUE</MDTypography><MDTypography variant="h4" fontWeight="bold" color="white">₹{invoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString("en-IN")}</MDTypography></Box>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, borderRadius: "16px", background: "linear-gradient(135deg, #EC407A 0%, #D81B60 100%)", boxShadow: "0 8px 16px rgba(216, 27, 96, 0.2)" }}>
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox bgcolor="rgba(255,255,255,0.2)" color="white" borderRadius="lg" p={1.5}><TrendingUpIcon fontSize="medium" /></MDBox>
                <Box><MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.8 }}>AVG. BILLING</MDTypography><MDTypography variant="h4" fontWeight="bold" color="white">₹{invoices.length ? Math.round(invoices.reduce((s, i) => s + (i.total || 0), 0) / invoices.length).toLocaleString("en-IN") : 0}</MDTypography></Box>
              </MDBox>
            </Card>
          </Grid>

          {/* ================= HEADER ================= */}
          <Grid item xs={12}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3} sx={{ background: "linear-gradient(90deg, #1e293b, #334155)", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <MDTypography variant="h4" fontWeight="bold" color="white">Billing Management</MDTypography>
              <MDButton variant="contained" color="info" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ "&:hover": { bgcolor: "#1A73E8" } }}>Back</MDButton>
            </MDBox>
          </Grid>

          {/* ================= FORM ================= */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: "16px", overflow: "hidden" }}>
              <MDBox p={3} sx={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
                <MDTypography variant="h6" fontWeight="bold" color="dark">Create / Edit Invoice</MDTypography>
              </MDBox>
              <MDBox p={4}>
                <Grid container spacing={3}>
                  {/* SELLER DETAILS (READ-ONLY) */}
                  <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6" fontWeight="bold">Seller Details (From Profile)</MDTypography>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="logo-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setData({ ...data, logoFile: file, logo: URL.createObjectURL(file) });
                          }
                        }}
                      />
                      <label htmlFor="logo-upload">
                        <MDButton component="span" variant="contained" color="dark" size="small" sx={{ "&:hover": { bgcolor: "#1e293b" } }}>
                          Upload Invoice Logo
                        </MDButton>
                      </label>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <MDBox sx={{ border: "1px solid #ddd", p: 1, borderRadius: "8px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {data.logo ? <img src={data.logo} alt="logo" style={{ maxHeight: "100%", maxWidth: "100%" }} /> : <MDTypography variant="caption">No Logo</MDTypography>}
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={3}><TextField fullWidth label="Company" value={data.company} disabled /></Grid>
                  <Grid item xs={12} sm={3}><TextField fullWidth label="GSTIN" value={data.gstin} disabled /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Address" value={data.address} disabled /></Grid>

                  <Grid item xs={12}><MDTypography variant="h6" fontWeight="bold" mt={2}>Recipient Details</MDTypography></Grid>
                  <Grid item xs={12} sm={4}><TextField required fullWidth label="Billing Name" variant="outlined" value={data.billingName} onChange={(e) => setData({ ...data, billingName: e.target.value })} inputProps={{ style: { color: '#000', fontWeight: 600 } }} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Email" variant="outlined" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="GSTIN" variant="outlined" value={data.billingGstin} onChange={(e) => setData({ ...data, billingGstin: e.target.value })} /></Grid>

                  <Grid item xs={12}><MDTypography variant="h6" fontWeight="bold" mt={2}>Invoice Details</MDTypography></Grid>
                  <Grid item xs={12} sm={3}><TextField required fullWidth label="Invoice No" value={data.invoiceNo} InputProps={{ readOnly: true }} helperText="Auto-generated" /></Grid>
                  <Grid item xs={12} sm={3}><TextField required fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} /></Grid>
                  <Grid item xs={12} sm={3}><TextField fullWidth label="SGST %" type="number" value={data.sgst} onChange={(e) => setData({ ...data, sgst: Number(e.target.value) })} /></Grid>
                  <Grid item xs={12} sm={3}><TextField fullWidth label="CGST %" type="number" value={data.cgst} onChange={(e) => setData({ ...data, cgst: Number(e.target.value) })} /></Grid>

                  <Grid item xs={12}>
                    <MDTypography variant="h6" fontWeight="bold" mt={2} mb={2}>Item Details</MDTypography>
                    {data.items.map((item, i) => (
                      <Grid container spacing={2} key={i} sx={{ mb: 2, alignItems: "center" }}>
                        <Grid item xs={12} sm={4}><TextField required fullWidth label="Item Name" size="small" value={item.name} onChange={(e) => { const items = [...data.items]; items[i].name = e.target.value; setData({ ...data, items }); }} /></Grid>
                        <Grid item xs={12} sm={2}><TextField fullWidth label="HSN" size="small" value={item.hsn} onChange={(e) => { const items = [...data.items]; items[i].hsn = e.target.value; setData({ ...data, items }); }} /></Grid>
                        <Grid item xs={12} sm={2}><TextField fullWidth label="Qty" type="number" size="small" value={item.qty} onChange={(e) => { const items = [...data.items]; items[i].qty = Number(e.target.value); setData({ ...data, items }); }} /></Grid>
                        <Grid item xs={12} sm={2}><TextField fullWidth label="Price" type="number" size="small" value={item.price} onChange={(e) => { const items = [...data.items]; items[i].price = Number(e.target.value); setData({ ...data, items }); }} /></Grid>
                        <Grid item xs={12} sm={2}><IconButton color="error" onClick={() => { const items = data.items.filter((_, idx) => idx !== i); setData({ ...data, items }); }} disabled={data.items.length === 1}><DeleteIcon /></IconButton></Grid>
                      </Grid>
                    ))}
                    <MDButton variant="text" color="info" startIcon={<AddIcon />} onClick={() => setData({ ...data, items: [...data.items, { name: "", hsn: "", qty: 1, price: 0 }] })} sx={{ "&:hover": { background: "transparent", color: "#1A73E8" } }}>Add Item</MDButton>
                  </Grid>
                </Grid>
                <Box mt={4} display="flex" justifyContent="space-between" alignItems="center" p={3} sx={{ bgcolor: "#f8f9fa", borderRadius: "12px" }}>
                  <MDTypography variant="h5" fontWeight="bold" color="dark">Total Amount: ₹{totals.total}</MDTypography>
                  <Box display="flex" gap={2}>
                    <Button variant="outlined" onClick={() => setPreviewOpen(true)} startIcon={<VisibilityIcon />} sx={{ color: "#000", borderColor: "#000", fontWeight: "bold", "&:hover": { background: "transparent", borderColor: "#000" } }}>Preview</Button>
                    <MDButton variant="contained" color="success" onClick={handleSaveAndDownload} startIcon={<DownloadIcon />} sx={{ "&:hover": { bgcolor: "#4CAF50" } }}>Save & Download</MDButton>
                  </Box>
                </Box>
              </MDBox>
            </Card>
          </Grid>

          {/* ================= SAVED ================= */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: "16px", overflow: "hidden" }}>
              <MDBox p={3} sx={{ background: "linear-gradient(90deg, #1e293b, #334155)" }} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h5" fontWeight="bold" color="white">All Invoices</MDTypography>
                <Box display="flex" gap={2}>
                  <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ bgcolor: "#fff", borderRadius: 1 }} />
                  <Select size="small" value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ bgcolor: "#fff", borderRadius: 1, minWidth: 120 }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="day">Today</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </Box>
              </MDBox>
              <MDBox pb={3}>
                <DataTable table={{
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
                    { Header: "Invoice No", accessor: "invoiceNo", width: "15%" },
                    { Header: "Recipient", accessor: "invoiceName", width: "30%" },
                    { Header: "Date", accessor: "date", width: "15%", Cell: ({ value, row }) => new Date(value || row.original.createdAt).toLocaleDateString() },
                    { Header: "Amount", accessor: "total", width: "15%", Cell: ({ value }) => <MDTypography variant="button" fontWeight="bold" color="success">₹{value?.toLocaleString("en-IN")}</MDTypography> },
                    {
                      Header: "Actions", accessor: "actions", Cell: ({ row }) => (
                        <Box display="flex" gap={1}>
                          <IconButton color="info" size="small" onClick={() => { setData({ ...data, ...row.original, billingName: row.original.invoiceName, date: new Date(row.original.date || row.original.createdAt).toISOString().split("T")[0] }); setPreviewOpen(true); }}><VisibilityIcon fontSize="small" /></IconButton>
                          <IconButton color="success" size="small" onClick={() => handleDownloadExisting(row.original)}><DownloadIcon fontSize="small" /></IconButton>
                          <IconButton color="error" size="small" onClick={() => handleDelete(row.original._id)}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      )
                    }
                  ],
                  rows: invoices
                }} entriesPerPage={{ defaultValue: 5 }} isSorted={true} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      {/* Dialogs */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth><DialogTitle>Preview</DialogTitle><DialogContent dividers sx={{ bgcolor: "#f5f5f5", display: "flex", justifyContent: "center", p: 4 }}><Paper elevation={3}><Invoice data={data} totals={totals} /></Paper></DialogContent><DialogActions><Button onClick={() => setPreviewOpen(false)}>Close</Button><MDButton variant="contained" color="success" onClick={() => { handleSaveAndDownload(); setPreviewOpen(false); }}>Save & Download</MDButton></DialogActions></Dialog>
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}><Invoice ref={pdfRef} data={data} totals={totals} /></div>
    </DashboardLayout>
  );
}
const styles = {
  page: { width: "210mm", minHeight: "297mm", padding: "50px", background: "#fff", fontFamily: "Inter, sans-serif", color: "#111" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "3px solid #e0e0e0", paddingBottom: "25px" },
  logo: { height: "70px", objectFit: "contain" },
  invoiceTitle: { fontSize: "24px", fontWeight: "900", color: "#000", letterSpacing: "1px" },
  metaText: { fontSize: "14px", marginBottom: "4px", fontWeight: "600" },
  flexRow: { display: "flex", justifyContent: "space-between", marginBottom: "30px" },
  senderBox: { width: "48%" },
  receiverBox: { width: "48%", textAlign: "right" },
  sectionTitle: { fontSize: "16px", fontWeight: "800", color: "#2c3e50", textTransform: "uppercase", marginBottom: "10px", borderBottom: "2px solid #3498db", display: "inline-block" },
  infoText: { fontSize: "14px", lineHeight: "1.6" },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "30px" },
  th: { borderBottom: "2px solid #bdc3c7", padding: "10px", background: "#f8f9fa", fontWeight: "900", textAlign: "left" },
  td: { borderBottom: "1px solid #ecf0f1", padding: "10px", fontSize: "14px" },
  totalBox: { width: "45%", marginLeft: "auto", background: "#f8f9fa", padding: "15px", borderRadius: "8px" },
  totalRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "600" },
  finalTotal: { display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "2px solid #bdc3c7", fontSize: "18px", fontWeight: "900" },
  words: { marginTop: "20px", fontSize: "12px", fontStyle: "italic", borderTop: "1px dashed #ccc", paddingTop: "10px" },
};
