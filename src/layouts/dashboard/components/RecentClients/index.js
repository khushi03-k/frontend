import { useState } from "react";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DataTable from "examples/Tables/DataTable";

import data from "layouts/dashboard/components/RecentClients/data";

function RecentClients() {
  const { columns, rows } = data();

  const [menu, setMenu] = useState(null);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
      <MenuItem onClick={closeMenu}>View</MenuItem>
      <MenuItem onClick={closeMenu}>Edit</MenuItem>
      <MenuItem onClick={closeMenu}>Delete</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6">Recent Clients</MDTypography>

          <MDBox display="flex" alignItems="center">
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { success } }) => success.main,
              }}
            >
              person
            </Icon>

            <MDTypography variant="button" color="text">
              &nbsp;<strong>5 clients</strong> added recently
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox color="text" px={2}>
          <Icon fontSize="small" sx={{ cursor: "pointer" }} onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>

        {renderMenu}
      </MDBox>

      <MDBox>
        <DataTable
          table={{ columns, rows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

export default RecentClients;
