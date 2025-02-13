import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    IconButton,
    Typography,
    Select,
    MenuItem,
    FormControl,
    Alert,
    CircularProgress,
    Box,
    Avatar,
    Chip,
    Stack,
    Paper
} from '@mui/material';
import { X as CloseIcon, Upload, Trash2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from 'src/Firebase.config';

const EditUserModal = ({ open, onClose, user }) => {
    const [formData, setFormData] = useState({
        bethel: '',
        country_of_origin: '',
        country_of_residence: '',
        email: '',
        first_name: '',
        gender: '',
        last_name: '',
        lga_of_origin: '',
        middle_name: '',
        nation_of_worship: '',
        next_of_kin1: '',
        next_of_kin_phone: '',
        pew: '',
        phone_number: '',
        profile_image: '',
        residential_address: '',
        residing_state: '',
        state_of_origin: '',
        village: '',
        current_station: '',
        previous_stations: '',
        currentPosition: '',
        qualifications: '',
        academic_files: [],
        identification_files: [],
        identification_number: '',
        identification_type: '',
        is_posted: '',
        is_priest: false,
        role: '',
        status: '',
        approved_by: '',
        approved_by_email: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [qualificationFiles, setQualificationFiles] = useState([]);
    const [qualificationFileNames, setQualificationFileNames] = useState([]);
    const [identificationFiles, setIdentificationFiles] = useState([]);
    const [identificationFileNames, setIdentificationFileNames] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                bethel: user?.bethel || '',
                country_of_origin: user?.country_of_origin || '',
                country_of_residence: user?.country_of_residence || '',
                email: user?.email || '',
                first_name: user?.first_name || '',
                gender: user?.gender || '',
                last_name: user?.last_name || '',
                lga_of_origin: user?.lga_of_origin || '',
                middle_name: user?.middle_name || '',
                nation_of_worship: user?.nation_of_worship || '',
                next_of_kin1: user?.next_of_kin1 || '',
                next_of_kin_phone: user?.next_of_kin_phone || '',
                pew: user?.pew || '',
                phone_number: user?.phone_number || '',
                profile_image: user?.profile_image || '',
                residential_address: user?.residential_address || '',
                residing_state: user?.residing_state || '',
                state_of_origin: user?.state_of_origin || '',
                village: user?.village || '',
                current_station: user?.current_station || '',
                previous_stations: user?.previous_stations || '',
                currentPosition: user?.currentPosition || '',
                qualifications: user?.qualifications || '',
                academic_files: user?.academic_files || [],
                identification_files: user?.identification_files || [],
                identification_number: user?.identification_number || '',
                identification_type: user?.identification_type || '',
                is_posted: user?.is_posted || '',
                is_priest: user?.is_priest || false,
                role: user?.role || '',
                status: user?.status || '',
                approved_by: user?.approved_by || '',
                approved_by_email: user?.approved_by_email || ''
            });
            setImagePreview(null);
            setQualificationFileNames([]);
            setQualificationFiles([]);
            setIdentificationFileNames([]);
            setIdentificationFiles([]);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleQualificationFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setQualificationFiles(prev => [...prev, ...files]);
        setQualificationFileNames(prev => [...prev, ...files.map(file => file.name)]);
    };

    const handleIdentificationFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setIdentificationFiles(prev => [...prev, ...files]);
        setIdentificationFileNames(prev => [...prev, ...files.map(file => file.name)]);
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const storageRef = ref(storage, `profile_images/${user.userId}/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        return getDownloadURL(storageRef);
    };

    const uploadQualificationFiles = async () => {
        if (qualificationFiles.length === 0) return [];
        const uploadPromises = qualificationFiles.map(async file => {
            const storageRef = ref(storage, `qualification_docs/${user.userId}/${file.name}`);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
        });
        return Promise.all(uploadPromises);
    };

    const uploadIdentificationFiles = async () => {
        if (identificationFiles.length === 0) return [];
        const uploadPromises = identificationFiles.map(async file => {
            const storageRef = ref(storage, `identification_docs/${user.userId}/${file.name}`);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
        });
        return Promise.all(uploadPromises);
    };

    const handleDeleteFile = async (fileUrl, fileType) => {
        try {
            // Extract the file path from the Firebase Storage URL
            const url = new URL(fileUrl);
            const filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);

            // Create a reference to the file in Firebase Storage
            const fileRef = ref(storage, filePath);

            // Delete the file from Firebase Storage
            await deleteObject(fileRef);

            // Update the formData state to remove the deleted file
            let updatedFiles;
            if (fileType === 'academic') {
                updatedFiles = formData.academic_files.filter(file => file !== fileUrl);
                setFormData(prev => ({
                    ...prev,
                    academic_files: updatedFiles
                }));
            } else if (fileType === 'identification') {
                updatedFiles = formData.identification_files.filter(file => file !== fileUrl);
                setFormData(prev => ({
                    ...prev,
                    identification_files: updatedFiles
                }));
            }

            // Update the Firestore document to remove the deleted file
            const userRef = doc(db, 'members', user.userId);
            await updateDoc(userRef, {
                [fileType === 'academic' ? 'academic_files' : 'identification_files']: updatedFiles
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Error deleting file:', error);
            setError('Failed to delete file. Please try again.');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const profileImageUrl = imageFile ? await uploadImage() : null;
            const newQualificationUrls = await uploadQualificationFiles();
            const newIdentificationUrls = await uploadIdentificationFiles();

            const updatedData = {
                ...Object.fromEntries(
                    Object.entries(formData).filter(([_, v]) => v !== '')
                ),
                ...(profileImageUrl && { profile_image: profileImageUrl }),
                academic_files: [
                    ...formData.academic_files,
                    ...newQualificationUrls
                ],
                identification_files: [
                    ...formData.identification_files,
                    ...newIdentificationUrls
                ]
            };

            await updateDoc(doc(db, 'members', user.userId), updatedData);
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error('Error updating user:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh', bgcolor: '#f5f5f5' } }}
        >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated!</Alert>}
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                p: 3
            }}>
                <Typography variant="h6">Edit User Profile</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon size={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Profile Image Section */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Profile</Typography>
                                    <Avatar
                                        src={user?.profile_image}
                                        sx={{ width: 100, height: 100, border: '2px solid #ccc' }}
                                    />
                                </Box>
                                {imagePreview && (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>New Profile</Typography>
                                        <Avatar
                                            src={imagePreview}
                                            sx={{ width: 100, height: 100, border: '2px solid #2196f3' }}
                                        />
                                    </Box>
                                )}
                            </Stack>
                            <Box display="flex" justifyContent="center" mt={2}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<Upload />}
                                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                                >
                                    Update Profile Image
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Personal Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Personal Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="First Name" name="first_name"
                                        value={formData.first_name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Middle Name" name="middle_name"
                                        value={formData.middle_name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Last Name" name="last_name"
                                        value={formData.last_name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Email" name="email"
                                        value={formData.email} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Phone Number" name="phone_number"
                                        value={formData.phone_number} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Location Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Country of Origin" name="country_of_origin"
                                        value={formData.country_of_origin} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="State of Origin" name="state_of_origin"
                                        value={formData.state_of_origin} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="LGA of Origin" name="lga_of_origin"
                                        value={formData.lga_of_origin} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Country of Residence" name="country_of_residence"
                                        value={formData.country_of_residence} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Residing State" name="residing_state"
                                        value={formData.residing_state} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Church Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Church Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Bethel" name="bethel"
                                        value={formData.bethel} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <Select
                                            name="pew"
                                            value={formData.pew || "cps"} // Set a valid default if formData.pew is empty
                                            onChange={handleChange}
                                            displayEmpty
                                        >
                                            <MenuItem value=""><em>Select Pew</em></MenuItem>
                                            <MenuItem value="cps">Christ Practical Student</MenuItem>
                                            <MenuItem value="cnp">Christ Natural Preacher</MenuItem>
                                            <MenuItem value="tcw">True Christ Witness</MenuItem>
                                            <MenuItem value="bm">Blessed Mother</MenuItem>
                                            <MenuItem value="dv">Divine Vanguard</MenuItem>
                                            <MenuItem value="ca">Christ Ambassador</MenuItem>
                                            <MenuItem value="Bishop">Bishop</MenuItem>
                                            <MenuItem value="Eminence">Eminence</MenuItem>
                                            <MenuItem value="hg">Archbishop</MenuItem>
                                            <MenuItem value="shephered">Christ Shepherd</MenuItem>
                                            <MenuItem value="144">144,000 Virgin</MenuItem>
                                        </Select>
                                    </FormControl>

                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Next of Kin Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Next of Kin Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Next of Kin" name="next_of_kin1"
                                        value={formData.next_of_kin1} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Next of Kin Phone" name="next_of_kin_phone"
                                        value={formData.next_of_kin_phone} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Identification Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Identification Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Identification Number" name="identification_number"
                                        value={formData.identification_number} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Identification Type" name="identification_type"
                                        value={formData.identification_type} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Identification Files Section */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Identification Documents</Typography>
                            <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Existing Identification Documents:
                                </Typography>
                                {formData.identification_files?.map((file, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={`Document ${index + 1}`}
                                            component="a"
                                            href={file}
                                            target="_blank"
                                            clickable
                                            sx={{ m: 0.5 }}
                                        />
                                        <IconButton onClick={() => handleDeleteFile(file, 'identification')}>
                                            <Trash2 size={16} color="error" />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<Upload />}
                                    sx={{ mt: 2, bgcolor: '#e3f2fd', color: '#1976d2' }}
                                >
                                    Add New Documents
                                    <input type="file" hidden multiple onChange={handleIdentificationFilesChange} />
                                </Button>

                                {identificationFileNames.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">New files to upload:</Typography>
                                        {identificationFileNames.map((name, index) => (
                                            <Typography key={index} variant="body2" color="text.secondary">
                                                • {name}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Qualifications Section */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Qualifications</Typography>
                            <TextField fullWidth multiline rows={3} label="Qualifications"
                                name="qualifications" value={formData.qualifications} onChange={handleChange} />
                        </Paper>
                    </Grid>

                    {/* Qualification Files Section */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Qualification Documents</Typography>
                            <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Existing Qualification Documents:
                                </Typography>
                                {formData.academic_files?.map((file, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                            label={`Document ${index + 1}`}
                                            component="a"
                                            href={file}
                                            target="_blank"
                                            clickable
                                            sx={{ m: 0.5 }}
                                        />
                                        <IconButton onClick={() => handleDeleteFile(file, 'academic')}>
                                            <Trash2 size={16} color="error" />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<Upload />}
                                    sx={{ mt: 2, bgcolor: '#e3f2fd', color: '#1976d2' }}
                                >
                                    Add New Documents
                                    <input type="file" hidden multiple onChange={handleQualificationFilesChange} />
                                </Button>

                                {qualificationFileNames.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">New files to upload:</Typography>
                                        {qualificationFileNames.map((name, index) => (
                                            <Typography key={index} variant="body2" color="text.secondary">
                                                • {name}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Other Information */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#1976d2' }}>Other Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Station Posted To" name="current_station"
                                        value={formData.current_station} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Previous Stations" name="previous_stations"
                                        value={formData.previous_stations} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth multiline rows={3} label="Residential Address"
                                        name="residential_address" value={formData.residential_address} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Role" name="role"
                                        value={formData.role} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Status" name="status"
                                        value={formData.status} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined" color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserModal;