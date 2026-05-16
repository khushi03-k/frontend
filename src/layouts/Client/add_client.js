import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

// Dashboard
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Footer from "examples/Footer";
import Swal from "sweetalert2";

function AddClient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    _id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    // project: "",
    // totalAmount: "",
    // advance: "",
    // balance: "",
  });

  // Handle input change + auto balance
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    if (name === "totalAmount" || name === "advance") {
      const total = Number(name === "totalAmount" ? value : form.totalAmount || 0);
      const adv = Number(name === "advance" ? value : form.advance || 0);
      updated.balance = total - adv;
    }

    setForm(updated);
  };

  // Load data for edit
  useEffect(() => {
    const data = localStorage.getItem("editClient");
    if (data) {
      setForm(JSON.parse(data));
    }
  }, []);

  // Save / update client
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.phone || !form.address) {
        Swal.fire("Warning", "Name, Phone and Address are required", "warning");
        return;
      }

      // CHECK UNIQUE NAME
      const resExisting = await fetch("https://backend-tlar.onrender.com/api/clients");
      const existingClients = await resExisting.json();

      const isDuplicate = existingClients.some(c =>
        (c.name || "").toLowerCase().trim() === (form.name || "").toLowerCase().trim() && c._id !== form._id
      );

      if (isDuplicate) {
        Swal.fire("Error", "A client with this name already exists. Please use a unique name.", "error");
        return;
      }

      if (form._id) {
        // Update client
        await fetch(`https://backend-tlar.onrender.com/api/clients/${form._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        Swal.fire("Success", "Client Updated", "success").then(() => navigate("/tables"));
      } else {
        // Add new client
        await fetch("https://backend-tlar.onrender.com/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        Swal.fire("Success", "Client Added", "success").then(() => navigate("/tables"));
      }

      localStorage.setItem("Client is Updated", Date.now());
      localStorage.removeItem("editClient");

    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                bgColor="info"
                variant="contained"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Add / Edit Client
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Client Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </Grid>

                  {/* <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Project"
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                    />
                  </Grid> */}

                  {/* <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      name="totalAmount"
                      type="number"
                      value={form.totalAmount}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Advance"
                      name="advance"
                      type="number"
                      value={form.advance}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Balance"
                      name="balance"
                      value={form.balance}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid> */}

                  <Grid item xs={12} display="flex" justifyContent="space-between">
                    <MDButton variant="contained" sx={{ bgcolor: "#1e293b", color: "#fff", "&:hover": { bgcolor: "#334155" } }} startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                      Back
                    </MDButton>
                    <MDButton variant="contained" sx={{ bgcolor: "#1e293b", color: "#fff", px: 4, "&:hover": { bgcolor: "#334155" } }} onClick={handleSubmit}>
                      Save Client
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default AddClient;
