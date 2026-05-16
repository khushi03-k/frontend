import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Base_API = "https://backend-tlar.onrender.com/api";

function useVendorTableData() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "superadmin";

  useEffect(() => {
    fetch(`${Base_API}/vendors`)
      .then((res) => res.json())
      .then((data) => {
        const rawData = data.data || data;
        const formattedRows = rawData.map((v, i) => ({
          serial: (
            <Typography variant="caption" fontWeight="bold" sx={{ color: "#3b82f6" }}>
              {i + 1}
            </Typography>
          ),
          tenant: (
            <Typography variant="caption" fontWeight="bold" color="secondary">
              {v.tenantId?.companyName || "N/A"}
            </Typography>
          ),
          vendorName: (
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "#3b82f6", width: 24, height: 24, fontSize: 11, mr: 1 }}>
                {v.vendorName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="caption" fontWeight="bold">
                {v.vendorName}
              </Typography>
            </Box>
          ),
          phone: <Typography variant="caption">📞 {v.phone}</Typography>,
          email: <Typography variant="caption" color="text.secondary">{v.email}</Typography>,
          company: (
            <Chip
              label={v.company || "N/A"}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1.5, fontSize: "10px", height: "20px" }}
            />
          ),
          date: (
            <Box>
              <Typography variant="caption" fontWeight="bold" display="block">
                {new Date(v.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </Typography>
              <Typography variant="xxs" sx={{ fontSize: "10px", color: "text.secondary" }}>
                {new Date(v.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ),
          action: (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/vendor/${v._id}`)}
              sx={{ borderRadius: 1.5, textTransform: "none", py: 0.5, minHeight: 0, fontSize: "10px" }}
            >
              View
            </Button>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => {
        console.error("Vendor fetch error:", err);
        setRows([]);
      });
  }, [navigate]);

  const columns = [
    { Header: "S.No.", accessor: "serial", width: "5%" },
    ...(isSuperAdmin ? [{ Header: "Tenant", accessor: "tenant", width: "15%" }] : []),
    { Header: "Vendor", accessor: "vendorName", width: "20%" },
    { Header: "Phone", accessor: "phone", width: "15%" },
    { Header: "Email", accessor: "email", width: "15%" },
    { Header: "Company", accessor: "company", width: "20%" },
    { Header: "Registration", accessor: "date", width: "20%" },
    { Header: "Action", accessor: "action", width: "10%" },
  ];

  return {
    columns,
    rows,
    dialog: null,
  };
}

export default useVendorTableData;