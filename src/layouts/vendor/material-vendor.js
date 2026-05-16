import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VerifiedIcon from "@mui/icons-material/Verified";
import EmailIcon from "@mui/icons-material/Email";
import MDBox from "components/MDBox";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Swal from "sweetalert2";

const AVATAR_COLORS = [
  "#fb923c",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#dc2626",
  "#0891b2",
];

function VendorList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const cleanCategory = categoryId?.trim().toLowerCase();

  const fetchVendors = useCallback(() => {
    if (!cleanCategory) return;
    fetch(`http://localhost:5000/api/vendors?category=${cleanCategory}`)
      .then((res) => res.json())
      .then((res) => setVendors(res.data || []))
      .catch((err) => console.log(err));
  }, [cleanCategory]);

  useEffect(() => {
    fetchVendors();

    const handleSearch = (e) => {
      setSearchQuery(e.detail.query.toLowerCase());
    };
    window.addEventListener("searchChanged", handleSearch);
    return () => window.removeEventListener("searchChanged", handleSearch);
  }, [fetchVendors]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this vendor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/vendors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchVendors();
        Swal.fire("Deleted!", "Vendor has been deleted.", "success");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.vendorName?.toLowerCase().includes(searchQuery) ||
    v.company?.toLowerCase().includes(searchQuery) ||
    v.tenantId?.companyName?.toLowerCase().includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox sx={{ pt: 6, pb: 4, px: 3 }}>

        {/* ========== HERO BANNER ========== */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background: "#f97316",
            color: "white",
            boxShadow: "0 20px 60px rgba(37, 99, 235, 0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <Box sx={{ position: "absolute", bottom: -50, left: "15%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3, position: "relative", zIndex: 1 }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                    px: 2, py: 0.8,
                    "&:hover": { background: "rgba(255,255,255,0.2)" }
                  }}
                >
                  Back
                </Button>
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ color: "#fff", letterSpacing: -1, textTransform: "capitalize", lineHeight: 1.1, mb: 0.5 }}>
                {categoryId}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                <PeopleAltIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />
                {filteredVendors.length} Premium Suppliers · Verified Vendors
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate(`/add-vendor/${categoryId}`)}
              sx={{
                background: "#1e293b",
                color: "#fff",
                fontWeight: "900",
                borderRadius: 4,
                px: 4,
                py: 2,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                "&:hover": { background: "#1e293b" }
              }}
            >
              + Register Supplier
            </Button>
          </Box>
        </Box>

        {/* ========== VENDOR GRID ========== */}
        <Grid container spacing={4}>
          {filteredVendors.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", py: 10 }}>
              <BusinessIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
              <Typography variant="h5" color="text.secondary" fontWeight="bold">No vendors found</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Click "Register Supplier" to add your first vendor
              </Typography>
            </Box>
          ) : (
            filteredVendors.map((v, idx) => {
              const colorSet = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <Grid item xs={12} sm={6} md={4} key={v._id}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 5,
                      border: "1px solid #f1f5f9",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Delete Button */}
                    <IconButton
                      onClick={(e) => handleDelete(e, v._id)}
                      sx={{
                        position: "absolute", top: 12, right: 12, zIndex: 10,
                        bgcolor: "#fff",
                        color: "#dc2626",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        width: 36, height: 36,
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    {/* Header banner */}
                    <Box
                      sx={{
                        height: 120,
                        background: v.image ? `url(${v.image}) center/cover no-repeat` : colorSet,
                        position: "relative",
                      }}
                    >
                      {!v.image && (
                        <Box sx={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <BusinessIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.4)" }} />
                        </Box>
                      )}
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          position: "absolute",
                          bottom: -28, left: 24,
                          width: 64, height: 64,
                          background: colorSet,
                          border: "4px solid #fff",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          fontSize: "1.6rem", fontWeight: "bold",
                        }}
                      >
                        {v.vendorName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </Box>

                    <CardContent sx={{ pt: 5, pb: 3, px: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="h5" fontWeight="900" sx={{ color: "#1e293b" }}>
                            {v.vendorName}
                          </Typography>
                          <VerifiedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: "bold", letterSpacing: 0.5 }}>
                            ID: {v._id?.slice(-8)?.toUpperCase()}
                          </Typography>
                          {JSON.parse(localStorage.getItem("user") || "{}").role === "superadmin" && (
                            <Chip 
                              label={v.tenantId?.companyName || "N/A"} 
                              size="small" 
                              sx={{ height: 20, fontSize: 10, bgcolor: "#f1f5f9", fontWeight: "bold" }} 
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, p: 0.7, display: "flex" }}>
                            <PhoneIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{v.phone || "N/A"}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ bgcolor: "#fef2f2", borderRadius: 2, p: 0.7, display: "flex" }}>
                            <EmailIcon sx={{ fontSize: 16, color: "#dc2626" }} />
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{v.email || "N/A"}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ bgcolor: "#f0fdf4", borderRadius: 2, p: 0.7, display: "flex" }}>
                            <BusinessIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>{v.company || "N/A"}</Typography>
                        </Box>
                      </Box>

                      {/* CTA Strip */}
                      <Box
                        sx={{
                          pt: 2,
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label="✓ Verified"
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                            color: "#15803d",
                            fontWeight: "900",
                            border: "1px solid #86efac",
                            borderRadius: "8px",
                          }}
                        />
                        <Button
                          size="small"
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                          onClick={() => navigate(`/vendor/${v._id}`)}
                          sx={{
                            background: "#2563eb",
                            color: "#fff",
                            fontWeight: "900",
                            borderRadius: 3,
                            px: 2.5,
                            py: 0.8,
                            textTransform: "none",
                            fontSize: "0.8rem",
                            boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
                            "&:hover": { background: "#2563eb" }
                          }}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default VendorList;
