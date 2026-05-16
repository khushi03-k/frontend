const projectDetailsDialog = (
  <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)} maxWidth="md" fullWidth>
    <DialogTitle>{selectedProject?.projectName}</DialogTitle>

    <DialogContent>
      {selectedProject && (
        <>
          {/* Images */}
          <Grid container spacing={2}>
            {selectedProject.images?.map((img, i) => (
              <Grid item xs={4} key={i}>
                <img
                  src={img}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {/* Details */}
          <MDBox mt={2}>
            <p>
              <b>Client:</b> {selectedProject.clientName}
            </p>
            <p>
              <b>Description:</b> {selectedProject.description}
            </p>
            <p>
              <b>Total:</b> ₹{selectedProject.totalAmount}
            </p>
            <p>
              <b>Paid:</b> ₹{selectedProject.advanceAmount}
            </p>
            <p>
              <b>Balance:</b> ₹{selectedProject.totalAmount - selectedProject.advanceAmount}
            </p>
          </MDBox>
        </>
      )}
    </DialogContent>
  </Dialog>
);
