import PropTypes from 'prop-types';
import CheckIcon from '@heroicons/react/24/solid/CheckBadgeIcon';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { db } from 'src/Firebase.config';
import { useRouter } from 'next/router';
import { collection, onSnapshot, query, where } from "firebase/firestore";


export const OverviewTasksProgress = (props) => {
  const { sx } = props;

  const router = useRouter();
  

  const handleNavigation = () => {
    router.push('/verifiedpriests');
  };

  const [verifs, setVerifs] = useState([]);

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, "verifications"), (doc) => {
  //     const vefs = doc.docs.map((vef) => {
  //       return {
  //         id: vef.id,
  //         ...vef.data()
  //       }
  //     })
  //     const filterVefs=vefs.filter((vef)=>vef?.attended===false || !vef?.attended)
  //     setVerifs(filterVefs)
  //   });

  //   return () => unsub
  // }, [])


  useEffect(() => {
    const membersRef = collection(db, "members");
    const q = query(membersRef,
       where("is_priest", "==", true),
       where("status", "==", "approved")
      );

    const unsub = onSnapshot(q, (snapshot) => {
      setVerifs(snapshot.size.toString());
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
              gutterBottom
              variant="overline"
            >
              Verifified Priests
            </Typography>
            <Typography variant="h4">
              {verifs}
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'warning.main',
              height: 56,
              width: 56
            }}
          >
            <SvgIcon>
              <CheckIcon />
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
            All Verified Priest
          </Typography>
        </Stack>
      </CardContent>
    </Card>
   </div>
  );
};

OverviewTasksProgress.propTypes = {
  value: PropTypes.number.isRequired,
  sx: PropTypes.object
};
