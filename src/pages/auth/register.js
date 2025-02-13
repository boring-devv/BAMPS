// import Head from 'next/head';
// import NextLink from 'next/link';
// import { useRouter } from 'next/navigation';
// import { Box, Button, Link, Stack, TextField, Typography, MenuItem, CircularProgress } from '@mui/material';
// import { Layout as AuthLayout } from 'src/layouts/auth/layout';
// import { auth, db, storage } from "../../Firebase.config";
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { useState } from 'react';
// import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// const Page = () => {
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({});
//   const [passport, setPassport] = useState(null);
//   const [proofOfId, setProofOfId] = useState(null);
//   const [commentsFile, setCommentsFile] = useState(null);
//   const [academicFiles, setAcademicFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (event) => {
//     setFormData({ ...formData, [event.target.name]: event.target.value });
//   };

//   const handleAcademicFileChange = (event) => {
//     setAcademicFiles([...event.target.files]);
//   };

//   const uploadFile = async (file, path) => {
//     if (!file) return null;
//     try {
//       const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
//       await uploadBytes(fileRef, file);
//       const url = await getDownloadURL(fileRef);
//       return { name: file.name, url };
//     } catch (error) {
//       console.error(`Error uploading file ${file.name}:`, error);
//       throw new Error(`Failed to upload ${file.name}`);
//     }
//   };

//   const uploadMultipleFiles = async (files, path) => {
//     if (!files.length) return [];
//     const uploadPromises = Array.from(files).map(file => uploadFile(file, path));
//     return Promise.all(uploadPromises);
//   };

//   const generateUniqueCode = async (db) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
//     let uniqueCode;
//     let isUnique = false;
  
//     while (!isUnique) {
//       uniqueCode = '';
//       for (let i = 0; i < 8; i++) {
//         uniqueCode += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
  
//       const q = query(collection(db, "members"), where("uniqueCode", "==", uniqueCode));
//       const querySnapshot = await getDocs(q);
      
//       if (querySnapshot.empty) {
//         isUnique = true;
//       }
//     }
  
//     return uniqueCode;
//   };

//   const validateForm = () => {
//     if (step === 1) {
//       if (!formData.first_name?.trim()) return "First name is required";
//       if (!formData.last_name?.trim()) return "Last name is required";
//       if (!formData.email?.trim()) return "Email is required";
//       if (!formData.password?.trim()) return "Password is required";
//       if (!formData.phone_number?.trim()) return "Phone number is required";
//     }
//     return "";
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");
    
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setLoading(true);
//     try {
//       const uniqueCode = await generateUniqueCode(db);

//       // Upload files and get URLs
//       const [passportFile, idFile, commentFile] = await Promise.all([
//         uploadFile(passport, 'passports'),
//         uploadFile(proofOfId, 'identifications'),
//         uploadFile(commentsFile, 'comments')
//       ]);

//       const academicFileUploads = await uploadMultipleFiles(academicFiles, 'academic');

//       const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
//       const user = userCredential.user;

//       await setDoc(doc(db, "members", user.uid), {
//         ...formData,
//         role: "priest",
//         uniqueCode,
//         createdAt: new Date(),
//         passport: passportFile,
//         proofOfId: idFile,
//         commentsFile: commentFile,
//         academicFiles: academicFileUploads,
//         status: "pending",
//         lastUpdated: new Date()
//       });

//       console.log("Registration completed successfully");
//       router.push("/auth/login");
//     } catch (err) {
//       console.error("Error during registration:", err);
//       setError(err.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Register | UABCSP</title>
//       </Head>
//       <Box sx={{ flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
//         <Box sx={{ maxWidth: 550, px: 3, py: '100px', width: '100%' }}>
//           <Stack spacing={1} sx={{ mb: 3 }}>
//             <Typography variant="h4">Register</Typography>
//             <Typography color="text.secondary" variant="body2">
//               Already have an account?&nbsp;
//               <Link component={NextLink} href="/auth/login" underline="hover" variant="subtitle2">
//                 Log in
//               </Link>
//             </Typography>
//           </Stack>
//           {error && (
//             <Typography color="error" sx={{ mb: 2 }}>
//               {error}
//             </Typography>
//           )}
//           <form noValidate onSubmit={handleSubmit}>
//             {step === 1 && (
//               <Stack spacing={3}>
//                 <TextField 
//                   required
//                   label="First Name" 
//                   name="firstName" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.first_name || ''} 
//                 />
//                 <TextField 
//                   required
//                   label="Last Name" 
//                   name="lastName" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.last_name || ''} 
//                 />
//                 <TextField 
//                   required
//                   label="Email" 
//                   name="email" 
//                   fullWidth 
//                   type="email" 
//                   onChange={handleChange}
//                   value={formData.email || ''} 
//                 />
//                 <TextField 
//                   required
//                   label="Phone Number" 
//                   name="phoneNumber" 
//                   fullWidth 
//                   type="tel" 
//                   onChange={handleChange}
//                   value={formData.phone_number || ''} 
//                 />
//                 <TextField 
//                   required
//                   label="Password" 
//                   name="password" 
//                   fullWidth 
//                   type="password" 
//                   onChange={handleChange}
//                   value={formData.password || ''} 
//                 />
//                 <Button 
//                   fullWidth 
//                   size="large" 
//                   variant="contained" 
//                   onClick={() => {
//                     const error = validateForm();
//                     if (error) {
//                       setError(error);
//                     } else {
//                       setError("");
//                       setStep(2);
//                     }
//                   }}
//                 >
//                   Next
//                 </Button>
//               </Stack>
//             )}

