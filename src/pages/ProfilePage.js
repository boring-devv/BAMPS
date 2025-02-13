import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "src/Firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  Avatar,
  Button,
  Box,
  Paper,
} from "@mui/material";

const ProfilePage = () => {
  const router = useRouter();
  const { id } = router.query; // Get the ID from query parameters
  const [priest, setPriest] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchPriest = async () => {
      const docRef = doc(db, "members", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPriest({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchPriest();
  }, [id]);

  const handleApprove = async () => {
    if (!priest) return;
    const docRef = doc(db, "members", id);
    await updateDoc(docRef, { status: "verified" });
    alert("User verified successfully!");
    router.push("/"); // Redirect to the main page
  };

  if (!priest) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box display="flex" alignItems="center">
          <Avatar src={priest.profile_image} sx={{ width: 80, height: 80, mr: 2 }} />
          <Typography variant="h4">
            {priest.first_name} {priest.middle_name} {priest.last_name}
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography><strong>Email:</strong> {priest.email}</Typography>
          <Typography><strong>Phone:</strong> {priest.phone_number}</Typography>
          <Typography><strong>Country of Origin:</strong> {priest.country_of_origin}</Typography>
          <Typography><strong>Country of Residence:</strong> {priest.country_of_residence}</Typography>
          <Typography><strong>State of Origin:</strong> {priest.state_of_origin}</Typography>
          <Typography><strong>Residing State:</strong> {priest.residing_state}</Typography>
          <Typography><strong>Residential Address:</strong> {priest.residential_address}</Typography>
          <Typography><strong>Nation of Worship:</strong> {priest.nation_of_worship}</Typography>
          <Typography><strong>LGA of Origin:</strong> {priest.lga_of_origin}</Typography>
          <Typography><strong>Next of Kin:</strong> {priest.next_of_kin1}</Typography>
          <Typography><strong>Pew:</strong> {priest.pew}</Typography>
          <Typography><strong>Village:</strong> {priest.village}</Typography>
        </Box>

        <Box mt={3}>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
