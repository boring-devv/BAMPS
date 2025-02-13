import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import CloseIcon from '@heroicons/react/24/solid/XCircleIcon';

export const AccountProfile = ({ data }) => {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };


  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if the pressed key is the "Escape" key (key code 27)
      if (event.key === 'Escape' || event.keyCode === 27) {
        // Add your logic here to handle the "Escape" key press
        setOpen(false)
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('keydown', handleKeyPress);

    // Detach the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);



  return (
    <>
      <Backdrop
        style={{ flex: 1 }}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <div style={{ zIndex: 10, cursor: 'pointer' }} onClick={handleClose}>
          <CloseIcon color='red' width={25} height={25} />
        </div>
        {/* <img src={data?.highlights[2]} style={{height:400,width:400}}/> */}
        <Carousel useKeyboardArrows={true} renderThumbs={(item) => {
          return null;
        }}>

          {data?.highlights?.map((URL, index) => (
            <div className="slide" key={index}>
              <img
                style={{ height: 350, width: 300, borderRadius: 10 }}
                alt="highlightImage"
                src={URL}
                key={index} />
            </div>
          ))}
        </Carousel>

        {/* <CircularProgress color="inherit" /> */}
      </Backdrop>
      <Card>
        <CardContent>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Avatar
              src={data?.photoUrl}
              sx={{
                height: 100,
                mb: 2,
                width: 100
              }}
            />
            <Typography
              gutterBottom
              variant="h5"
            >
              {data?.firstname}{' '}{data?.lastname}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              @{data?.username}
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {data?.institute}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            onClick={handleOpen}
            fullWidth
            variant="text"
          >
            User Highlights
          </Button>

        </CardActions>
        {data?.anthem && <div style={{ margin: 15,flexDirection:'row'}}>
          <img
            style={{ height: 70, width: 70, borderRadius: 10, backgroundColor: '#eee' }}
            src={data?.anthem?.anthemImg}
          />
          <div>
            <p>jjjj</p>
          </div>
        </div>}
      </Card>
    </>
  )
}
