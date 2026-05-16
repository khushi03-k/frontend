/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

// Overview page components
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

// Data
import profilesListData from "layouts/profile/data/profilesListData";

// Images
import homeDecor1 from "assets/images/home-decor-1.jpg";
import homeDecor2 from "assets/images/home-decor-2.jpg";
import homeDecor3 from "assets/images/home-decor-3.jpg";
import homeDecor4 from "assets/images/home-decor-4.jpeg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

import React, { useState, useEffect } from "react";
import { Grid, Card, TextField, Box, Icon, Divider } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "layouts/profile/components/Header";
import Swal from "sweetalert2";

function Overview() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    companyName: user.companyName || "",
    email: user.email || "",
    address: user.address || "",
    phone: user.phone || "",
    gstNumber: user.gstNumber || "",
    ownerName: user.ownerName || "",
    specialization: user.specialization || "",
    regNo: user.regNo || "",
    companyLogo: null,
    logoPreview: user.companyLogo || "",
  });

  const handleSave = async () => {
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'companyLogo' && form[key]) {
          formData.append(key, form[key]);
        } else if (key !== 'logoPreview' && key !== 'companyLogo') {
          formData.append(key, form[key]);
        }
      });

      const res = await fetch(`http://localhost:5000/api/auth/tenants/${user._id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${user.token}` },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        setIsEditing(false);
        Swal.fire("Success", "Profile updated successfully!", "success");
        window.location.reload(); // Refresh to sync everywhere
      } else {
        Swal.fire("Error", "Failed to update profile", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, borderRadius: "16px" }}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <MDTypography variant="h5" fontWeight="bold">Company Profile Settings</MDTypography>
                  <MDButton variant="gradient" color={isEditing ? "success" : "info"} onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    <Icon>{isEditing ? "save" : "edit"}</Icon>
                    &nbsp;{isEditing ? "Save Changes" : "Edit Profile"}
                  </MDButton>
                </MDBox>

                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" justifyContent="center">
                    <Box sx={{ textAlign: "center" }}>
                      <MDBox sx={{ border: "2px dashed #ddd", p: 1, borderRadius: "50%", height: "120px", width: "120px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", mb: 2, mx: "auto" }}>
                        {form.logoPreview ? <img src={form.logoPreview} alt="logo" style={{ maxHeight: "100%", maxWidth: "100%" }} /> : <Icon fontSize="large" color="disabled">business</Icon>}
                      </MDBox>
                      {isEditing && (
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if(file) setForm({...form, companyLogo: file, logoPreview: URL.createObjectURL(file)});
                        }} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Company Name" value={form.companyName} disabled={!isEditing} onChange={(e) => setForm({...form, companyName: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="GSTIN" value={form.gstNumber} disabled={!isEditing} onChange={(e) => setForm({...form, gstNumber: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Owner/Architect Name" value={form.ownerName} disabled={!isEditing} onChange={(e) => setForm({...form, ownerName: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Specialization (e.g. B.Arch)" value={form.specialization} disabled={!isEditing} onChange={(e) => setForm({...form, specialization: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Registration No." value={form.regNo} disabled={!isEditing} onChange={(e) => setForm({...form, regNo: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Phone" value={form.phone} disabled={!isEditing} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Email" value={form.email} disabled />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Address" multiline rows={3} value={form.address} disabled={!isEditing} onChange={(e) => setForm({...form, address: e.target.value})} />
                  </Grid>
                </Grid>
                
                <MDBox mt={4}>
                   <MDTypography variant="caption" color="text">
                     * These details will appear as fixed headers on all your Invoices and Estimates.
                   </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
