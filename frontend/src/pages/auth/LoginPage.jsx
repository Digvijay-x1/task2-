import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Login, Store } from '@mui/icons-material';

import useAuthStore from '../../stores/authStore';
import useActivityStore from '../../stores/activityStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { logPageVisit, logLogin } = useActivityStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    logPageVisit('Login Page', '/login');
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, logPageVisit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData);
    
    if (result.success) {
      logLogin(result.user.email, result.user.role);
      navigate(from, { replace: true });
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Store
              color="primary"
              sx={{
                fontSize: { xs: 40, md: 56 },
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.125rem' },
                mb: 1
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
            >
              Sign in to your marketplace account
            </Typography>
          </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
            autoComplete="email"
            autoFocus
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Login />}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Demo Accounts */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Demo Accounts
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFormData({ email: 'buyer@marketplace.com', password: 'buyer123' })}
            >
              Demo Buyer Account
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFormData({ email: 'seller@marketplace.com', password: 'seller123' })}
            >
              Demo Seller Account
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setFormData({ email: 'admin@marketplace.com', password: 'admin123' })}
            >
              Demo Admin Account
            </Button>
          </Box>
        </Box>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default LoginPage;
