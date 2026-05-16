import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Swal from "sweetalert2";

function AddVendor() {
  const navigate = useNavigate();
  const { category } = useParams();

  // =====================
  // FORM STATE
  // =====================
  const [form, setForm] = useState({
    vendorName: "",
    phone: "",
    email: "",
    address: "",
    company: "",
    gst: "",
    status: "Active",
    note: "",
    category: "",
    materials: [],
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  // =====================
  // AUTO SET CATEGORY FROM URL
  // =====================
  useEffect(() => {
    if (category) {
      setForm((prev) => ({
        ...prev,
        category: category.toLowerCase(),
      }));
    }
  }, [category]);

  // =====================
  // FETCH CATEGORIES & CLIENTS
  // =====================
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [allVendors, setAllVendors] = useState([]);

  useEffect(() => {
    fetch("https://backend-tlar.onrender.com/api/vendor-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data))
      .catch((err) => console.log(err));

    fetch("https://backend-tlar.onrender.com/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.log(err));

    fetch("https://backend-tlar.onrender.com/api/vendors")
      .then((res) => res.json())
      .then((data) => setAllVendors(data.data || data))
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    setForm({
      ...form,
      materials: [...form.materials, { materialName: "", rate: "", quantity: "", clientId: "", clientName: "" }],
    });
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...form.materials];

    if (field === "clientId") {
      const client = clients.find(c => c.clientId === value);
      updated[index].clientId = value;
      updated[index].clientName = client?.name || "";
    } else {
      updated[index][field] = value;
    }

    // AUTO-CATEGORY & AUTO-FETCH LOGIC
    if (field === "materialName" && value) {
      // 1. Auto-Category
      const matchedCat = categories.find(
        (cat) => cat.name.toLowerCase() === value.toLowerCase()
      );
      if (matchedCat) {
        setForm((prev) => ({
          ...prev,
          category: matchedCat.name.toLowerCase(),
        }));
      }

      // 2. Auto-Fetch previous data (rate/client)
      const previousMat = allVendors
        .flatMap(v => v.materials || [])
        .find(m => m.materialName?.toLowerCase() === value.toLowerCase());

      if (previousMat) {
        updated[index].rate = previousMat.rate || "";
        updated[index].clientId = previousMat.clientId || "";
        updated[index].clientName = previousMat.clientName || "";
      }
    }

    setForm({ ...form, materials: updated });
  };

  const removeMaterial = (index) => {
    const updated = form.materials.filter((_, i) => i !== index);
    setForm({ ...form, materials: updated });
  };

  const handleSubmit = async () => {
    if (!form.vendorName || !form.phone || !form.category) {
      Swal.fire("Warning", "Vendor Name, Phone & Category required", "warning");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== "materials") {
        formData.append(key, form[key]);
      }
    });

    const cleanedMaterials = form.materials
      .filter((m) => m.materialName?.trim())
      .map((m) => ({
        ...m,
        rate: Number(m.rate) || 0,
        quantity: Number(m.quantity) || 0,
      }));
    formData.append("materials", JSON.stringify(cleanedMaterials));

    if (image) {
      formData.append("image", image);
    }

    try {
      await fetch(
        "https://backend-tlar.onrender.com/api/vendors",
        {
          method: "POST",
          body: formData,
        }
      );

      Swal.fire("Success", "Vendor Saved Successfully", "success").then(() => {
        navigate(`/vendor/category/${form.category}`);
      });
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3} px={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={11} lg={10}>
            <Card sx={{ p: 4, borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>

              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDTypography variant="h4" fontWeight="bold">
                    Vendor Registration
                  </MDTypography>
                  <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold", display: "block", mt: 0.5 }}>
                    Register a new verified supplier in the ecosystem
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" gap={2}>
                  <MDTypography variant="button" fontWeight="medium" color="text">
                    Section: <span style={{ color: "#3b82f6", textTransform: "capitalize" }}>{category || form.category}</span>
                  </MDTypography>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                      background: "#1e293b", color: "#fff", px: 4, py: 1.5,
                      fontWeight: "bold", textTransform: "none",
                      "&:hover": { background: "#1e293b" }
                    }}
                  >
                    Back
                  </Button>
                </MDBox>
              </MDBox>

              <Divider sx={{ mb: 4 }} />

              <Grid container spacing={3}>
                {/* PHOTO UPLOAD */}
                <Grid item xs={12} md={4}>
                  <MDBox
                    sx={{
                      border: "2px dashed #e2e8f0",
                      borderRadius: 4,
                      p: 3,
                      textAlign: "center",
                      bgcolor: "#f8fafc",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      '&:hover': { borderColor: "#3b82f6", bgcolor: "#f1f5f9" }
                    }}
                    onClick={() => document.getElementById("vendor-img").click()}
                  >
                    {preview ? (
                      <MDBox sx={{ position: "relative", width: 120, height: 120, mx: "auto" }}>
                        <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} alt="Vendor Preview" />
                      </MDBox>
                    ) : (
                      <MDBox>
                        <CloudUploadIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
                        <MDTypography variant="caption" fontWeight="bold" color="textSecondary" display="block">
                          Upload Photo
                        </MDTypography>
                      </MDBox>
                    )}
                    <input type="file" id="vendor-img" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImage(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }} />
                  </MDBox>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth required label="Vendor Name" name="vendorName" value={form.vendorName} onChange={handleChange} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth required label="Phone Number" name="phone" value={form.phone} onChange={handleChange} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Email ID" name="email" value={form.email} onChange={handleChange} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth required label="Category" name="category" value={form.category} onChange={handleChange} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Company Name" name="company" value={form.company} onChange={handleChange} variant="outlined" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="GSTIN" name="gst" value={form.gst} onChange={handleChange} variant="outlined" />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Address" name="address" value={form.address} onChange={handleChange} />
                </Grid>

                {/* MATERIALS SECTION */}
                <Grid item xs={12}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
                    <MDTypography variant="h5" fontWeight="bold">
                      Material List & Client Association
                    </MDTypography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={addMaterial} sx={{ bgcolor: "#10b981", color: "#fff", "&:hover": { bgcolor: "#10b981" } }}>
                      Add Material Row
                    </Button>
                  </MDBox>

                  {form.materials.map((mat, index) => (
                    <MDBox key={index} sx={{ mb: 2, p: 3, bgcolor: "#fff", border: "1px solid #f1f5f9", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <TextField fullWidth label="Material Name" value={mat.materialName} onChange={(e) => updateMaterial(index, "materialName", e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Select
                            fullWidth
                            value={mat.clientId || ""}
                            displayEmpty
                            onChange={(e) => updateMaterial(index, "clientId", e.target.value)}
                            sx={{ height: "45px" }}
                          >
                            <MenuItem value="" disabled>Associate Client</MenuItem>
                            {clients.map((c) => (
                              <MenuItem key={c._id} value={c.clientId}>{c.name} ({c.clientId})</MenuItem>
                            ))}
                          </Select>
                        </Grid>
                        <Grid item xs={5} md={2}>
                          <TextField fullWidth label="Rate" type="number" value={mat.rate} onChange={(e) => updateMaterial(index, "rate", e.target.value)} />
                        </Grid>
                        <Grid item xs={5} md={2}>
                          <TextField fullWidth label="Quantity" type="number" value={mat.quantity} onChange={(e) => updateMaterial(index, "quantity", e.target.value)} />
                        </Grid>
                        <Grid item xs={10} md={1.5}>
                          <MDTypography variant="caption" fontWeight="bold" sx={{ display: "block" }}>Total</MDTypography>
                          <MDTypography variant="subtitle1" fontWeight="bold" sx={{ color: "#f97316" }}>
                            ₹{(Number(mat.rate || 0) * Number(mat.quantity || 0)).toLocaleString("en-IN")}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={2} md={0.5}>
                          <IconButton onClick={() => removeMaterial(index)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </MDBox>
                  ))}
                </Grid>

                <Grid item xs={12} mt={2} display="flex" justifyContent="center">
                  <MDButton variant="contained" color="dark" size="large" onClick={handleSubmit} sx={{ px: 8, py: 1.5, "&:hover": { bgcolor: "#1e293b" } }}>
                    Register Vendor
                  </MDButton>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AddVendor;