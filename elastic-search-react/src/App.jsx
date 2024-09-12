import React, { useState, useEffect, useCallback } from 'react';
import { Container, TextField, Grid, Box, Button, Switch, FormControlLabel } from '@mui/material';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import { debounce } from 'lodash';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [useElasticsearch, setUseElasticsearch] = useState(false);

  const apiUrl = useElasticsearch 
    ? 'http://localhost:3002/api/search'  // Elasticsearch backend
    : 'http://localhost:3001/api/search'; // Non-Elasticsearch backend

  const fetchProducts = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        axios
          .get(apiUrl, { params: { query } })
          .then((response) => {
            setProducts(response.data);
          })
          .catch((error) => {
            console.error('Error fetching products:', error);
          });
      } else {
        setProducts([]);
      }
    }, 300),
    [apiUrl]
  );

  useEffect(() => {
    fetchProducts(searchTerm);
  }, [searchTerm, fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm('');
    setProducts([]);
  };

  const handleToggleElasticsearch = () => {
    setUseElasticsearch(!useElasticsearch);
  };

  return (
    <Container>
      <Box p={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
        <FormControlLabel
          control={<Switch checked={useElasticsearch} onChange={handleToggleElasticsearch} />}
          label={useElasticsearch ? "Using Elasticsearch" : "Using Standard Search"}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, mb: 4 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            sx={{ mr: 2 }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

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