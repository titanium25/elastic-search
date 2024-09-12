import PropTypes from 'prop-types';  // Import PropTypes
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
    <Card sx={{ width: 250, height: 350, marginBottom: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardMedia component="img" height="140" image={image} alt={title} />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </div>
        {/* Price and Rating Box - always at the bottom */}
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

// Define PropTypes for the component
ProductCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
};

export default ProductCard;
