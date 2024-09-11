import { useState, useEffect, useCallback } from 'react';
import { Container, TextField, Grid, Box, Button } from '@mui/material';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import { debounce } from 'lodash'; // Import lodash debounce

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  // Debounced fetch function
  const fetchProducts = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        // Only fetch if there is a search term
        axios
          .get('http://localhost:3001/api/search', { params: { query } }) // Send query as parameter
          .then((response) => {
            setProducts(response.data);
          })
          .catch((error) => {
            console.error('Error fetching products:', error);
          });
      } else {
        setProducts([]); // Clear products if the search term is empty
      }
    }, 1000), // 1-second debounce
    []
  );

  useEffect(() => {
    fetchProducts(searchTerm); // Fetch products whenever searchTerm changes
  }, [searchTerm, fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Set search term, debounced fetch will trigger
  };

  const handleReset = () => {
    setSearchTerm('');
    setProducts([]); // Clear products on reset
  };

  return (
    <Container>
      <Box
        p={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Search Field and Reset Button Inline */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 600,
            mb: 4,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            sx={{ mr: 2 }}
            value={searchTerm}
            onChange={handleSearchChange} // Updated to use handleSearchChange
          />
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

        {/* Product Grid - Only render if products are available */}
        {products.length > 0 && (
          <Grid container spacing={2} justifyContent="center">
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ProductCard {...product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default App;
