import { useCallback, useMemo, useEffect, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { CustomersSearch } from 'src/sections/customer/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from 'src/Firebase.config';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useCustomerIds = (customers) => {
  return useMemo(
    () => {
      return customers.map((customer) => customer.userId);
    },
    [customers]
  );
};





const Page = () => {
  const [data, setData] = useState([]);
  const router = useRouter();

  // const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "members"), (snapshot) => {
      const allUsers = snapshot?.docs?.map((doc) => ({
        userId: doc?.id,
        ...doc?.data()
      }));

      // Filter only users where is_priest is true
      const priests = allUsers.filter(user => user.is_priest === true);

      setData(priests);
    });

    return () => unsub();
}, []);


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  const customers = useMemo(
    () => {
      // Filter data based on search query
      const filteredData = data.filter((customer) =>
        customer?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.uniqueCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return applyPagination(filteredData, page, rowsPerPage);
    },
    [data, searchQuery, page, rowsPerPage]
  );

  const customersIds = useCustomerIds(customers);
  const customersSelection = useSelection(customersIds);

  const handlePageChange = useCallback(
    (event, value) => {
      setPage(value);
    },
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event?.target?.value);
      setPage(0); // Reset to the first page when search query changes
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      setRowsPerPage(event?.target?.value);
    },
    []
  );



  useEffect(() => {
    // Add authentication listener
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Current user:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          // Add any other user properties you want to log
        });
        setCurrentUser(user);
      } else {
        console.log('No user is signed in');
        setCurrentUser(null);
      }
    });

    // Original data listener
 

    // Cleanup both listeners
    return () => {
      unsubAuth();
      // unsubData();
    };
  }, []);

  return (
    <>
      <Head>
        <title>Priests | UABCS Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">
                  Priests
                </Typography>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    )}
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>
              <div>
                <Button
                  startIcon={(
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  )}
                  variant="contained"
                  onClick={() => router.push('/auth/adminreg')}
                >
                  Add Priest
                </Button>
              </div>
            </Stack>
            {/* <CustomersSearch onSearchChange={handleSearchChange} /> */}
            <CustomersSearch search={searchQuery} onSearchChange={setSearchQuery} />

            <CustomersTable
              count={data.length}
              items={customers}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              rowsPerPage={rowsPerPage}
              selected={customersSelection.selected}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;