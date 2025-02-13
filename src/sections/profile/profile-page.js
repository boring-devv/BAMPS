import { useCallback, useState, useRef, useEffect } from 'react';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    Stack,
    Typography,
    Box,
    Avatar,
    CircularProgress
} from '@mui/material';
import QRCode from "react-qr-code";
import { auth, db } from "../../Firebase.config"; // Ensure this path is correct
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProfilePage = () => {
    const qrRef = useRef(null);
    const [values, setValues] = useState({
        password: '',
        confirm: ''
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for authentication state change
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDocRef = doc(db, "members", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, []);

    // console.log(user)


    const handleChange = useCallback(
        (event) => {
            setValues((prevState) => ({
                ...prevState,
                [event.target.name]: event.target.value
            }));
        },
        []
    );

    const handleSubmit = useCallback(
        (event) => {
            event.preventDefault();
        },
        []
    );

    const handleCopy = () => {
        navigator.clipboard.writeText(user.uniqueCode);
        alert('Unique code copied to clipboard!');
    };

    const downloadQRCode = () => {
        const svgElement = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = "QRCode.svg";
        link.click();
    };



    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>No user found. Please log in.</Typography>;
    }
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Profile" subheader="Your profile information" />
                        <Divider />
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <Avatar
                                    alt={user.firstName}
                                    src={user.profile_image || "https://via.placeholder.com/150"}
                                    sx={{ width: 120, height: 120, border: '2px solid #3f51b5' }}
                                    onError={(e) => e.target.src = "https://via.placeholder.com/150"} // Fallback on error
                                />

                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                                <Typography variant="body1"><strong>Phone:</strong> {user.phoneNumber}</Typography>
                                <Typography variant="body1"><strong>State:</strong> {user.state}</Typography>
                                <Typography variant="body1"><strong>Unique Code:</strong> {user.uniqueCode}</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* QR Code and Details Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            subheader="Your QR Code and additional details"
                            title="QR Code"
                        />
                        <Divider />
                        <CardContent>
                            <Stack
                                spacing={3}
                                alignItems="center"
                                justifyContent="center"
                                sx={{ textAlign: 'center' }}
                            >
                                <QRCode
                                    ref={qrRef}
                                    size={175}
                                    value={`https://ooobcs.org/profile/${user?.uid}`} // Using dynamic user data for QR code
                                    viewBox={`0 0 256 256`}
                                />
                                <Typography variant="body1">
                                    Scan the QR code to view your profile details.
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Username:</strong> {user.firstName}
                                </Typography>
                                {/* <Typography variant="body2">
                                    <strong>Account Created:</strong> {user.accountCreated || 'N/A'}
                                </Typography> */}
                            </Stack>
                        </CardContent>
                        <Divider />
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                            <Button variant="contained" color="primary" onClick={downloadQRCode}>Download QR</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;
