import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  TextField,
  Grid,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Snackbar,
} from '@mui/material';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import { debounce } from 'lodash';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [useElasticsearch, setUseElasticsearch] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const apiUrl = useElasticsearch
    ? 'http://localhost:3003/api' // Elasticsearch backend
    : 'http://localhost:3001/api'; // Non-Elasticsearch backend

  const fetchProducts = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        axios
          .get(`${apiUrl}/search`, { params: { query } })
          .then((response) => {
            setProducts(response.data);
          })
          .catch((error) => {
            console.error('Error fetching products:', error);
            showSnackbar('Error fetching products');
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

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleReindex = () => {
    axios
      .get(`${apiUrl}/reindex`)
      .then(() => {
        showSnackbar('Reindexing completed successfully');
      })
      .catch((error) => {
        console.error('Error reindexing:', error);
        showSnackbar('Error reindexing');
      });
  };

  const handleHealthCheck = () => {
    axios
      .get(`${apiUrl}/es-health`)
      .then((response) => {
        showSnackbar(`Elasticsearch health: ${response.data.status}`);
      })
      .catch((error) => {
        console.error('Error checking health:', error);
        showSnackbar('Error checking Elasticsearch health');
      });
  };

  const handleFetchAllProducts = () => {
    axios
      .get(`${apiUrl}/products`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching all products:', error);
        showSnackbar('Error fetching all products');
      });
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
        <FormControlLabel
          control={
            <Switch
              checked={useElasticsearch}
              onChange={handleToggleElasticsearch}
            />
          }
          label={
            useElasticsearch ? 'Using Elasticsearch' : 'Using Standard Search'
          }
        />
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
            onChange={handleSearchChange}
          />
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          {useElasticsearch && (
            <>
              <Button variant="contained" onClick={handleReindex} sx={{ mr: 2 }}>
                Reindex
              </Button>
              <Button variant="contained" onClick={handleHealthCheck} sx={{ mr: 2 }}>
                Health Check
              </Button>
            </>
          )}
          <Button variant="contained" onClick={handleFetchAllProducts}>
            Fetch All Products
          </Button>
        </Box>

        {products.length > 0 && (
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard {...product} />
              </Grid>
            ))}
          </Grid>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default App;