//             {step === 2 && (
//               <Stack spacing={3}>
//                 <TextField 
//                   label="Date of Birth" 
//                   name="dateOfBirth" 
//                   fullWidth 
//                   type="date" 
//                   InputLabelProps={{ shrink: true }} 
//                   onChange={handleChange}
//                   value={formData.dateOfBirth || ''} 
//                 />
//                 <TextField 
//                   label="State" 
//                   name="state" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.state || ''} 
//                 />
//                 <TextField 
//                   label="Means of Identification" 
//                   select 
//                   name="meansOfId" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.meansOfId || ''}
//                 >
//                   <MenuItem value="National ID">National ID</MenuItem>
//                   <MenuItem value="Driver's License">Driver's License</MenuItem>
//                   <MenuItem value="NEPA Bill">NEPA Bill</MenuItem>
//                 </TextField>
//                 <TextField 
//                   label="Identification Number" 
//                   name="idNumber" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.idNumber || ''} 
//                 />
//                 <Typography>Upload Proof of Identification:</Typography>
//                 <input 
//                   type="file" 
//                   accept=".pdf,.jpg,.jpeg,.png" 
//                   onChange={(e) => setProofOfId(e.target.files[0])} 
//                 />
//                 <Typography>Upload Profile Image (Passport):</Typography>
//                 <input 
//                   type="file" 
//                   accept="image/*" 
//                   onChange={(e) => setPassport(e.target.files[0])} 
//                 />
//                 <Stack direction="row" spacing={2}>
//                   <Button fullWidth variant="outlined" onClick={() => setStep(1)}>
//                     Previous
//                   </Button>
//                   <Button fullWidth variant="contained" onClick={() => setStep(3)}>
//                     Next
//                   </Button>
//                 </Stack>
//               </Stack>
//             )}

//             {step === 3 && (
//               <Stack spacing={3}>
//                 <TextField 
//                   label="Academic Qualifications" 
//                   name="academicQualifications" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.academicQualifications || ''} 
//                 />
//                 <Typography>Upload Academic Qualification Documents:</Typography>
//                 <input 
//                   type="file" 
//                   multiple 
//                   accept=".pdf,.jpg,.jpeg,.png" 
//                   onChange={handleAcademicFileChange} 
//                 />
//                 <TextField 
//                   label="Previous Stations Served" 
//                   name="previousStations" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.previousStations || ''} 
//                 />
//                 <TextField 
//                   label="Previous Posts Held in BCS" 
//                   name="previousPosts" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.previousPosts || ''} 
//                 />
//                 <TextField 
//                   label="Next-of-Kin Name" 
//                   name="nextOfKinName" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.nextOfKinName || ''} 
//                 />
//                 <TextField 
//                   label="Next-of-Kin Phone" 
//                   name="nextOfKinPhone" 
//                   fullWidth 
//                   onChange={handleChange}
//                   value={formData.nextOfKinPhone || ''} 
//                 />
//                 <Typography>Upload Comments/Reports:</Typography>
//                 <input 
//                   type="file" 
//                   accept=".pdf,.doc,.docx" 
//                   onChange={(e) => setCommentsFile(e.target.files[0])} 
//                 />
//                 <Stack direction="row" spacing={2}>
//                   <Button fullWidth variant="outlined" onClick={() => setStep(2)}>
//                     Previous
//                   </Button>
//                   <Button 
//                     fullWidth 
//                     size="large" 
//                     variant="contained" 
//                     type="submit" 
//                     disabled={loading}
//                   >
//                     {loading ? <CircularProgress size={24} /> : 'Submit'}
//                   </Button>
//                 </Stack>
//               </Stack>
//             )}
//           </form>
//         </Box>
//       </Box>
//     </>
//   );
// };

// Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

