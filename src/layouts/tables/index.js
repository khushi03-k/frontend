import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import useClientTableData from "layouts/tables/data/clientTableData";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";

function Tables() {
  const { columns, rows, dialog } = useClientTableData();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar pageTitle="Client Table" />

      <MDBox pt={6} pb={3} px={2}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, overflow: "hidden" }}>

              {/* Colored Header */}
              <Box sx={{
                mx: 2, mt: 0, py: 3, px: 4,
                background: "#1976d2",
                borderRadius: "16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 2,
                position: "relative", overflow: "hidden",
              }}>
                <Box sx={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

                <Box display="flex" alignItems="center" gap={2} sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: 2, p: 1, display: "flex" }}>
                    <PeopleIcon sx={{ color: "#fff", fontSize: 26 }} />
                  </Box>
                  <Typography variant="h5" fontWeight="900" sx={{ color: "#fff" }}>
                    Client Management
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/add-clients")}
                  sx={{
                    position: "relative", zIndex: 1,
                    borderRadius: "12px", textTransform: "none", fontWeight: "bold",
                    px: 3, py: 1.2,
                    background: "#1e293b",
                    color: "#fff",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    "&:hover": { background: "#334155", transform: "translateY(-2px)", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
                    transition: "all 0.25s",
                  }}
                >
                  Add Client
                </Button>
              </Box>

              {/* TABLE */}
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>

              {dialog}
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
