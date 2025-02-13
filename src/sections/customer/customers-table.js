import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Typography,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
import { Scrollbar } from 'src/components/scrollbar';
import { getInitials } from 'src/utils/get-initials';
import { useRouter } from 'next/router';
import { useRef, useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from 'src/Firebase.config';
import jsPDF from 'jspdf';
import QRCodeGenerator from 'qrcode';
import { onAuthStateChanged } from 'firebase/auth';
import EditUserModal from '../profile/editprofile';

const UserProfileModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const formatDate = (date) => {
    try {
      return date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6">User Profile</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={user.passport?.url}
                sx={{ width: 100, height: 100, border: 3, borderColor: 'primary.main' }}
              >
                {getInitials(user.firstName + ' ' + user.lastName)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(user.dateOfBirth)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.phoneNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">ID Type</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.meansOfId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">ID Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.idNumber || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Professional Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Academic Qualifications</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.academicQualifications || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Previous Posts</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.previousPosts || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Previous Stations</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{user.previousStations || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Current State</Typography>
                  <Typography variant="body1">{user.state || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Side Content */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Emergency Contact
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">Next of Kin</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{user.nextOfKinName || 'N/A'}</Typography>
              <Typography variant="subtitle2" color="textSecondary">Contact Number</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>{user.nextOfKinPhone || 'N/A'}</Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                System Information
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">Unique Code</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{user.uniqueCode || 'N/A'}</Typography>

              {/* QR Code */}
              {user.uniqueCode && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.uniqueCode}`}
                    alt="QR Code"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Reusable components for modal content

export const CustomersTable = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,

    onSelectAll,
    onSelectOne,

    selected = []
  } = props;

  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);


  // Role Management
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'members', selectedUser.userId);
      await updateDoc(userRef, { role: newRole });
      setSnackbarOpen(true);
      setConfirmationOpen(false);
      router.replace(router.asPath); // Refresh data
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleViewProfile = (customer) => {
    setSelectedProfile(customer);
    setProfileModalOpen(true);
  };

  // PDF Export Handler
  const handleExport = async () => {
    try {
      const doc = new jsPDF();
      const selectedItems = items.filter(item => selected.includes(item.userId));

      if (selectedItems.length === 0) {
        alert('No items selected for export.');
        return;
      }

      const margin = 10;
      const pageWidth = doc.internal.pageSize.width;
      const blueColor = '#1976d2';

      for (const [index, item] of selectedItems.entries()) {
        if (index > 0) doc.addPage();
        let yPos = margin;

        // Header
        doc.setFillColor(23, 118, 210);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('User Profile Report', margin, 18);

        // Profile Image
        if (item.passport?.url) {
          try {
            const response = await fetch(item.passport.url);
            const blob = await response.blob();
            const imgData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });

            const imgX = pageWidth - 60;
            const imgY = 30;
            const imgSize = 50;
            doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
          } catch (error) {
            console.error('Error loading passport image:', error);
            // Continue without the image if it fails to load
          }
        }

        // QR Code - with error handling
        try {
          const qrData = await QRCodeGenerator.toDataURL(item.uniqueCode || 'N/A', {
            width: 100,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          doc.addImage(qrData, 'PNG', pageWidth - 60, 160, 50, 50);
        } catch (error) {
          console.error('Error generating QR code:', error);
          // Continue without QR code if generation fails
        }

        // Content
        function formatDate(dateString) {
          if (!dateString) return 'N/A';
          try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : format(date, 'dd/MM/yyyy');
          } catch {
            return 'N/A';
          }
        }

        const sections = [
          {
            title: 'Personal Information',
            content: [
              `First Name: ${item.firstName || 'N/A'}`,
              `Last Name: ${item.lastName || 'N/A'}`,
              `DOB: ${formatDate(item.dateOfBirth)}`,
              `Email: ${item.email || 'N/A'}`
            ]
          },
          {
            title: 'Employment Details',
            content: [
              `State: ${item.state || 'N/A'}`,
              `Previous Post: ${item.previousPosts || 'N/A'}`,
              `Previous Station: ${item.previousStations || 'N/A'}`
            ]
          },
          {
            title: 'System Information',
            content: [
              `Unique Code: ${item.uniqueCode || 'N/A'}`,
              `Created At: ${formatDate(item.createdAt)}`
            ]
          }
        ];

        yPos = 35;
        doc.setDrawColor(200);

        sections.forEach(section => {
          // Check if we need to add a new page
          if (yPos > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPos = margin;
          }

          doc.setFontSize(12);
          doc.setTextColor(blueColor);
          doc.text(section.title, margin, yPos);
          yPos += 8;

          doc.setFontSize(10);
          doc.setTextColor(0);
          section.content.forEach(line => {
            if (yPos > doc.internal.pageSize.height - 20) {
              doc.addPage();
              yPos = margin;
            }
            doc.text(line, margin + 5, yPos);
            yPos += 8;
          });
          yPos += 10;

          doc.setLineWidth(0.2);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 15;
        });
      }

      doc.save('user-profiles.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };



 
  return (
    <Card sx={{ boxShadow: 3 }}>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f7fa' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === items.length}
                    indeterminate={selected.length > 0 && selected.length < items.length}
                    onChange={(e) => e.target.checked ? onSelectAll() : onDeselectAll()}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((customer) => (
                <TableRow
                  hover
                  key={customer.userId}
                  selected={selected.includes(customer.userId)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(customer.userId)}
                      onChange={(e) => e.target.checked ? onSelectOne(customer.userId) : onDeselectOne(customer.userId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={customer.passport?.url}
                      sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}
                    >
                      {getInitials(customer.first_name + ' ' + customer.last_name)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                  {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        display: 'inline-block'
                      }}
                    >
                      {customer.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleViewProfile(customer)}
                      sx={{ mr: 1 }}
                    >
                      View Profile
                    </Button>
                  
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(customer);
                        setAnchorEl(e.currentTarget);
                      }}
                    >
                      Change Role
                    </Button>
                    <Button
  variant="outlined"
  color="secondary"
  size="small"
  sx={{ ml: 1 }}
  onClick={() => {
    setSelectedEditUser(customer);
    setEditModalOpen(true);
  }}
>
  Edit
</Button>
                   
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>

      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={selectedProfile}
      />

      {/* Role Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {['admin', 'editor', 'viewer'].map((role) => (
          <MenuItem
            key={role}
            onClick={() => {
              setNewRole(role);
              setConfirmationOpen(true);
              setAnchorEl(null);
            }}
          >
            Set as {role}
          </MenuItem>
        ))}
      </Menu>

      {/* Role Change Confirmation */}
      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Confirm Role Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change {selectedUser?.firstName}'s role to {newRole}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
          <Button onClick={handleRoleChange} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Button */}
      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={selected.length === 0}
        >
          Export Selected ({selected.length})
        </Button>
      </Box>

      {/* User Details Modal */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Role updated successfully!
        </Alert>
      </Snackbar>

      <EditUserModal
  open={editModalOpen}
  onClose={() => {
    setEditModalOpen(false);
    setSelectedEditUser(null);
  }}
  user={selectedEditUser}
/>
    </Card>
  );
};



CustomersTable.propTypes = {
  items: PropTypes.array.isRequired,
  selected: PropTypes.array.isRequired,
  onSelectAll: PropTypes.func,
  onDeselectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  onDeselectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  count: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
};

UserProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object
};