import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper
} from '@mui/material';
import { Home, ArrowBack, Search } from '@mui/icons-material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" fontWeight="bold" sx={{ fontSize: '6rem', mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
          
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;