// export default Page;




import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from 'src/Firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Page = () => {
  const router = useRouter();
  const auth = useAuth();
  const [priests, setPriests] = useState([]);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1);

  const [currentUser, setCurrentUser] = useState(null);
  // const router = useRouter();
  // const auth = getAuth();



  useEffect(() => {
    if (auth.user) {
      setCurrentUser(auth.user);
      console.log("Logged-in user:", auth.user);
      
    } else {
      console.log("No user is logged in.");
    }
  }, [auth.user]);
  

  const [formData, setFormData] = useState({
    phone_number: '',
    academic_qualifications: '',
    academic_files: [],
    approved_by: auth.user?.uid,
    approved_by_email: auth.user?.email,
    identification_type: '',
    identification_number: '',
    identification_files: [],
    is_posted: '',
    previous_stations: '',
    current_station: '',
    next_of_kin_phone: '',
    role: 'priest',
    status: 'approved'
  });





  useEffect(() => {
    const fetchPriests = async () => {
      try {
        const q = query(collection(db, 'members'), where('is_priest', '==', true));
        const querySnapshot = await getDocs(q);
        const priestList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(priest => priest.first_name && priest.last_name);
        setPriests(priestList);
      } catch (error) {
        console.error('Error fetching priests:', error);
      }
    };
    fetchPriests();
  }, []);

  const uploadFiles = async (files) => {
    const urls = await Promise.all(
      [...files].map(async (file) => {
        const storageRef = ref(storage, `documents/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      })
    );
    return urls;
  };

  const handleFileChange = async (event, field) => {
    const fileUrls = await uploadFiles(event.target.files);
    setFormData({ ...formData, [field]: fileUrls });
  };

  const handleSubmit = async () => {
    if (selectedPriest) {
      try {
        const priestRef = doc(db, 'members', selectedPriest.id);
        await updateDoc(priestRef, { ...formData });
        alert('Data updated successfully!');
        router.push('/');
      } catch (error) {
        console.error('Error updating priest data:', error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Signup | BPAMS</title>
      </Head>
      <Box sx={{ backgroundColor: 'background.paper', flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 550, px: 3, py: '100px', width: '100%' }}>
          {step === 1 ? (
            <>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography variant="h4">Signup</Typography>
                <Typography color="text.secondary" variant="body2">Search for a priest to register</Typography>
              </Stack>
              <Autocomplete
                options={priests}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                onInputChange={(event, value) => setSearchTerm(value)}
                onChange={(event, newValue) => setSelectedPriest(newValue)}
                renderInput={(params) => <TextField {...params} label="Search Priest" variant="outlined" />}
              />
              {selectedPriest && (
                <Typography sx={{ mt: 2 }} variant="h6">
                  Selected Priest: {selectedPriest.first_name} {selectedPriest.last_name}
                </Typography>
              )}
              <Button fullWidth size="large" sx={{ mt: 3 }} variant="contained" onClick={() => setStep(2)}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <Stack spacing={2}>
                <TextField label="Phone Number" fullWidth onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
                <TextField label="Academic Qualifications" fullWidth onChange={(e) => setFormData({ ...formData, academic_qualifications: e.target.value })} />
                <input type="file" multiple onChange={(e) => handleFileChange(e, 'academic_files')} />
                <FormControl fullWidth>
                  <InputLabel>Means of Identification</InputLabel>
                  <Select value={formData.identification_type} onChange={(e) => setFormData({ ...formData, identification_type: e.target.value })}>
                    <MenuItem value="National ID">National ID</MenuItem>
                    <MenuItem value="Drivers Licence">Driver's Licence</MenuItem>
                    <MenuItem value="Nepa Bill">NEPA Bill</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Identification Number" fullWidth onChange={(e) => setFormData({ ...formData, identification_number: e.target.value })} />
                <input type="file" multiple onChange={(e) => handleFileChange(e, 'identification_files')} />
                <FormControl fullWidth>
                  <InputLabel>Are you posted?</InputLabel>
                  <Select value={formData.is_posted} onChange={(e) => setFormData({ ...formData, is_posted: e.target.value })}>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
                {formData.is_posted === 'Yes' && (
                  <>
                    <TextField label="Previous Stations" fullWidth onChange={(e) => setFormData({ ...formData, previous_stations: e.target.value })} />
                    <TextField label="Current Station" fullWidth onChange={(e) => setFormData({ ...formData, current_station: e.target.value })} />
                  </>
                )}
                <TextField label="Next-of-Kin Phone" fullWidth onChange={(e) => setFormData({ ...formData, next_of_kin_phone: e.target.value })} />
                <Button fullWidth size="large" sx={{ mt: 3 }} variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;




