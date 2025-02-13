import PropTypes from 'prop-types';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ClockIcon from '@heroicons/react/24/solid/ClockIcon';
import { Avatar, Box, Card, CardContent, Divider, Stack, SvgIcon, Typography,Modal, Button } from '@mui/material';
import React from 'react';

export const CompanyCard = (props) => {
  const { company } = props;

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  return (
    <>
   <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Avatar
          alt={'Samuel'}
          src={'https://lh3.googleusercontent.com/8m1yG92jL-sNShNCUO36lO4R22NuXH-9X0QeSOBVtnMSoGjNspaYXKCx6yvEpPQpBN10pUTPosslSyec=w544-h544-l90-rj'}
          sx={{ width: 56, height: 56, mb: 2, mx: 'auto' }}
        />
        <Typography id="modal-modal-title" variant="h6" component="h2" textAlign="center">
          {'@mbosowo'}
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }} textAlign="center">
          {'Hezekiaha'} {'Mbowkwkw'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
          <Button variant="contained" color="primary" onClick={() => alert('Accepted')}>
            Accept
          </Button>
          <Button variant="contained" color="secondary" onClick={() => alert('Declined')}>
            Decline
          </Button>
        </Box>
      </Box>
    </Modal>
    <Card
    onClick={handleOpen}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pb: 3
          }}
        >
          <Avatar
            src={company.logo}
            variant="square"
          />
        </Box>
        <Typography
          align="center"
          gutterBottom
          variant="h5"
        >
          {company.title}
        </Typography>
        <Typography
          align="center"
          variant="body1"
        >
          {company.description}
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <SvgIcon
            color="action"
            fontSize="small"
          >
            <ClockIcon />
          </SvgIcon>
          <Typography
            color="text.secondary"
            display="inline"
            variant="body2"
          >
            Updated 2hr ago
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <SvgIcon
            color="action"
            fontSize="small"
          >
            <ArrowDownOnSquareIcon />
          </SvgIcon>
          <Typography
            color="text.secondary"
            display="inline"
            variant="body2"
          >
            {company.downloads} Downloads
          </Typography>
        </Stack>
      </Stack>
    </Card>
    </>
  );
};

CompanyCard.propTypes = {
  company: PropTypes.object.isRequired
};

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}