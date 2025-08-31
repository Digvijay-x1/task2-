import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const hasRequiredRole = () => {
      switch (requiredRole) {
        case 'Admin':
          return user?.role === 'Admin';
        case 'Seller':
          return user?.role === 'Seller' || user?.role === 'Admin';
        case 'Buyer':
          return user?.role === 'Buyer' || user?.role === 'Seller' || user?.role === 'Admin';
        default:
          return true;
      }
    };

    if (!hasRequiredRole()) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h5" color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You need {requiredRole} privileges to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your current role: {user?.role}
          </Typography>
        </Box>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
