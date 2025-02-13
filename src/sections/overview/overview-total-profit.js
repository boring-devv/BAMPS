import PropTypes from 'prop-types';
import FlagIcon from '@heroicons/react/24/solid/FlagIcon';
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from 'src/Firebase.config';
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';
import { useRouter } from 'next/router';

export const OverviewTotalProfit = (props) => {
  const { sx } = props;

  const [reportsLength, setReportsLength] = useState([]);


  const router = useRouter();
  

  const handleNavigation = () => {
    router.push('/reports');
  };


  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reports"), (doc) => {
      const reps = doc.docs.map((rep) => {
        return {
          id: rep.id,
          ...rep.data()
        }
      })
      const filterReps = reps.filter((rep) => rep?.attended === false || !rep?.attended)
      setReportsLength(filterReps)
    });

    return () => unsub
  }, [])

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
              Reports
            </Typography>
            <Typography variant="h4">
              {reportsLength?.length}
            </Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: 'primary.main',
              height: 56,
              width: 56
            }}
          >
            <SvgIcon>
              <FlagIcon />
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
            Not attended to
          </Typography>
        </Stack>
      </CardContent>
    </Card>
   </div>
  );
};

OverviewTotalProfit.propTypes = {
  value: PropTypes.string,
  sx: PropTypes.object
};
