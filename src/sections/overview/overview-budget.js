import PropTypes from 'prop-types';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
// import { collection, onSnapshot } from "firebase/firestore";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from 'src/Firebase.config';
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export const OverviewBudget = (props) => {
  const { sx } = props;

  const [withLength, setWithLength] = useState([]);

  const router = useRouter();
  

  const handleNavigation = () => {
    router.push('/pendingpriests');
  };

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, "withdrawal"), (doc) => {
  //     const withs = doc.docs.map((wit) => {
  //       return {
  //         id: wit.id,
  //         ...wit.data()
  //       }
  //     })
  //     const filterWiths = withs.filter((wit) => wit?.attended === false)
  //     setWithLength(filterWiths)
  //   });

  //   return () => unsub
  // }, [])

  useEffect(() => {
    const membersRef = collection(db, "members");
    const q = query(membersRef,
       where("is_priest", "==", true),
       where("status", "==", "pending")
      );

    const unsub = onSnapshot(q, (snapshot) => {
      setWithLength(snapshot.size.toString());
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
                Pending Priest 

              </Typography>
              <Typography variant="h4">
                {withLength}
              </Typography>
            </Stack>
            <Avatar
              sx={{
                backgroundColor: 'error.main',
                height: 56,
                width: 56
              }}
            >
              <SvgIcon>
                <CurrencyDollarIcon />
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
              All Pending Priests
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

OverviewBudget.prototypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
