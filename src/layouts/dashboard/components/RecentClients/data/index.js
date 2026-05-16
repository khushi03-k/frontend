import { useEffect, useState } from "react";
import MDTypography from "components/MDTypography";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function useRecentClients(limit = 5) {
  const [rows, setRows] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const columns = [
    { Header: "Client", accessor: "name" },
    { Header: "Client ID", accessor: "clientId" },
    { Header: "Email", accessor: "email" },
    { Header: "Status", accessor: "status" },
  ];

  const handleStatusChange = async (id, value) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: value,
    }));

    await fetch("https://backend-tlar.onrender.com/api/clients/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: value,
      }),
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://backend-tlar.onrender.com/api/clients");

      const data = await res.json();

      // ✅ SAFETY CHECK: Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        setRows([]);
        return;
      }

      // ✅ SORT BY DATE (NEWEST FIRST)
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // ✅ TAKE RECENT 5
      const lastItems = limit ? sorted.slice(0, limit) : sorted;

      const formatted = lastItems.map((c) => {
        const currentStatus = statusMap[c._id] || c.status || "Active";

        const bg = currentStatus === "Active" ? "#4caf50" : "#f44336";

        return {
          name: <MDTypography variant="caption">{c.name}</MDTypography>,

          clientId: <MDTypography variant="caption">{c.clientId}</MDTypography>,

          email: <MDTypography variant="caption">{c.email}</MDTypography>,

          status: (
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(c._id, e.target.value)}
              sx={{
                fontSize: 12,
                height: 30,
                bgcolor: bg,
                color: "#fff",

                "& .MuiSelect-select": {
                  color: "#fff",
                },

                "& .MuiSvgIcon-root": {
                  color: "#fff",
                },
              }}
            >
              <MenuItem value="Active">Active</MenuItem>

              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          ),
        };
      });

      setRows(formatted);
    };

    fetchData();
  }, [limit, statusMap]);

  return { columns, rows };
}
