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
    const q = query(priestsRef, where("is_priest", "==", true), where("status", "==", "approved"));

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

  return (
    <>
      <Head>
        <title>Verified Priests | BPAMS Admin</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 2, px: 1 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" mb={3}>Verified Priests</Typography>
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
                    <Box
                      sx={{
                        backgroundColor: '#66ff99',
                        color: '#595959',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        display: 'inline-block'
                      }}
                    >
                      {priest.status}
                    </Box>
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
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}>
            {selectedPriest && (
              <>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={selectedPriest.profile_image} sx={{ width: 60, height: 60, mr: 2 }} />
                  <Typography variant="h5">
                    {selectedPriest.first_name} {selectedPriest.last_name}
                  </Typography>
                </Box>
                <Typography><strong>Email:</strong> {selectedPriest.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedPriest.phone_number}</Typography>
                <Typography><strong>Residing State:</strong> {selectedPriest.residing_state}</Typography>
                <Typography><strong>Pew:</strong> {selectedPriest.pew}</Typography>

                <Box mt={3} display="flex" justifyContent="space-between">
                  <Button variant="contained" color="success" onClick={handleApprove}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleClose}>
                    Cancel
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
