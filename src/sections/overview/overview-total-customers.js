import PropTypes from 'prop-types';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { db } from 'src/Firebase.config';
import { useRouter } from 'next/router';

export const OverviewTotalCustomers = (props) => {
  const { difference, positive = false, sx, value } = props;
  const router = useRouter();
  const [allUsers, setAllUsers] = useState(0)


  const handleNavigation = () => {
    router.push('/users');
  };

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, "members"), (doc) => {
  //     const usersLength = doc.size
  //     setAllUsers(usersLength.toString())
  //   });

  //   return () => unsub
  // }, [])

  useEffect(() => {
    const membersRef = collection(db, "members");
    const q = query(membersRef, where("is_priest", "==", true));

    const unsub = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.size.toString());
    });

    return () => unsub(); // Properly clean up the listener
  }, []);


  return (
    <div onClick={handleNavigation} style={{cursor:'pointer'}}>
      <Card sx={sx}>
        <CardContent>
          <Stack
            alignItems="flex-start"
            direction="row"
            justifyContent="space-between"
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography
                color="text.secondary"
                variant="overline"
              >
                Total Users
              </Typography>
              <Typography variant="h4">
                {allUsers}
              </Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: 'success.main',
                height: 56,
                width: 56
              }}
            >
              <SvgIcon>
                <UsersIcon />
              </SvgIcon>
            </Avatar>
          </Stack>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Typography
              color="text.secondary"
              variant="caption"
            >
              All user on BPAMS
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

OverviewTotalCustomers.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  value: PropTypes.string.isRequired,
  sx: PropTypes.object
};

