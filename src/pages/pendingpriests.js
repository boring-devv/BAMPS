import { useState, useEffect } from "react";
import Head from "next/head";
import {
  Box,
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Button,
  Avatar,
  Pagination,
  Modal,
  Backdrop,
  Fade,
  Grid,
  Divider,
} from "@mui/material";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "src/Firebase.config";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { CustomersSearch } from "src/sections/customer/customers-search";

const Page = () => {
  const [priests, setPriests] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [open, setOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const priestsRef = collection(db, "members");
    const q = query(priestsRef, where("is_priest", "==", true), where("status", "==", "pending"));

    const unsub = onSnapshot(q, (snapshot) => {
      const priestsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPriests(priestsList);
    });

    return () => unsub();
  }, []);

  const handleOpen = (priest) => {
    setSelectedPriest(priest);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedPriest(null);
    setOpen(false);
  };

  const handleApprove = async () => {
    if (!selectedPriest) return;
    const docRef = doc(db, "members", selectedPriest.id);
    await updateDoc(docRef, { status: "approved" });
    alert("User verified successfully!");
    handleClose();
  };

  const filteredPriests = priests.filter(priest =>
    priest.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    priest.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    priest.pew?.toLowerCase().includes(search.toLowerCase()) ||
    priest.residing_state?.toLowerCase().includes(search.toLowerCase()) ||
    priest.email?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedPriests = filteredPriests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const DetailItem = ({ label, value }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );
  
  const DocumentPreview = ({ label, url }) => (
    <Box sx={{ 
      flex: 1, 
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1.5,
      textAlign: 'center'
    }}>
      {/* <FileText size={24} color="#666" />  */}
      <Typography variant="caption" display="block" color="textSecondary">
        {label}
      </Typography>
      {url && (
        <Button 
          variant="text" 
          size="small" 
          sx={{ mt: 1 }}
          onClick={() => window.open(url, '_blank')}
        >
          View Document
        </Button>
      )}
    </Box>
  );

  return (
    <>
      <Head>
        <title>Pending Priests | BPAMS Admin</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2, px: 1 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" mb={3}>Pending Priests</Typography>
          <CustomersSearch search={search} onSearchChange={setSearch} />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Profile</strong></TableCell>
                  <TableCell><strong>Pew</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Residing State</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPriests.length > 0 ? (
                  paginatedPriests.map((priest) => (
                    <TableRow key={priest.id}>
                      <TableCell>
                        <Avatar src={priest.profile_image || ""}>
                          {!priest.profile_image && priest.first_name?.charAt(0)}
                        </Avatar>
                      </TableCell>
                      <TableCell>{priest.pew || "N/A"}</TableCell>
                      <TableCell>{priest.first_name} {priest.last_name}</TableCell>
                      <TableCell>{priest.email || "N/A"}</TableCell>
                      <TableCell>{priest.residing_state || "N/A"}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleOpen(priest)}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending priests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filteredPriests.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Container>
      </Box>

      {/* Modal for approving priests */}
      <Modal
  open={open}
  onClose={handleClose}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{ timeout: 500 }}
>
  <Fade in={open}>
    <Box sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: '90%', sm: 600 },
      bgcolor: "background.paper",
      boxShadow: 24,
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      {selectedPriest && (
        <>
          {/* Header Section */}
          <Box sx={{
            bgcolor: 'primary.main',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            color: 'white'
          }}>
            <Avatar 
              src={selectedPriest.profile_image} 
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3,
                border: '3px solid white'
              }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedPriest.first_name} {selectedPriest.last_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedPriest.pew}
              </Typography>
            </Box>
          </Box>

          {/* Content Section */}
          <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {/* Personal Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" mb={1}>
                  <Box component="span" sx={{ mr: 1 }}>👤</Box>
                  Personal Information
                </Typography>
                <DetailItem label="Gender" value={selectedPriest.gender} />
                <DetailItem label="Country of Origin" value={selectedPriest.country_of_origin} />
                <DetailItem label="State of Origin" value={selectedPriest.state_of_origin} />
                <DetailItem label="LGA" value={selectedPriest.lga_of_origin} />
              </Grid>

              {/* Contact Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" mb={1}>
                  <Box component="span" sx={{ mr: 1 }}>📱</Box>
                  Contact Details
                </Typography>
                <DetailItem label="Email" value={selectedPriest.email} />
                <DetailItem label="Phone" value={selectedPriest.phone_number} />
                <DetailItem label="Residing State" value={selectedPriest.residing_state} />
                <DetailItem label="Address" value={selectedPriest.residential_address} />
              </Grid>

              {/* Documents Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary" mb={2}>
                  <Box component="span" sx={{ mr: 1 }}>📄</Box>
                  Submitted Documents
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DocumentPreview 
                    label="Academic Doc" 
                    url={selectedPriest.academicDocumentUrl} 
                  />
                  <DocumentPreview
                    label="ID Proof"
                    url={selectedPriest.proofOfIdUrl}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Action Section */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleClose}
              sx={{ px: 4 }}
            >
              Reject
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleApprove}
              sx={{ px: 4 }}
            >
              Approve
            </Button>
          </Box>
        </>
      )}
    </Box>
  </Fade>
</Modal>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
