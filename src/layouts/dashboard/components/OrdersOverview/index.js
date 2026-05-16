import { useEffect, useState } from "react";

// MUI
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Timeline
import TimelineItem from "examples/Timeline/TimelineItem";

function ProjectsOverview() {
  const [projects, setProjects] = useState([]);

  // =====================
  // LOAD PROJECTS
  // =====================

  useEffect(() => {
    const loadProjects = async () => {
      const res = await fetch("http://localhost:5000/api/projects");

      const data = await res.json();

      // latest 5 projects
      setProjects(data.slice(0, 5));
    };

    loadProjects();
  }, []);

  // =====================
  // UI
  // =====================

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Latest Projects
        </MDTypography>

        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text">
            <Icon
              sx={{
                color: ({ palette: { success } }) => success.main,
              }}
            >
              arrow_upward
            </Icon>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium" display="inline">
              {projects.length} new
            </MDTypography>
            &nbsp;projects
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox p={2}>
        {projects.map((p, i) => (
          <TimelineItem
            key={i}
            color="info"
            icon="work"
            title={p.projectName}
            dateTime={new Date(p.createdAt).toLocaleDateString()}
          />
        ))}
      </MDBox>
    </Card>
  );
}

export default ProjectsOverview;
