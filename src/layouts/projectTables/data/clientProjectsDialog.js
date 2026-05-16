import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

const clientProjectsDialog = (
  <Dialog
    open={viewClientProjects.length > 0}
    onClose={() => setViewClientProjects([])}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>Client Projects</DialogTitle>

    <DialogContent>
      <Grid container spacing={2}>
        {viewClientProjects.map((p) => (
          <Grid item xs={12} md={4} key={p._id}>
            <Card
              sx={{ cursor: "pointer", p: 1 }}
              onClick={() => {
                setSelectedProject(p);
                setViewClientProjects([]);
              }}
            >
              <img src={p.images?.[0]} style={{ width: "100%", height: 120, objectFit: "cover" }} />
              <MDTypography variant="button">{p.projectName}</MDTypography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DialogContent>
  </Dialog>
);
