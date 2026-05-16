import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect, Fragment, useCallback } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Swal from "sweetalert2";


import {
  Tabs,
  Tab,
  Grid,
  Button,
  Card,
  TextField,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import DownloadIcon from "@mui/icons-material/Download";

const Base_API = "http://localhost:5000/api";

function ProjectDetails() {
  const { state } = useLocation();
  const { id } = useParams();

  const [project, setProject] = useState(state || null);

  const [scopeData, setScopeData] = useState({
    projectType: "",
    workType: "",
    area: "",
    floors: "",
    conceptDesign: false,
    drawings2D: false,
    elevation3D: false,
    workingDrawings: false,
    interiorLayout: false,
    civil: false,
    electrical: false,
    plumbing: false,
    interiorExecution: false,
    supervision: false,
    revisions: "",
    timeline: "",
    costPerSqft: "",
    lumpSum: "",
    materialIncluded: false,
    notes: "",
  });

  const [scopeList, setScopeList] = useState([]);
  const [editScopeId, setEditScopeId] = useState(null);
  const [tab, setTab] = useState(0);

  // ================= LIGHTBOX STATE =================
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    zoom: 1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  });

  const [drawingType, setDrawingType] = useState(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [files, setFiles] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: "",
    note: "",
  });

  // ✅ MOVED HERE - All useState must be at the top before any useEffect

  // ================= LIGHTBOX FUNCTIONS =================
  const openLightbox = useCallback((imagesArray, clickedIndex) => {
    const imageOnly = imagesArray.filter(img =>
      typeof img === "string" && !img.startsWith("data:application/pdf") && !img.toLowerCase().includes(".pdf")
    );

    if (imageOnly.length === 0) return;

    const clickedImage = imagesArray[clickedIndex];
    const actualIndex = imageOnly.indexOf(clickedImage);
    const startIndex = actualIndex >= 0 ? actualIndex : 0;

    setLightbox({
      isOpen: true,
      images: imageOnly,
      currentIndex: startIndex,
      zoom: 1,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
    });
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      isOpen: false,
      zoom: 1,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    }));
    document.body.style.overflow = "auto";
  }, []);

  const lightboxNext = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
      zoom: 1,
      dragOffset: { x: 0, y: 0 },
    }));
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
      zoom: 1,
      dragOffset: { x: 0, y: 0 },
    }));
  }, []);

  const lightboxZoomIn = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.3, 3),
    }));
  }, []);

  const lightboxZoomOut = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.3, 0.5),
    }));
  }, []);

  const lightboxReset = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      zoom: 1,
      dragOffset: { x: 0, y: 0 },
    }));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox.isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowRight":
          lightboxNext();
          break;
        case "ArrowLeft":
          lightboxPrev();
          break;
        case "+":
        case "=":
          lightboxZoomIn();
          break;
        case "-":
          lightboxZoomOut();
          break;
        case "0":
          lightboxReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen, closeLightbox, lightboxNext, lightboxPrev, lightboxZoomIn, lightboxZoomOut, lightboxReset]);

  // Drag handlers for zoomed images
  const handleMouseDown = (e) => {
    if (lightbox.zoom <= 1) return;
    setLightbox(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: e.clientX - prev.dragOffset.x, y: e.clientY - prev.dragOffset.y },
    }));
  };

  const handleMouseMove = (e) => {
    if (!lightbox.isDragging) return;
    setLightbox(prev => ({
      ...prev,
      dragOffset: {
        x: e.clientX - prev.dragStart.x,
        y: e.clientY - prev.dragStart.y,
      },
    }));
  };

  const handleMouseUp = () => {
    setLightbox(prev => ({ ...prev, isDragging: false }));
  };

  const handleLightboxDownload = useCallback(() => {
    const img = lightbox.images[lightbox.currentIndex];
    if (!img) return;

    try {
      if (!img.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = img;
        link.download = `Drawing_${lightbox.currentIndex + 1}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const arr = img.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Drawing_${lightbox.currentIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not download image.", "error");
    }
  }, [lightbox.images, lightbox.currentIndex]);

  const fetchProjectById = useCallback(async (projectId) => {
    try {
      const res = await fetch(`${Base_API}/projects/${projectId}`);
      const data = await res.json();
      setProject({
        ...data,
        totalAmount: Number(data.totalAmount || 0),
      });
    } catch (err) {
      console.error("Failed to fetch project", err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t) setTab(parseInt(t));

    if (!project && id) {
      fetchProjectById(id);
    }
  }, [id, project, fetchProjectById]);

  // ================= FETCH =================
  const fetchProject = useCallback(async () => {
    if (!state?._id) return;

    const res = await fetch(`${Base_API}/projects/${state._id}`);
    const data = await res.json();

    setProject({
      ...data,
      totalAmount: Number(data.totalAmount || 0),
    });
  }, [state?._id]);

  const fetchScope = useCallback(async () => {
    if (!project?._id) return;

    const res = await fetch(`${Base_API}/projects/${project._id}/scope`);
    const data = await res.json();
    setScopeList(data || []);
  }, [project?._id]);

  const fetchDrawings = useCallback(async () => {
    if (!project?._id) return;

    try {
      const res = await fetch(`${Base_API}/projects/${project._id}/drawing`);
      const data = await res.json();
      setDrawings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("DRAWINGS ERROR:", err);
      setDrawings([]);
    }
  }, [project?._id]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!files.length || !uploadType) return;

    setLoading(true);

    try {
      const base64Images = await Promise.all(
        Array.from(files).map((file) => convertToBase64(file))
      );

      await fetch(`${Base_API}/projects/${project._id}/drawing/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: uploadType,
          images: base64Images,
        }),
      });

      await fetchDrawings();
      setOpenUpload(false);
      setFiles([]);
      Swal.fire("Success", `✓ ${files.length} file(s) uploaded successfully!`, "success");
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire("Error", "Failed to upload files. They might be too large. Try fewer files.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project?._id) {
      fetchScope();
    }
  }, [project?._id, fetchScope]);

  useEffect(() => {
    if (project?._id) {
      fetchDrawings();
    }
  }, [project?._id, fetchDrawings]);

  // ✅ AFTER ALL HOOKS - Early return is OK here
  if (!project?._id) return <div>Loading...</div>;

  // ================= PAYMENT =================
  const handleAddPayment = async () => {
    if (!paymentData.amount) return;

    setLoading(true);

    const payload = {
      amount: Number(paymentData.amount),
      date: paymentData.date || new Date().toISOString(),
      note: paymentData.note,
    };

    const res = await fetch(`${Base_API}/projects/${project._id}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const newPayment = data?.payment || data?.data || payload;

    setProject((prev) => ({
      ...prev,
      payments: [...(prev.payments || []), newPayment],
    }));

    setPaymentData({ amount: "", date: "", note: "" });
    setLoading(false);
    Swal.fire("Success", "Payment recorded successfully!", "success");
  };

  const sendWhatsAppSlip = (pay) => {
    const amount = Number(pay?.amount ?? pay?.payment?.amount ?? pay?.data?.amount ?? 0);
    const date = pay?.date || pay?.createdAt;
    const formattedDate = date ? new Date(date).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");

    let phone = project?.clientPhone || project?.phone;

    if (!phone) {
      Swal.fire("Warning", "Client phone number is missing in project data!", "warning");
      return;
    }

    let cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const text = `Hello ${project?.clientName || "Client"},\n\nWe have successfully received your payment of ₹${amount} on ${formattedDate} for the project "${project?.projectName}".\nThank you for your payment!`;

    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  // ================= DELETE IMAGE =================
  const handleDeleteImage = async (imgUrl) => {
    await fetch(`${Base_API}/projects/${project._id}/drawing/image`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: imgUrl,
        type: drawingType,
      }),
    });

    await fetchDrawings();
  };

  // ================= DRAWINGS DATA =================
  const civilImages = drawings.find((d) => d.type === "civil")?.images || [];
  const interiorImages = drawings.find((d) => d.type === "interior")?.images || [];
  const images = drawingType === "civil" ? civilImages : drawingType === "interior" ? interiorImages : [];

  // Legacy functions (removed to fix unused vars)

  // ================= SCOPE FUNCTIONS =================
  const handleAddScope = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${Base_API}/projects/${project._id}/scope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scopeData),
      });
      if (!res.ok) throw new Error("Failed");
      await fetchScope();
      resetScopeForm();
    } catch (err) {
      Swal.fire("Error", "Error saving scope", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScope = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${Base_API}/projects/${project._id}/scope/${editScopeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scopeData),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchScope();
      setEditScopeId(null);
      resetScopeForm();
    } catch (err) {
      Swal.fire("Error", "Error updating scope", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScope = async (scopeId) => {
    const result = await Swal.fire({
      title: "Delete Scope?",
      text: "Do you really want to delete this scope?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!"
    });
    if (!result.isConfirmed) return;

    try {
      await fetch(`${Base_API}/projects/${project._id}/scope/${scopeId}`, {
        method: "DELETE",
      });
      await fetchScope();
      Swal.fire("Deleted!", "Scope has been deleted.", "success");
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const resetScopeForm = () => {
    setScopeData({
      projectType: "", workType: "", area: "", floors: "",
      conceptDesign: false, drawings2D: false, elevation3D: false, workingDrawings: false,
      interiorLayout: false, civil: false, electrical: false, plumbing: false,
      interiorExecution: false, supervision: false, revisions: "", timeline: "",
      costPerSqft: "", lumpSum: "", materialIncluded: false, notes: "",
    });
  };

  if (!project) {
    return (
      <DashboardLayout>
        <DashboardNavbar pageTitle="Loading..." />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress color="info" />
        </MDBox>
      </DashboardLayout>
    );
  }

  // Helper function for opening media
  const handleOpenMedia = (dataUrl, imagesArray, index) => {
    const isPdf = typeof dataUrl === "string" && (
      dataUrl.startsWith("data:application/pdf") || dataUrl.toLowerCase().includes(".pdf")
    );

    if (isPdf) {
      try {
        if (!dataUrl.startsWith("data:")) {
          window.open(dataUrl, "_blank");
          return;
        }
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } catch (err) {
        window.open(dataUrl, "_blank");
      }
    } else {
      openLightbox(imagesArray, index);
    }
  };

  const handleDownloadMedia = (dataUrl, isPdf, i) => {
    try {
      if (!dataUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = isPdf ? `Document_${i}.pdf` : `Image_${i}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) { u8arr[n] = bstr.charCodeAt(n); }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = isPdf ? `Document_${i}.pdf` : `Image_${i}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      Swal.fire("Error", "Could not download file.", "error");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle={project.projectName} />

      <MDBox p={3}>
        {/* HEADER */}
        <Card sx={{
          p: 4, mb: 3, borderRadius: "20px", background: "#1e293b", color: "#fff",
          boxShadow: "0 15px 40px rgba(30,41,59,0.2)", position: "relative", overflow: "hidden",
        }}>
          <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox sx={{ position: "relative", zIndex: 1 }}>
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#fff", mb: 0.5 }}>
                {project.projectName}
              </MDTypography>
              <MDTypography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem" }}>
                CLIENT: <b style={{ color: "#10b981" }}>{project.clientName?.toUpperCase()} {project.clientId ? `(${project.clientId})` : ""}</b>
                <span style={{ marginLeft: "16px", opacity: 0.6 }}>PROJECT ID: <b>{project.projectId || project._id?.slice(-8)?.toUpperCase()}</b></span>
              </MDTypography>
            </MDBox>
            <MDBox sx={{
              position: "relative", zIndex: 1, bgcolor: "rgba(255,255,255,0.2)",
              p: 2, borderRadius: "15px", textAlign: "center", minWidth: "120px",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              <MDTypography variant="h4" fontWeight="bold" color="white">{project.visitCounter ?? 5}</MDTypography>
              <MDTypography variant="xxs" fontWeight="bold" color="white" sx={{ textTransform: "uppercase" }}>Visits Left</MDTypography>
            </MDBox>
          </MDBox>
        </Card>

        {/* TABS */}
        <Tabs value={tab} onChange={(e, v) => {
          setTab(v);
          const newUrl = new URL(window.location);
          newUrl.searchParams.set("tab", v);
          window.history.pushState({}, "", newUrl);
        }} sx={{
          mb: 1,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700, color: "#64748b", borderRadius: "10px", mx: 0.5, minHeight: "44px", px: 3, transition: "all 0.2s", "&:hover": { color: "#2563eb" } },
          "& .Mui-selected": { background: "#2563eb !important", color: "#fff !important", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" },
          "& .MuiTabs-indicator": { display: "none" },
        }}>
          <Tab label="📊 Overview" />
          <Tab label="🗂 Drawings" />
          <Tab label="💰 Accounts" />
          <Tab label="📋 Scope of Work" />
        </Tabs>

        {/* OVERVIEW */}
        {tab === 0 && (() => {
          const allImages = [
            ...(drawings.find(d => d.type === "civil")?.images || []),
            ...(drawings.find(d => d.type === "interior")?.images || []),
          ];
          return (
            <MDBox mt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 4, borderRadius: "20px", height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDBox display="flex" alignItems="center" mb={3} gap={1}>
                      <MDTypography variant="h5" fontWeight="bold" color="dark">Project Insight</MDTypography>
                    </MDBox>
                    <MDTypography variant="body1" sx={{ lineHeight: 1.8, color: "#475569", fontSize: "1rem", fontWeight: 400 }}>
                      {project.description || "No detailed description available for this project."}
                    </MDTypography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, borderRadius: "20px", background: "linear-gradient(135deg, #1e293b, #334155)", color: "#fff", height: "100%" }}>
                    <MDTypography variant="h6" fontWeight="bold" color="white" mb={2}>Project Pulse</MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6 }}>STATUS</MDTypography>
                        <Chip label={project.status || "Pending"} size="small" sx={{
                          bgcolor: project.status === "Completed" ? "#34d399" : project.status === "Running" ? "#3b82f6" : project.status === "Assigned" ? "#8b5cf6" : "#f59e0b",
                          color: "#fff", fontWeight: "bold"
                        }} />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6 }}>TOTAL BUDGET</MDTypography>
                        <MDTypography variant="h6" color="white" fontWeight="bold" sx={{ color: "#34d399" }}>₹{Number(project.totalAmount || 0).toLocaleString("en-IN")}</MDTypography>
                      </Box>
                      {(() => {
                        const totalPaid = Number(project.payments?.reduce((s, p) => s + (Number(p.amount || 0)), 0) || 0);
                        const totalAmt = Number(project.totalAmount || 0);
                        const balanceAmt = totalAmt - totalPaid;
                        const paidPct = totalAmt > 0 ? Math.min(100, Math.round((totalPaid / totalAmt) * 100)) : 0;
                        return (
                          <Box mt={1}>
                            <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold" }}>PAYMENT STATUS</MDTypography>
                            <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                              <MDBox sx={{ flex: 1, height: 8, bgcolor: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                                <MDBox sx={{ width: `${paidPct}%`, height: "100%", bgcolor: paidPct >= 100 ? "#34d399" : paidPct >= 50 ? "#3b82f6" : "#f59e0b", borderRadius: 4, transition: "width 0.5s ease" }} />
                              </MDBox>
                              <MDTypography variant="caption" color="white" fontWeight="bold">{paidPct}%</MDTypography>
                            </MDBox>
                            <MDBox display="flex" justifyContent="space-between" mt={1}>
                              <MDTypography variant="caption" sx={{ color: "#34d399", fontWeight: "bold" }}>Paid: ₹{totalPaid.toLocaleString("en-IN")}</MDTypography>
                              <MDTypography variant="caption" sx={{ color: balanceAmt > 0 ? "#f87171" : "#34d399", fontWeight: "bold" }}>
                                {balanceAmt > 0 ? `Due: ₹${balanceAmt.toLocaleString("en-IN")}` : "✓ Fully Paid"}
                              </MDTypography>
                            </MDBox>
                          </Box>
                        );
                      })()}
                      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", my: 1 }} />
                      <MDBox>
                        <MDTypography variant="caption" color="white" sx={{ opacity: 0.6, fontWeight: "bold" }}>RECORD VISIT</MDTypography>
                        <MDBox display="flex" gap={1} mt={1}>
                          <TextField size="small" placeholder="Visit note..." variant="outlined"
                            value={paymentData.visitNote || ""}
                            onChange={(e) => setPaymentData({ ...paymentData, visitNote: e.target.value })}
                            sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px", "& input": { color: "#fff", fontSize: "12px" }, "& fieldset": { border: "none" } }}
                          />
                          <Button variant="contained" size="small"
                            onClick={async () => {
                              if (!paymentData.visitNote) return Swal.fire("Warning", "Please add a note", "warning");
                              const res = await fetch(`${Base_API}/projects/${project._id}/visit`, {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ note: paymentData.visitNote })
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                setProject({ ...project, visitCounter: updated.visitCounter, visitNotes: updated.visitNotes });
                                setPaymentData({ ...paymentData, visitNote: "" });
                                Swal.fire("Success", "Visit recorded!", "success");
                              }
                            }}
                            sx={{ bgcolor: "#2563eb", color: "#fff", minWidth: "40px", borderRadius: "8px", "&:hover": { bgcolor: "#2563eb" } }}>+</Button>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>

                {/* SCOPE SUMMARY */}
                <Grid item xs={12}>
                  <Card sx={{ p: 4, borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDTypography variant="h5" fontWeight="bold" mb={2}>📋 Scope of Work Summary</MDTypography>
                    {scopeList.length > 0 ? (
                      <Grid container spacing={2}>
                        {scopeList.map((s, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <MDBox sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                              <MDTypography variant="button" fontWeight="bold" color="dark">{s.projectType} ({s.workType})</MDTypography>
                              <MDTypography variant="caption" display="block" color="text">Area: {s.area} sqft | Timeline: {s.timeline}</MDTypography>
                            </MDBox>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <MDBox sx={{ py: 3, textAlign: "center", bgcolor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                        <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>No Scope of Work defined yet.</MDTypography>
                      </MDBox>
                    )}
                  </Card>
                </Grid>

                {/* VISIT LOG */}
                <Grid item xs={12}>
                  <Card sx={{ p: 4, borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <MDTypography variant="h5" fontWeight="bold">🚗 Site Visit Log</MDTypography>
                      <MDBox sx={{ px: 2, py: 0.5, borderRadius: 10, bgcolor: "#eff6ff", border: "1px solid #dbeafe" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="info">{project.visitCounter ?? 5} VISITS REMAINING</MDTypography>
                      </MDBox>
                    </MDBox>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <th style={{ textAlign: "left", padding: "12px", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Visit Date</th>
                          <th style={{ textAlign: "left", padding: "12px", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Observation/Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(project.visitNotes || []).map((v, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "12px" }}>
                              <MDTypography variant="button" fontWeight="bold">{new Date(v.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</MDTypography>
                              <MDTypography variant="caption" display="block" color="text">{new Date(v.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</MDTypography>
                            </td>
                            <td style={{ padding: "12px" }}><MDTypography variant="caption" fontWeight="medium" color="text">{v.note}</MDTypography></td>
                          </tr>
                        ))}
                        {(project.visitNotes || []).length === 0 && (
                          <tr><td colSpan="2" style={{ padding: "30px", textAlign: "center" }}><MDTypography variant="caption" color="text">No visits recorded yet.</MDTypography></td></tr>
                        )}
                      </tbody>
                    </table>
                  </Card>
                </Grid>

                {/* GALLERY */}
                {allImages.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                      <Box sx={{ p: 3, background: "#2563eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <MDTypography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>🖼️ Project Drawings Gallery</MDTypography>
                        <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", px: 2, py: 0.5, borderRadius: 10 }}>
                          <MDTypography variant="caption" sx={{ color: "#fff", fontWeight: "bold" }}>
                            {drawings.find(d => d.type === "civil")?.images?.length || 0} Civil · {drawings.find(d => d.type === "interior")?.images?.length || 0} Interior
                          </MDTypography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", overflowX: "auto", gap: 2, p: 3, scrollbarWidth: "thin", scrollbarColor: "#f97316 #f1f5f9", "&::-webkit-scrollbar": { height: 6 }, "&::-webkit-scrollbar-track": { bgcolor: "#f1f5f9", borderRadius: 3 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#f97316", borderRadius: 3 } }}>
                        {allImages.map((img, idx) => {
                          const isPdf = typeof img === "string" && img.startsWith("data:application/pdf");
                          const isCivil = idx < (drawings.find(d => d.type === "civil")?.images?.length || 0);
                          return (
                            <Box key={idx} sx={{ minWidth: 220, maxWidth: 220, flexShrink: 0, borderRadius: "14px", overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.1)", transition: "all 0.3s", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 16px 35px rgba(0,0,0,0.15)" }, cursor: "pointer" }}
                              onClick={() => handleOpenMedia(img, allImages, idx)}>
                              {isPdf ? (
                                <Box sx={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fff7ed, #fed7aa)" }}>
                                  <Box sx={{ fontSize: 48 }}>📄</Box>
                                  <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#475569", mt: 1 }}>PDF</MDTypography>
                                </Box>
                              ) : (
                                <Box sx={{ position: "relative", overflow: "hidden" }}>
                                  <img src={img} alt={`img-${idx}`} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                                  <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.4))", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s", pointerEvents: "none" }}>
                                    <ZoomInIcon sx={{ color: "#fff", fontSize: 40 }} />
                                  </Box>
                                </Box>
                              )}
                              <Box sx={{ p: 1.5, background: isCivil ? "#fff7ed" : "#eff6ff", display: "flex", justifyContent: "center" }}>
                                <Box sx={{ px: 2, py: 0.3, borderRadius: 10, background: isCivil ? "#1e293b" : "#2563eb" }}>
                                  <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#fff", fontSize: "10px" }}>{isCivil ? "🏗️ CIVIL" : "🎨 INTERIOR"}</MDTypography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </MDBox>
          );
        })()}

        {/* DRAWINGS TAB */}
        {tab === 1 && (
          <MDBox mt={3}>
            {!drawingType ? (
              <Grid container spacing={4}>
                {[
                  { type: "civil", label: "Civil Drawings", desc: "Structural plans, layouts & blueprints", icon: "🏗️", grad: "#f97316", pdfSupport: true },
                  { type: "interior", label: "Interior Drawings", desc: "3D elevations, interior schematics", icon: "🎨", grad: "#2563eb", pdfSupport: false },
                ].map(({ type, label, desc, icon, grad, pdfSupport }) => (
                  <Grid item xs={12} md={6} key={type}>
                    <Card sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" } }}>
                      <Box sx={{ background: grad, p: 4, textAlign: "center" }}>
                        <Box sx={{ fontSize: 56, mb: 1 }}>{icon}</Box>
                        <MDTypography variant="h4" fontWeight="900" sx={{ color: "#fff", textTransform: "capitalize", mb: 0.5 }}>{label}</MDTypography>
                        <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", display: "block" }}>{desc}</MDTypography>
                      </Box>
                      <Box sx={{ p: 3, display: "flex", gap: 2, bgcolor: "#fff" }}>
                        <Button fullWidth variant="contained" onClick={() => { setUploadType(type); setOpenUpload(true); }}
                          sx={{ background: grad, color: "#fff", py: 1.5, borderRadius: "12px", fontWeight: "bold", textTransform: "none", boxShadow: "none", "&:hover": { background: grad, transform: "translateY(-2px)" }, transition: "all 0.25s" }}>
                          ⬆ Upload {pdfSupport ? "Images / PDF" : "Images"}
                        </Button>
                        <Button fullWidth variant="outlined" onClick={() => setDrawingType(type)}
                          sx={{ py: 1.5, borderRadius: "12px", fontWeight: "bold", textTransform: "none", border: "2px solid", borderColor: type === "civil" ? "#f97316" : "#2563eb", color: type === "civil" ? "#f97316" : "#2563eb", "&:hover": { background: "transparent", borderColor: type === "civil" ? "#f97316" : "#2563eb", transform: "translateY(-2px)" }, transition: "all 0.25s" }}>
                          🖼 View Gallery
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <MDBox>
                <Button onClick={() => setDrawingType(null)} sx={{ mb: 3, background: "#f97316", color: "#fff", px: 3, py: 1.2, borderRadius: "10px", fontWeight: "bold", textTransform: "none", "&:hover": { background: "#f97316" } }}>⬅ Back to Folders</Button>
                <Button onClick={() => { setUploadType(drawingType); setOpenUpload(true); }} sx={{ mb: 3, ml: 2, background: "#16a34a", color: "#fff", px: 3, py: 1.2, borderRadius: "10px", fontWeight: "bold", textTransform: "none", "&:hover": { background: "#16a34a" } }}>⬆ Upload More</Button>

                <Grid container spacing={3}>
                  {images.map((img, i) => {
                    const isPdf = typeof img === "string" && (img.startsWith("data:application/pdf") || img.toLowerCase().includes(".pdf"));
                    return (
                      <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)", transition: "all 0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" } }}>
                          {isPdf ? (
                            <Box onClick={() => handleOpenMedia(img, images, i)} sx={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fff7ed, #fed7aa)", cursor: "pointer" }}>
                              <Box sx={{ fontSize: 60 }}>📄</Box>
                              <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#f97316", mt: 1 }}>PDF Document</MDTypography>
                            </Box>
                          ) : (
                            <Box onClick={() => openLightbox(images, i)} sx={{ position: "relative", overflow: "hidden", cursor: "pointer", "&:hover .image-overlay": { opacity: 1 } }}>
                              <img src={img} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} alt={`drawing-${i}`} />
                              <Box className="image-overlay" sx={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s", pointerEvents: "none" }}>
                                <ZoomInIcon sx={{ color: "#fff", fontSize: 48 }} />
                              </Box>
                            </Box>
                          )}
                          <Box sx={{ p: 1.5, background: "#fff", display: "flex", gap: 1 }}>
                            <Button size="small" fullWidth onClick={() => handleDownloadMedia(img, isPdf, i)} sx={{ background: "#3b82f6", color: "#fff", fontWeight: "bold", borderRadius: "8px", textTransform: "none", boxShadow: "none", fontSize: "11px", "&:hover": { background: "#2563eb", boxShadow: "0 4px 14px rgba(37,99,235,0.4)", transform: "translateY(-1px)" }, transition: "all 0.2s" }}>⬇ Download</Button>
                            <Button size="small" fullWidth onClick={() => handleDeleteImage(img)} sx={{ background: "#ef4444", color: "#fff", fontWeight: "bold", borderRadius: "8px", textTransform: "none", boxShadow: "none", "&:hover": { background: "#dc2626", boxShadow: "0 4px 14px rgba(220,38,38,0.4)", transform: "translateY(-1px)" }, transition: "all 0.2s" }}>🗑 Delete</Button>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                  {images.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ py: 10, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 4, border: "2px dashed #e2e8f0" }}>
                        <Box sx={{ fontSize: 64 }}>🗂</Box>
                        <MDTypography variant="h6" sx={{ color: "#94a3b8", fontWeight: 600, mt: 1 }}>No {drawingType} drawings found</MDTypography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* ACCOUNTS TAB */}
        {tab === 2 && (
          <MDBox mt={3}>
            {(() => {
              const total = Number(project?.totalAmount || 0);
              const paid = (project?.payments || []).reduce((sum, p) => sum + Number(p?.amount ?? p?.payment?.amount ?? p?.data?.amount ?? 0), 0);
              const balance = total - paid;
              return (
                <>
                  <MDBox display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mb={3}>
                    {[
                      { label: "Total", value: total, color: "#1976d2" },
                      { label: "Paid", value: paid, color: "#2e7d32" },
                      { label: "Balance", value: balance, color: "#d32f2f" },
                    ].map((item, i) => (
                      <Card key={i} sx={{ p: 2, borderRadius: "15px", textAlign: "center", background: "#fff", border: `1px solid ${item.color}20`, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                        <MDTypography variant="caption" fontWeight="bold" sx={{ color: "#64748b" }}>{item.label?.toUpperCase()}</MDTypography>
                        <MDTypography variant="h5" fontWeight="bold" sx={{ color: item.color, mt: 0.5 }}>₹ {item.value.toLocaleString("en-IN")}</MDTypography>
                      </Card>
                    ))}
                  </MDBox>
                  <Card sx={{ p: 4, borderRadius: "20px", mb: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <MDTypography variant="h6" fontWeight="bold" mb={3}>Add New Transaction</MDTypography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Amount (₹)" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })} /></Grid>
                      <Grid item xs={12} md={3}><TextField fullWidth type="date" label="Payment Date" InputLabelProps={{ shrink: true }} value={paymentData.date} onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth label="Note / Description" value={paymentData.note} onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })} /></Grid>
                      <Grid item xs={12} md={2}>
                        <Button fullWidth variant="contained" onClick={handleAddPayment} sx={{ bgcolor: "#1e293b", color: "#fff", "&:hover": { bgcolor: "#1e293b" }, borderRadius: "8px", textTransform: "none", fontWeight: "bold" }}>
                          {loading ? <CircularProgress size={20} color="inherit" /> : "Save Payment"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                  <Card sx={{ p: 0, borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "20px", textAlign: "left", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Date</th>
                          <th style={{ padding: "20px", textAlign: "center", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                          <th style={{ padding: "20px", textAlign: "right", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Note</th>
                          <th style={{ padding: "20px", textAlign: "right", fontSize: "12px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(project?.payments || []).map((pay, i) => {
                          const amount = Number(pay?.amount ?? pay?.payment?.amount ?? pay?.data?.amount ?? 0);
                          const date = pay?.date || pay?.createdAt;
                          return (
                            <tr key={i} style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "16px 20px" }}><MDTypography variant="button" fontWeight="bold" sx={{ color: "#1e293b" }}>{date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</MDTypography></td>
                              <td style={{ padding: "16px 20px", textAlign: "center" }}><MDTypography variant="h6" fontWeight="bold" color="success">₹ {amount.toLocaleString("en-IN")}</MDTypography></td>
                              <td style={{ padding: "16px 20px", textAlign: "right" }}>{pay?.note ? <MDTypography variant="caption" sx={{ color: "#334155", fontWeight: 500 }}>{pay.note}</MDTypography> : "-"}</td>
                              <td style={{ padding: "16px 20px", textAlign: "right" }}><Button variant="contained" size="small" sx={{ bgcolor: "#25D366", color: "#fff", borderRadius: "8px", textTransform: "none", "&:hover": { bgcolor: "#25D366" } }} onClick={() => sendWhatsAppSlip(pay)}>WhatsApp Receipt</Button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </>
              );
            })()}
          </MDBox>
        )}

        {/* SCOPE TAB */}
        {tab === 3 && (
          <MDBox mt={3}>
            <Card sx={{ mb: 3, p: 4, borderRadius: "18px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid #eef2f6", background: "#fff" }}>
              <Box display="flex" alignItems="center" mb={3} gap={1}>
                <MDBox sx={{ width: 40, height: 40, borderRadius: "10px", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><MDTypography variant="h5" color="inherit">📋</MDTypography></MDBox>
                <MDTypography variant="h5" fontWeight="bold" sx={{ color: "#1e293b" }}>{editScopeId ? "Update Project Scope" : "Define New Scope"}</MDTypography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}><TextField label="Project Category" placeholder="e.g. Residential" fullWidth variant="standard" value={scopeData.projectType} onChange={(e) => setScopeData({ ...scopeData, projectType: e.target.value })} /></Grid>
                <Grid item xs={12} md={3}><TextField label="Work Nature" placeholder="e.g. Interior" fullWidth variant="standard" value={scopeData.workType} onChange={(e) => setScopeData({ ...scopeData, workType: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField label="Total Area" placeholder="sqft" type="number" fullWidth variant="standard" value={scopeData.area} onChange={(e) => setScopeData({ ...scopeData, area: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField label="Floors" type="number" fullWidth variant="standard" value={scopeData.floors} onChange={(e) => setScopeData({ ...scopeData, floors: e.target.value })} /></Grid>
                <Grid item xs={12} md={2}><TextField label="Timeline" placeholder="e.g. 4 Months" fullWidth variant="standard" value={scopeData.timeline} onChange={(e) => setScopeData({ ...scopeData, timeline: e.target.value })} /></Grid>
              </Grid>
              <MDBox mt={5}>
                <MDTypography variant="button" fontWeight="bold" color="text" mb={2} display="block" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>Scope Deliverables & Inclusions</MDTypography>
                <Grid container spacing={2}>
                  {[
                    { id: "conceptDesign", label: "Concept Design" }, { id: "drawings2D", label: "2D Drawings" }, { id: "elevation3D", label: "3D Elevation" }, { id: "workingDrawings", label: "Working Drawings" },
                    { id: "interiorLayout", label: "Interior Layout" }, { id: "civil", label: "Civil Construction" }, { id: "electrical", label: "Electrical" }, { id: "plumbing", label: "Plumbing" },
                    { id: "interiorExecution", label: "Execution" }, { id: "supervision", label: "Site Supervision" }, { id: "materialIncluded", label: "Material Included" },
                  ].map((item) => (
                    <Grid item xs={12} sm={4} md={3} key={item.id}>
                      <MDBox onClick={() => setScopeData({ ...scopeData, [item.id]: !scopeData[item.id] })} sx={{ p: 1.5, borderRadius: "10px", border: "1px solid", borderColor: scopeData[item.id] ? "#4f46e5" : "#e2e8f0", background: scopeData[item.id] ? "#f5f3ff" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 1, transition: "0.2s", "&:hover": { borderColor: "#4f46e5" } }}>
                        <MDBox sx={{ width: 20, height: 20, borderRadius: "4px", border: "2px solid", borderColor: scopeData[item.id] ? "#4f46e5" : "#cbd5e1", background: scopeData[item.id] ? "#4f46e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{scopeData[item.id] && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}</MDBox>
                        <MDTypography variant="caption" fontWeight={scopeData[item.id] ? "bold" : "medium"} color={scopeData[item.id] ? "info" : "text"}>{item.label}</MDTypography>
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
              <Grid container spacing={3} mt={2}><Grid item xs={12}><TextField label="Notes" multiline rows={2} placeholder="Specific requirements..." fullWidth value={scopeData.notes} onChange={(e) => setScopeData({ ...scopeData, notes: e.target.value })} /></Grid></Grid>
              <MDBox display="flex" justifyContent="flex-end" mt={4} gap={2}>
                {editScopeId && <Button variant="contained" sx={{ borderRadius: "10px", textTransform: "none", px: 4, bgcolor: "#64748b", color: "#fff", "&:hover": { bgcolor: "#475569" } }} onClick={() => { setEditScopeId(null); resetScopeForm(); }}>Cancel</Button>}
                <Button variant="contained" sx={{ px: 6, py: 1.5, borderRadius: "10px", textTransform: "none", fontWeight: "bold", background: "#1e293b", color: "#fff", boxShadow: "0 10px 25px rgba(30, 41, 59, 0.2)", "&:hover": { background: "#1e293b" } }} onClick={editScopeId ? handleUpdateScope : handleAddScope}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : (editScopeId ? "Update Specification" : "Finalize Scope")}
                </Button>
              </MDBox>
            </Card>
            <MDBox mt={6}>
              <Box display="flex" alignItems="center" mb={3} gap={1}>
                <MDTypography variant="h5" fontWeight="bold" color="dark">Scope Summary</MDTypography>
                <Chip label={scopeList.length} size="small" sx={{ bgcolor: "#eff6ff", color: "#2563eb", fontWeight: "bold" }} />
              </Box>
              {scopeList.length === 0 ? (
                <MDBox sx={{ p: 8, textAlign: "center", bgcolor: "#f8fafc", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
                  <MDTypography variant="h6" color="textSecondary">No active scope definitions found.</MDTypography>
                </MDBox>
              ) : (
                <Grid container spacing={4}>
                  {scopeList.map((s, i) => (
                    <Grid item xs={12} key={i}>
                      <Card sx={{ p: 0, borderRadius: "20px", boxShadow: "0 15px 35px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", background: "#fff", overflow: "hidden", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 20px 45px rgba(0,0,0,0.1)" } }}>
                        <Grid container>
                          <Grid item xs={12} md={4} sx={{ p: 4, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <MDBox>
                              <Chip label={s.workType} size="small" sx={{ bgcolor: "#1e293b", color: "#fff", fontWeight: "bold", mb: 2, borderRadius: "6px" }} />
                              <MDTypography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 1 }}>{s.projectType}</MDTypography>
                              <MDBox display="flex" gap={2}>
                                <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>📐 {s.area} SQFT</MDTypography>
                                <MDTypography variant="caption" sx={{ color: "#64748b", fontWeight: "bold" }}>🏢 {s.floors} FLOORS</MDTypography>
                              </MDBox>
                            </MDBox>
                            <MDBox mt={4}>
                              <MDTypography variant="caption" fontWeight="bold" color="text" sx={{ display: "block", mb: 1, textTransform: "uppercase" }}>Timeline</MDTypography>
                              <MDBox sx={{ p: 2, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}><MDTypography variant="caption" color="textSecondary" sx={{ fontWeight: "bold" }}>{s.timeline}</MDTypography></MDBox>
                            </MDBox>
                          </Grid>
                          <Grid item xs={12} md={8} sx={{ p: 4, position: "relative" }}>
                            <MDBox sx={{ position: "absolute", top: 15, right: 15, display: "flex", gap: 1 }}>
                              <IconButton sx={{ bgcolor: "#f1f5f9", color: "#64748b" }} onClick={() => { setScopeData(s); setEditScopeId(s._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><VisibilityIcon fontSize="small" /></IconButton>
                              <IconButton sx={{ bgcolor: "#fef2f2", color: "#ef4444" }} onClick={() => handleDeleteScope(s._id)}><DeleteIcon fontSize="small" /></IconButton>
                            </MDBox>
                            <MDTypography variant="button" fontWeight="bold" color="dark" sx={{ display: "block", mb: 3, textTransform: "uppercase" }}>Defined Deliverables</MDTypography>
                            <Grid container spacing={2}>
                              {[{ label: "Concept Design", val: s.conceptDesign }, { label: "2D Drawings", val: s.drawings2D }, { label: "3D Elevation", val: s.elevation3D }, { label: "Working Drawings", val: s.workingDrawings }, { label: "Interior Layout", val: s.interiorLayout }, { label: "Civil Works", val: s.civil }, { label: "Electrical", val: s.electrical }, { label: "Plumbing", val: s.plumbing }, { label: "Supervision", val: s.supervision }].filter(item => item.val).map((item, idx) => (
                                <Grid item xs={6} sm={4} key={idx}><MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}><MDBox sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1e293b" }} /><MDTypography variant="caption" sx={{ color: "#1e293b", fontWeight: "bold" }}>{item.label}</MDTypography></MDBox></Grid>
                              ))}
                            </Grid>
                            {s.notes && <MDBox mt={4} p={2} sx={{ bgcolor: "#fff7ed", borderRadius: "10px", borderLeft: "4px solid #f97316" }}><MDTypography variant="caption" sx={{ color: "#9a3412", fontWeight: "bold", display: "block", mb: 0.5 }}>Notes:</MDTypography><MDTypography variant="body2" sx={{ color: "#c2410c", fontSize: "13px", lineHeight: 1.6 }}>{s.notes}</MDTypography></MDBox>}
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </MDBox>
          </MDBox>
        )}
      </MDBox>

      {/* LIGHTBOX */}
      {lightbox.isOpen && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0, 0, 0, 0.95)", display: "flex", flexDirection: "column", animation: "fadeIn 0.2s ease-out", "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } } }}
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, px: 4, background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)", position: "relative", zIndex: 10 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <MDTypography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>{lightbox.currentIndex + 1} / {lightbox.images.length}</MDTypography>
              <Chip label={lightbox.zoom > 1 ? `${Math.round(lightbox.zoom * 100)}%` : "Fit"} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: "bold" }} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={lightboxZoomOut} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }} disabled={lightbox.zoom <= 0.5}><ZoomOutIcon /></IconButton>
              <IconButton onClick={lightboxReset} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><MDTypography variant="caption" sx={{ fontWeight: "bold" }}>1:1</MDTypography></IconButton>
              <IconButton onClick={lightboxZoomIn} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }} disabled={lightbox.zoom >= 3}><ZoomInIcon /></IconButton>
              <Box sx={{ width: 1, bgcolor: "rgba(255,255,255,0.2)", mx: 1 }} />
              <IconButton onClick={handleLightboxDownload} sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><DownloadIcon /></IconButton>
              <IconButton onClick={closeLightbox} sx={{ color: "#fff", bgcolor: "rgba(239, 68, 68, 0.8)", "&:hover": { bgcolor: "#ef4444" } }}><CloseIcon /></IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: lightbox.zoom > 1 ? (lightbox.isDragging ? "grabbing" : "grab") : "default" }}>
            <IconButton onClick={lightboxPrev} sx={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, color: "#fff", bgcolor: "rgba(0,0,0,0.5)", width: 56, height: 56, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ArrowBackIosIcon fontSize="large" /></IconButton>
            <Box onMouseDown={handleMouseDown} sx={{ transform: `scale(${lightbox.zoom}) translate(${lightbox.dragOffset.x / lightbox.zoom}px, ${lightbox.dragOffset.y / lightbox.zoom}px)`, transition: lightbox.isDragging ? "none" : "transform 0.2s ease-out", maxWidth: "90%", maxHeight: "90%" }}>
              <img src={lightbox.images[lightbox.currentIndex]} alt={`Drawing ${lightbox.currentIndex + 1}`} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px", boxShadow: "0 25px 80px rgba(0,0,0,0.5)", userSelect: "none" }} draggable={false} />
            </Box>
            <IconButton onClick={lightboxNext} sx={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, color: "#fff", bgcolor: "rgba(0,0,0,0.5)", width: 56, height: 56, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ArrowForwardIosIcon fontSize="large" /></IconButton>
          </Box>
          {lightbox.images.length > 1 && (
            <Box sx={{ p: 2, px: 4, background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)", position: "relative", zIndex: 10 }}>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center", overflowX: "auto", maxHeight: 80, py: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                {lightbox.images.map((img, idx) => (
                  <Box key={idx} onClick={() => setLightbox(prev => ({ ...prev, currentIndex: idx, zoom: 1, dragOffset: { x: 0, y: 0 } }))} sx={{ width: 60, height: 60, flexShrink: 0, borderRadius: "8px", overflow: "hidden", cursor: "pointer", border: idx === lightbox.currentIndex ? "3px solid #3b82f6" : "3px solid transparent", opacity: idx === lightbox.currentIndex ? 1 : 0.5, transition: "all 0.2s", "&:hover": { opacity: 1, transform: "scale(1.05)" } }}>
                    <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 1 }}>
                {[{ key: "←→", label: "Navigate" }, { key: "+-", label: "Zoom" }, { key: "0", label: "Reset" }, { key: "ESC", label: "Close" }].map((hint, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ px: 1, py: 0.2, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}><MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: "bold" }}>{hint.key}</MDTypography></Box>
                    <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>{hint.label}</MDTypography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* UPLOAD MODAL */}
      {openUpload && (
        <MDBox sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(8px)" }}>
          <Card sx={{ width: 420, borderRadius: "24px", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <Box sx={{ p: 3, background: uploadType === "civil" ? "#f97316" : "#2563eb", textAlign: "center" }}>
              <Box sx={{ fontSize: 40, mb: 0.5 }}>{uploadType === "civil" ? "🏗️" : "🎨"}</Box>
              <MDTypography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>Upload {uploadType === "civil" ? "Civil" : "Interior"} Drawings</MDTypography>
              <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>{uploadType === "civil" ? "Images & PDF supported" : "Images supported"}</MDTypography>
            </Box>
            <Box sx={{ p: 4 }}>
              <MDBox sx={{ p: 3, border: uploadType === "civil" ? "2px dashed #f97316" : "2px dashed #2563eb", borderRadius: "14px", background: uploadType === "civil" ? "#fff7ed" : "#eff6ff", cursor: "pointer", transition: "0.2s", textAlign: "center", "&:hover": { opacity: 0.85 } }}>
                <Box sx={{ fontSize: 36, mb: 1 }}>📁</Box>
                <input type="file" multiple accept={uploadType === "civil" ? "image/*,.pdf" : "image/*"} onChange={(e) => setFiles(e.target.files)} style={{ width: "100%", cursor: "pointer" }} />
                <MDTypography variant="caption" sx={{ display: "block", mt: 1, color: "#64748b" }}>{uploadType === "civil" ? "Images (PNG, JPG) or PDF files" : "Images (PNG, JPG, WEBP)"}</MDTypography>
              </MDBox>
              {files?.length > 0 && <Box sx={{ mt: 2, p: 2, bgcolor: "#f0fdf4", borderRadius: 3, border: "1px solid #bbf7d0" }}><MDTypography variant="caption" sx={{ color: "#16a34a", fontWeight: "bold" }}>✓ {files.length} file(s) selected</MDTypography></Box>}
              <Button onClick={handleUpload} fullWidth sx={{ mt: 3, py: 1.5, borderRadius: "12px", textTransform: "none", fontWeight: "bold", color: "#fff", background: uploadType === "civil" ? "#f97316" : "#2563eb", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", "&:hover": { opacity: 0.9, transform: "translateY(-2px)" }, transition: "all 0.25s" }}>
                {loading ? "Uploading... ⏳" : "⬆ Upload Files"}
              </Button>
              <Button onClick={() => { setOpenUpload(false); setFiles([]); }} fullWidth sx={{ mt: 1.5, textTransform: "none", color: "#64748b", fontWeight: 600, borderRadius: "10px", "&:hover": { bgcolor: "#f1f5f9" } }}>Cancel</Button>
            </Box>
          </Card>
        </MDBox>
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default ProjectDetails;