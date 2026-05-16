import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import MDBox from "components/MDBox";
import Swal from "sweetalert2";

const ROW_COLORS = [
  { bg: "#fff7ed", border: "#fed7aa", rateColor: "#f97316" },
  { bg: "#eff6ff", border: "#bfdbfe", rateColor: "#2563eb" },
  { bg: "#f0fdf4", border: "#bbf7d0", rateColor: "#16a34a" },
];

function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  // Per-row editing: set of indices being edited
  const [editingRows, setEditingRows] = useState(new Set());
  const [clients, setClients] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [savingRow, setSavingRow] = useState(null);

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const fetchVendor = useCallback(() => {
    fetch(`http://localhost:5000/api/vendors/${id}`)
      .then((res) => res.json())
      .then((res) => { setVendor(res.data); setPreview(res.data.image || ""); })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    fetchVendor();
    fetch("http://localhost:5000/api/clients").then(res => res.json()).then(data => setClients(data));
    fetch("http://localhost:5000/api/vendors").then(res => res.json()).then(data => setAllVendors(data.data || data));
  }, [fetchVendor]);

  const convertToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result); reader.onerror = (err) => reject(err);
  });

  // ======= PROFILE UPDATE =======
  const handleProfileUpdate = async () => {
    let finalImage = vendor.image;
    if (image) finalImage = await convertToBase64(image);
    await fetch(`http://localhost:5000/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...vendor, image: finalImage, materials: JSON.stringify(vendor.materials) }),
    });
    setProfileEditMode(false); fetchVendor();
  };

  // ======= PER-ROW MATERIAL EDIT =======
  const updateMaterial = (index, field, value) => {
    const updated = [...vendor.materials];
    if (field === "clientId") {
      const client = clients.find(c => c.clientId === value);
      updated[index].clientId = value;
      updated[index].clientName = client?.name || "";
    } else {
      updated[index][field] = value;
    }
    if (field === "materialName" && value) {
      const prev = allVendors.flatMap(v => v.materials || []).find(m => m.materialName?.toLowerCase() === value.toLowerCase());
      if (prev) { updated[index].rate = prev.rate || ""; updated[index].clientId = prev.clientId || ""; updated[index].clientName = prev.clientName || ""; }
    }
    setVendor({ ...vendor, materials: updated });
  };

  const startEditRow = (index) => {
    const next = new Set(editingRows);
    next.add(index);
    setEditingRows(next);
  };

  const cancelEditRow = (index) => {
    const next = new Set(editingRows);
    next.delete(index);
    setEditingRows(next);
    fetchVendor(); // revert
  };

  // Save entire materials array (all changes at once)
  const saveRow = async (index) => {
    setSavingRow(index);
    await fetch(`http://localhost:5000/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...vendor, materials: JSON.stringify(vendor.materials) }),
    });
    const next = new Set(editingRows);
    next.delete(index);
    setEditingRows(next);
    setSavingRow(null);
    fetchVendor();
  };

  const deleteRow = async (index) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this material?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    const updated = vendor.materials.filter((_, i) => i !== index);
    await fetch(`http://localhost:5000/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...vendor, materials: JSON.stringify(updated) }),
    });
    fetchVendor();
    Swal.fire("Deleted!", "Material has been deleted.", "success");
  };

  // Add new row → immediately in edit mode
  const addMaterialRow = () => {
    const newMaterials = [...(vendor.materials || []), { materialName: "", rate: 0, quantity: 0, clientId: "", clientName: "" }];
    const newIndex = newMaterials.length - 1;
    setVendor({ ...vendor, materials: newMaterials });
    const next = new Set(editingRows);
    next.add(newIndex);
    setEditingRows(next);
  };

  const handleOpenWhatsApp = () => {
    let message = `*D DESIGN ARCHITECTS STUDIO*\n\nHello *${vendor.vendorName}*,\nMaterial Details:\n\n`;
    vendor.materials?.forEach((m, i) => { message += `${i + 1}. *${m.materialName}* - ₹${m.rate} (Qty: ${m.quantity})\n`; });
    setWhatsappMessage(message); setWhatsappOpen(true);
  };

  if (!vendor) return (
    <DashboardLayout><DashboardNavbar />
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="text.secondary">Loading vendor...</Typography>
      </Box>
    </DashboardLayout>
  );

  const totalValue = (vendor.materials || []).reduce((s, m) => s + (Number(m.rate || 0) * Number(m.quantity || 0)), 0);

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle={vendor.vendorName} />

      <MDBox sx={{ pt: 6, pb: 4, px: 3 }}>
        {/* ====== HERO ====== */}
        <Box sx={{
          mb: 4, p: { xs: 3, md: 4 }, borderRadius: 5,
          background: "#f97316",
          color: "#fff", boxShadow: "0 20px 60px rgba(249,115,22,0.3)",
          position: "relative", overflow: "hidden",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3,
        }}>
          <Box sx={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", letterSpacing: -1 }}>Vendor Profile</Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
              Supplier · {vendor.category?.toUpperCase() || "General"}
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}
            sx={{ position: "relative", zIndex: 1, bgcolor: "#1e293b", color: "#fff", borderRadius: 3, textTransform: "none", fontWeight: "bold", px: 3, py: 1.2, "&:hover": { bgcolor: "#1e293b" } }}>
            Back
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* ====== LEFT: PROFILE ====== */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 5, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
              <Box sx={{ height: 100, background: "#f97316", position: "relative" }}>
                <Avatar src={preview} sx={{
                  width: 100, height: 100, border: "5px solid #fff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  position: "absolute", bottom: -40, left: "50%", transform: "translateX(-50%)",
                  background: "#f97316", fontSize: "2.5rem", fontWeight: "bold",
                }}>
                  {vendor.vendorName?.charAt(0)}
                </Avatar>
              </Box>

              <Box sx={{ pt: 7, pb: 4, px: 4, textAlign: "center" }}>
                {!profileEditMode ? (
                  <>
                    <Typography variant="h4" fontWeight="900" sx={{ color: "#1e293b" }}>{vendor.vendorName}</Typography>
                    <Chip label={vendor.category?.toUpperCase() || "VENDOR"} size="small"
                      sx={{ mt: 1, background: "#f97316", color: "#fff", fontWeight: "bold" }} />
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {[
                        { icon: <PhoneIcon sx={{ fontSize: 18 }} />, val: vendor.phone, color: "#2563eb", bg: "#eff6ff" },
                        { icon: <EmailIcon sx={{ fontSize: 18 }} />, val: vendor.email || "N/A", color: "#16a34a", bg: "#f0fdf4" },
                        { icon: <BusinessIcon sx={{ fontSize: 18 }} />, val: vendor.company || "N/A", color: "#f97316", bg: "#fff7ed" },
                        { icon: <LocationOnIcon sx={{ fontSize: 18 }} />, val: vendor.address || "N/A", color: "#9333ea", bg: "#faf5ff" },
                      ].map((item, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={2}>
                          <Box sx={{ bgcolor: item.bg, color: item.color, borderRadius: 2.5, p: 1, display: "flex" }}>{item.icon}</Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{item.val}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2} textAlign="left">
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b", textAlign: "center" }}>Edit Profile</Typography>
                    {[
                      { label: "Vendor Name", key: "vendorName" },
                      { label: "Phone", key: "phone" },
                      { label: "Email", key: "email" },
                      { label: "Company", key: "company" },
                      { label: "Address", key: "address" },
                    ].map(f => (
                      <TextField key={f.key} fullWidth size="small" label={f.label} value={vendor[f.key] || ""}
                        onChange={e => setVendor({ ...vendor, [f.key]: e.target.value })}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                    ))}
                    <Box sx={{ mt: 1, border: "2px dashed #f97316", borderRadius: 3, p: 2, textAlign: "center", cursor: "pointer", bgcolor: "#fff7ed" }}
                      onClick={() => document.getElementById("vendor-img").click()}>
                      {preview ? <img src={preview} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8 }} alt="prev" /> : <Typography variant="caption" sx={{ color: "#f97316" }}>Click to change photo</Typography>}
                      <input type="file" id="vendor-img" hidden accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }} />
                    </Box>
                  </Box>
                )}

                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                  {!profileEditMode ? (
                    <Button fullWidth variant="contained" startIcon={<EditIcon />} onClick={() => setProfileEditMode(true)}
                      sx={{ background: "#60a5fa", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", py: 1.3, transition: "all 0.25s", boxShadow: "0 6px 20px rgba(37,99,235,0.3)", "&:hover": { background: "#60a5fa" } }}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={handleProfileUpdate}
                        sx={{ background: "#16a34a", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", py: 1.3, transition: "all 0.25s", boxShadow: "0 6px 20px rgba(22,163,74,0.3)", "&:hover": { background: "#16a34a" } }}>
                        Save
                      </Button>
                      <Button variant="contained" onClick={() => { setProfileEditMode(false); fetchVendor(); }}
                        sx={{ background: "#64748b", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", px: 2, "&:hover": { background: "#64748b" } }}>
                        <CancelIcon />
                      </Button>
                    </>
                  )}
                  <Button variant="contained"
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: "Delete Vendor?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Yes, delete!"
                      });
                      if (result.isConfirmed) {
                        await fetch(`http://localhost:5000/api/vendors/${id}`, { method: "DELETE" });
                        Swal.fire("Deleted!", "Vendor has been deleted.", "success").then(() => navigate("/vendor"));
                      }
                    }}
                    sx={{ background: "#dc2626", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", px: 2, minWidth: 0, boxShadow: "0 6px 20px rgba(220,38,38,0.3)", "&:hover": { background: "#dc2626" } }}>
                    <DeleteIcon />
                  </Button>
                </Box>

                <Button fullWidth variant="contained" startIcon={<WhatsAppIcon />} onClick={handleOpenWhatsApp}
                  sx={{ mt: 2, background: "#25D366", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", py: 1.3, transition: "all 0.25s", boxShadow: "0 6px 20px rgba(37,211,102,0.3)", "&:hover": { background: "#25D366" } }}>
                  WhatsApp Share
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* ====== RIGHT: MATERIALS ====== */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 5, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
              {/* Header */}
              <Box sx={{ p: 3, background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ bgcolor: "rgba(249,115,22,0.2)", borderRadius: 2, p: 1, display: "flex" }}>
                    <InventoryIcon sx={{ color: "#f97316", fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="900" sx={{ color: "#fff" }}>Material Breakdown</Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                      {vendor.materials?.length || 0} items · Total: ₹{totalValue.toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                </Box>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={addMaterialRow}
                  sx={{ background: "#fb923c", color: "#fff", borderRadius: 3, fontWeight: "bold", textTransform: "none", boxShadow: "0 6px 18px rgba(249,115,22,0.4)", transition: "all 0.25s", "&:hover": { background: "#fb923c" } }}>
                  Add Material
                </Button>
              </Box>

              {/* Material Rows */}
              <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                {(!vendor.materials || vendor.materials.length === 0) && (
                  <Box sx={{ py: 8, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 4, border: "2px dashed #e2e8f0" }}>
                    <InventoryIcon sx={{ fontSize: 60, color: "#e2e8f0", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight="bold">No materials yet</Typography>
                    <Typography variant="caption" color="text.secondary">Click "Add Material" to get started</Typography>
                  </Box>
                )}

                {vendor.materials?.map((m, i) => {
                  const c = ROW_COLORS[i % ROW_COLORS.length];
                  const isEditing = editingRows.has(i);
                  return (
                    <Box key={i} sx={{
                      p: 3, borderRadius: 4, background: c.bg, border: `1px solid ${c.border}`,
                      transition: "all 0.2s"
                    }}>
                      {!isEditing ? (
                        /* ---- VIEW MODE ---- */
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Material</Typography>
                            <Typography variant="h6" fontWeight="900" sx={{ color: "#1e293b" }}>{m.materialName || "—"}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Client</Typography>
                            <br />
                            <Chip label={m.clientName || "Direct"} size="small"
                              sx={{ background: "#60a5fa", color: "#fff", fontWeight: "bold", mt: 0.5 }} />
                          </Grid>
                          <Grid item xs={3} md={1.5}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Rate</Typography>
                            <Typography variant="h6" fontWeight="900" sx={{ color: c.rateColor }}>₹{Number(m.rate || 0).toLocaleString("en-IN")}</Typography>
                          </Grid>
                          <Grid item xs={3} md={1.5}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Qty</Typography>
                            <Typography variant="h6" fontWeight="900" sx={{ color: "#16a34a" }}>{m.quantity}</Typography>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Total</Typography>
                            <Typography variant="h6" fontWeight="900" sx={{ color: "#f97316" }}>₹{(Number(m.rate || 0) * Number(m.quantity || 0)).toLocaleString("en-IN")}</Typography>
                          </Grid>
                          <Grid item xs={12} md={1} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <IconButton size="small" onClick={() => startEditRow(i)}
                              sx={{ bgcolor: "#eff6ff", color: "#2563eb" }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteRow(i)}
                              sx={{ bgcolor: "#fef2f2", color: "#dc2626" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ) : (
                        /* ---- EDIT MODE ---- */
                        <Box>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: c.rateColor, textTransform: "uppercase", letterSpacing: 1, mb: 2, display: "block" }}>
                            ✏️ Editing Row {i + 1}
                          </Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                              <TextField fullWidth label="Material Name" value={m.materialName}
                                onChange={(e) => updateMaterial(i, "materialName", e.target.value)}
                                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Select fullWidth value={m.clientId || ""} displayEmpty
                                onChange={(e) => updateMaterial(i, "clientId", e.target.value)}
                                size="small" sx={{ borderRadius: 2 }}>
                                <MenuItem value="" disabled>Select Client</MenuItem>
                                {clients.map(c => <MenuItem key={c._id} value={c.clientId}>{c.name}</MenuItem>)}
                              </Select>
                            </Grid>
                            <Grid item xs={4} md={1.5}>
                              <TextField fullWidth type="number" label="Rate (₹)" value={m.rate}
                                onChange={(e) => updateMaterial(i, "rate", e.target.value)}
                                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={4} md={1.5}>
                              <TextField fullWidth type="number" label="Quantity" value={m.quantity}
                                onChange={(e) => updateMaterial(i, "quantity", e.target.value)}
                                size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={4} md={2}>
                                <Typography variant="caption" fontWeight="bold" sx={{ color: "#94a3b8", display: "block" }}>TOTAL</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#f97316" }}>₹{(Number(m.rate || 0) * Number(m.quantity || 0)).toLocaleString("en-IN")}</Typography>
                            </Grid>
                            <Grid item xs={12} md={2} sx={{ display: "flex", gap: 1 }}>
                              <Button fullWidth variant="contained" size="small" startIcon={<SaveIcon />}
                                onClick={() => saveRow(i)} disabled={savingRow === i}
                                sx={{ background: "#22c55e", color: "#fff", borderRadius: 2, fontWeight: "bold", textTransform: "none", "&:hover": { background: "#22c55e" } }}>
                                {savingRow === i ? "..." : "Save"}
                              </Button>
                              <IconButton size="small" onClick={() => cancelEditRow(i)}
                                sx={{ bgcolor: "#f1f5f9", color: "#64748b" }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* ====== WHATSAPP DIALOG ====== */}
      <Dialog open={whatsappOpen} onClose={() => setWhatsappOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
        <DialogTitle sx={{ background: "#25D366", color: "#fff", fontWeight: "bold" }}>
          <WhatsAppIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Send WhatsApp Message
        </DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth multiline rows={10} value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setWhatsappOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold", color: "#64748b" }}>
            Cancel
          </Button>
          <Button variant="contained"
            onClick={() => { window.open(`https://wa.me/91${vendor.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`, "_blank"); setWhatsappOpen(false); }}
            sx={{ background: "#25D366", color: "#fff", borderRadius: 2, fontWeight: "bold", textTransform: "none", px: 3 }}>
            Send on WhatsApp
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorDetail;
