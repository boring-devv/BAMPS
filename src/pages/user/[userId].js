import Head from 'next/head';
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { AccountProfile } from 'src/sections/account/account-profile';
import { AccountProfileDetails } from 'src/sections/account/account-profile-details';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from 'src/Firebase.config';

const Page = () => {
  const router = useRouter()
  const { userId } = router.query;

  const [userData, setUserData] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Users", userId), (doc) => {
      setUserData(doc.data());
    });

    return () => unsub;
  }, [])


  return (
    <>
      <Head>
        <title>
          Account | BPAMS
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">
                Account
              </Typography>
            </div>
            <div>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  md={6}
                  lg={4}
                >
                  <AccountProfile data={userData}/>
                </Grid>
                <Grid
                  xs={12}
                  md={6}
                  lg={8}
                >
                  <AccountProfileDetails data={userData} id={userId}/>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  )
}

Page.getLayout = (page) => (

  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
