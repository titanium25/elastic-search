import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  TextField,
  Box,
  Button,
  Typography,
  Snackbar,
  Divider,
} from '@mui/material';
import ProductCard from './components/ProductCard';
import axios from 'axios';
import { debounce } from 'lodash';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nonElasticProducts, setNonElasticProducts] = useState([]);
  const [elasticProducts, setElasticProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [fetchTimeNonElastic, setFetchTimeNonElastic] = useState(null);
  const [fetchTimeElastic, setFetchTimeElastic] = useState(null);

  const fetchNonElasticProducts = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        const startTime = performance.now(); // Start time

        axios
          .get(`http://localhost:3001/api/search`, { params: { query } })
          .then((response) => {
            const endTime = performance.now(); // End time
            const timeTaken = (endTime - startTime).toFixed(2); // Calculate time taken
            setFetchTimeNonElastic(timeTaken);
            setNonElasticProducts(response.data);
          })
          .catch((error) => {
            console.error(
              'Error fetching products from non-Elasticsearch backend:',
              error
            );
            showSnackbar(
              'Error fetching products from non-Elasticsearch backend'
            );
          });
      } else {
        setNonElasticProducts([]);
        setFetchTimeNonElastic(null);
      }
    }, 300),
    []
  );

  const fetchElasticProducts = useCallback(
    debounce((query) => {
      if (query.trim() !== '') {
        const startTime = performance.now(); // Start time

        axios
          .get(`http://localhost:3003/api/search`, { params: { query } })
          .then((response) => {
            const endTime = performance.now(); // End time
            const timeTaken = (endTime - startTime).toFixed(2); // Calculate time taken
            setFetchTimeElastic(timeTaken);
            setElasticProducts(response.data);
          })
          .catch((error) => {
            console.error(
              'Error fetching products from Elasticsearch backend:',
              error
            );
            showSnackbar('Error fetching products from Elasticsearch backend');
          });
      } else {
        setElasticProducts([]);
        setFetchTimeElastic(null);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchNonElasticProducts(searchTerm);
    fetchElasticProducts(searchTerm);
  }, [searchTerm, fetchNonElasticProducts, fetchElasticProducts]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm('');
    setNonElasticProducts([]);
    setElasticProducts([]);
    setFetchTimeNonElastic(null);
    setFetchTimeElastic(null);
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
      .get('http://localhost:3003/api/reindex')
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
      .get('http://localhost:3003/api/es-health')
      .then((response) => {
        showSnackbar(`Elasticsearch health: ${response.data.status}`);
      })
      .catch((error) => {
        console.error('Error checking Elasticsearch health:', error);
        showSnackbar('Error checking Elasticsearch health');
      });
  };

  return (
    <Container sx={{
      // display: 'flex',
      // flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f5f5f5',
    }}>
      <Box
        p={2}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 800, // Increased width
            mb: 4,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            sx={{
              mr: 2,
              '& .MuiInputBase-input': { fontSize: '1.25rem' }, // Increased font size
            }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

        {/* Buttons Section */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleReindex}>
            Reindex
          </Button>
          <Button variant="contained" onClick={handleHealthCheck}>
            Health Check
          </Button>
        </Box>

        {/* Products Display Section Side by Side */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '16px',
            height: '100%',
          }}
        >
          {/* Non-Elasticsearch Response */}
          <div style={{ flex: 1, marginRight: '8px' }}>
            <Typography variant="h6" align="center" sx={{ mb: 1 }}>
              Non-Elasticsearch Response
            </Typography>
            {fetchTimeNonElastic && (
              <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Fetch Time: {fetchTimeNonElastic} ms
              </Typography>
            )}
            {nonElasticProducts.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                }}
              >
                {nonElasticProducts.map((product) => (
                  <div key={product.id} style={{ width: 'calc(50% - 16px)' }}>
                    {' '}
                    {/* 2 columns */}
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body1" align="center">
                No products found.
              </Typography>
            )}
          </div>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          {/* Elasticsearch Response */}
          <div style={{ flex: 1, marginLeft: '8px' }}>
            <Typography variant="h6" align="center" sx={{ mb: 1 }}>
              Elasticsearch Response
            </Typography>
            {fetchTimeElastic && (
              <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Fetch Time: {fetchTimeElastic} ms
              </Typography>
            )}
            {elasticProducts.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'center',
                }}
              >
                {elasticProducts.map((product) => (
                  <div key={product.id} style={{ width: 'calc(50% - 16px)' }}>
                    {' '}
                    {/* 2 columns */}
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography variant="body1" align="center">
                No products found.
              </Typography>
            )}
          </div>
        </div>

        {/* Snackbar for Notifications */}
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
