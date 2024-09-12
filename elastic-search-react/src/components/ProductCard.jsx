// src/components/ProductCard.jsx
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Rating,
  Box,
} from '@mui/material';

const ProductCard = ({ title, description, price, rating, image }) => {
  return (
    <Card sx={{ width: 250, marginBottom: 2 }}>
      <CardMedia component="img" height="140" image={image} alt={title} />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <Typography variant="h6" color="text.primary">
            ${price}
          </Typography>
          <Rating name="read-only" value={rating} readOnly />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
