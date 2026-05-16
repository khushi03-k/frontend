import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import ProjectTables from "layouts/projectTables";
import Projects from "layouts/project";
import AddClients from "layouts/Client/add_client";
import Billing from "layouts/billing";
import VendorHome from "layouts/vendor";
import AddVendor from "layouts/vendor/add-vendor";
import VendorDetail from "layouts/vendor/vendor-detail";
import SignIn from "layouts/authentication/sign-in";
import ProjectDetails from "layouts/projectTables/data/project-details";
import MaterialVendor from "layouts/vendor/material-vendor";
import EstimatePage from "layouts/estimate";
import Tenants from "layouts/tenants";
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  {
    type: "route",
    name: "Add Clients",
    key: "add_clients",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/add-clients",
    component: <AddClients />,
  },

  {
    type: "collapse",
    name: "Clients",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },

  {
    type: "route",
    name: "Add Projects",
    key: "projects",
    icon: <Icon fontSize="small">store</Icon>,
    route: "/projects",
    component: <Projects />,
  },

  {
    type: "collapse",
    name: "Projects",
    key: "projectManagement",
    icon: <Icon fontSize="small">business_center</Icon>,
    route: "/projectTables",
    component: <ProjectTables />,

  },

  {
    type: "collapse",
    name: "Invoices",
    key: "billing",
    route: "/billing",
    component: <Billing />,
    icon: <Icon fontSize="small">receipt</Icon>,
  },



  {
    type: "route",
    name: "Project Details",
    key: "project-details",
    route: "/project-details/:id",
    component: <ProjectDetails />,
  },

  {
    type: "collapse",
    name: "Vendor",
    key: "vendor",
    icon: <Icon fontSize="small">store</Icon>,
    route: "/vendor",
    component: <VendorHome />, // ✅ Categories Page
  },

  // ✅ CATEGORY → ALL VENDORS
  {
    type: "route",
    name: "Vendor Category",
    key: "vendor-category",
    route: "/vendor/category/:categoryId",
    component: <MaterialVendor />, // reuse component
  },

  // ✅ SINGLE VENDOR DETAIL
  {
    type: "route",
    name: "Vendor Detail",
    key: "vendor-detail",
    route: "/vendor/:id",
    component: <VendorDetail />,
  },

  // ✅ ADD VENDOR
  {
    type: "route",
    name: "Add Vendor",
    key: "add-vendor",
    route: "/add-vendor/:category",
    component: <AddVendor />,
  },
  {
    type: "collapse",
    name: "Estimate",
    key: "estimate",
    icon: <Icon fontSize="small">receipt</Icon>,
    route: "/estimate",
    component: <EstimatePage />,
  },
  {
    type: "collapse",
    name: "Tenants",
    key: "tenants",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/tenants",
    component: <Tenants />,
    role: "superadmin",
  },
];

export default routes;
