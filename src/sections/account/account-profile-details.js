import { useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from '../../Firebase.config';
import { format } from 'date-fns';
import Switch from '@mui/material/Switch';

const someGender = [
  {
    value: 'male',
    label: 'male'
  },
  {
    value: 'female',
    label: 'female'
  },
];

export const AccountProfileDetails = ({ id }) => {
  const [userAddress, setUserAddress] = useState('N/A');
  const [userDob, setUserDob] = useState('N/A');
  const [lastSeen, setLastSeen] = useState('N/A');
  const [userData, setUserData] = useState({});
  const [verified, setVerified] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [values, setValues] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    number: '',
    institute: '',
    department: '',
    gender: '',
    zodiac: '',
    trybe: '',
    level: '',
    dob: ''
  });

  const getRealAddress = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      setUserAddress('N/A');
      return;
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${'AIzaSyCOP_91c5NHsGSYA5EXAe7TcX9FZsZ4azM'}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setUserAddress(address);
      } else {
        setUserAddress('N/A');
      }
    } catch (error) {
      setUserAddress('N/A');
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "Users", id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setValues({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          username: data.username || '',
          email: data.email || '',
          number: data.number || '',
          institute: data.institute || '',
          department: data.department || '',
          gender: data.gender?.toLowerCase() || '',
          zodiac: data.zodiac || '',
          trybe: data.trybe || '',
          level: data.level || '',
          dob: data.dob || ''
        });

        setVerified(data.verified || false);
        setSuspended(data.suspended || false);
        setUserData(data);

        const formattedDob = data.dob?.seconds ? format(new Date(data.dob.seconds * 1000), 'dd/MM/yyyy') : 'N/A';
        const formattedLastSeen = data.lastSeen?.seconds ? format(new Date(data.lastSeen.seconds * 1000), 'yyyy-MM-dd HH:mm:ss') : 'N/A';

        setUserDob(formattedDob);
        setLastSeen(formattedLastSeen);

        getRealAddress(data.lat, data.lng);
      }
    });

    return () => unsub();
  }, [id]);

  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const docRef = doc(db, 'Users', id);
      await updateDoc(docRef, {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        institute: values.institute,
        department: values.department,
        gender: values.gender,
        zodiac: values.zodiac,
        trybe: values.trybe,
        level: values.level
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }, [id, values]);

  const HandleVerifiedToggle = async () => {
    try {
      const docRef = doc(db, 'Users', id);
      await updateDoc(docRef, {
        verified: !verified
      });
      setVerified(!verified);
    } catch (error) {
      console.error('Error updating verified status:', error);
    }
  };

  const HandleSuspendedToggle = async () => {
    try {
      const docRef = doc(db, 'Users', id);
      await updateDoc(docRef, {
        suspended: !suspended
      });
      setSuspended(!suspended);
    } catch (error) {
      console.error('Error updating suspended status:', error);
    }
  };

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Not all information can be edited!" title="Profile" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First name"
                  name="firstname"
                  onChange={handleChange}
                  required
                  value={values.firstname}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last name"
                  name="lastname"
                  onChange={handleChange}
                  value={values.lastname}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  onChange={handleChange}
                  value={values.username}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  disabled
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={values.email}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  disabled
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="number"
                  value={values.number}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Institute"
                  name="institute"
                  onChange={handleChange}
                  value={values.institute}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  onChange={handleChange}
                  value={values.department}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Level"
                  name="level"
                  onChange={handleChange}
                  value={values.level}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trybe"
                  name="trybe"
                  onChange={handleChange}
                  value={values.trybe}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Date of Birth"
                  name="dob"
                  value={userDob}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gender"
                  name="gender"
                  onChange={handleChange}
                  value={values.gender}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zodiac"
                  name="zodiac"
                  onChange={handleChange}
                  value={values.zodiac}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  helperText={`${values.firstname} last location`}
                  name="location"
                  disabled
                  value={userAddress}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Last Seen"
                  name="lastSeen"
                  value={lastSeen}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Device Model"
                  name="device"
                  value={userData?.deviceInfo?.deviceModalName || 'N/A'}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Device Name"
                  name="deviceName"
                  value={userData?.deviceInfo?.deviceName || 'N/A'}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Device Producer"
                  name="deviceProducer"
                  value={userData?.deviceInfo?.deviceProducer || 'N/A'}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  disabled
                  label="User UID"
                  name="uid"
                  value={id}
                />
              </Grid>
              <Grid marginTop={-5} xs={12} md={6}>
                <h5>Verified</h5>
                <Switch
                  name="verified"
                  checked={verified}
                  onChange={HandleVerifiedToggle}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Grid>
              <Grid marginTop={-5} xs={12} md={6}>
                <h5>Suspend</h5>
                <Switch
                  name="suspend"
                  checked={suspended}
                  onChange={HandleSuspendedToggle}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};