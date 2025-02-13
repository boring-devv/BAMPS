import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import EllipsisVerticalIcon from '@heroicons/react/24/solid/EllipsisVerticalIcon';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon
} from '@mui/material';
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from 'src/Firebase.config';

export const OverviewLatestProducts = (props) => {
  const { products = [], sx } = props;

  const [newVerifs,setNewVerifs]=useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "verifications"), orderBy("time", "desc"), limit(7)),
      (snapshot) => {
        const verifs = snapshot.docs.map((verif) => {
          return {
            id: verif.id,
            ...verif.data(),
          };
        });
  
        const filterVerifs = verifs.filter((wit) => wit?.attended === false || !wit?.attended);
        setNewVerifs(filterVerifs);
      }
    );
  
    return () => unsub();
  }, []);


  return (
    <Card sx={sx}>
      <CardHeader title="New Verifications" />
      <List>
        {newVerifs.map((product, index) => {
          const hasDivider = index < products.length - 1;
          const ago = formatDistanceToNow(product?.time?.seconds*1000);

          return (
            <ListItem
              divider={hasDivider}
              key={product?.id}
            >
              <ListItemAvatar>
                {
                  product?.docSrc
                    ? (
                      <Box
                        component="img"
                        style={{backgroundColor:'#eee'}}
                        src={product?.docSrc}
                        sx={{
                          borderRadius: 1,
                          height: 48,
                          width: 48
                        }}
                      />
                    )
                    : (
                      <Box
                        sx={{
                          borderRadius: 1,
                          backgroundColor: 'neutral.200',
                          height: 48,
                          width: 48
                        }}
                      />
                    )
                }
              </ListItemAvatar>
              <ListItemText
                primary={product?.fullName}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`Updated ${ago} ago`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <IconButton edge="end">
                <SvgIcon>
                  <EllipsisVerticalIcon />
                </SvgIcon>
              </IconButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={(
            <SvgIcon fontSize="small">
              <ArrowRightIcon />
            </SvgIcon>
          )}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewLatestProducts.propTypes = {
  products: PropTypes.array,
  sx: PropTypes.object
};
