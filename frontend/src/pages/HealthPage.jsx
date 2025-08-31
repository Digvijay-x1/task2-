import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Computer,
  Storage,
  Speed
} from '@mui/icons-material';

import { ASSIGNMENT_SEED } from '../utils/seedUtils';
import useActivityStore from '../stores/activityStore';

const HealthPage = () => {
  const { logPageVisit } = useActivityStore();
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    logPageVisit('Health Check Page', '/IEC2024058/healthz');
    checkHealth();
  }, [logPageVisit]);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check frontend health
      const frontendHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        assignmentSeed: ASSIGNMENT_SEED,
        rollno: 'IEC2024058'
      };

      // Check backend health
      const backendResponse = await fetch('http://localhost:3000/IEC2024058/healthz');
      const backendHealth = await backendResponse.json();

      setHealthData({
        frontend: frontendHealth,
        backend: backendHealth,
        overall: backendResponse.ok ? 'healthy' : 'unhealthy'
      });
      
      setLastChecked(new Date().toISOString());
    } catch (error) {
      console.error('Health check failed:', error);
      setError(error.message);
      setHealthData({
        frontend: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          assignmentSeed: ASSIGNMENT_SEED,
          rollno: 'IEC2024058'
        },
        backend: {
          status: 'unhealthy',
          error: error.message
        },
        overall: 'unhealthy'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'unhealthy':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle />;
      case 'unhealthy':
        return <Error />;
      default:
        return <Speed />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Frontend Alive!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          System Health Check - Roll Number: IEC2024058
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assignment Seed: {ASSIGNMENT_SEED}
        </Typography>
      </Box>

      {/* Refresh Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
          onClick={checkHealth}
          disabled={isLoading}
        >
          {isLoading ? 'Checking...' : 'Refresh Health Check'}
        </Button>
        {lastChecked && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Last checked: {new Date(lastChecked).toLocaleString()}
          </Typography>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Backend connection failed: {error}
        </Alert>
      )}

      {/* Health Status Cards */}
      {healthData && (
        <Grid container spacing={3}>
          {/* Overall Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  {getStatusIcon(healthData.overall)}
                  <Typography variant="h4" fontWeight="bold">
                    System Status
                  </Typography>
                </Box>
                <Chip
                  label={healthData.overall.toUpperCase()}
                  color={getStatusColor(healthData.overall)}
                  size="large"
                  sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Frontend Health */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Computer color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Frontend Health
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={healthData.frontend.status.toUpperCase()}
                    color={getStatusColor(healthData.frontend.status)}
                    icon={getStatusIcon(healthData.frontend.status)}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Roll Number:</strong> {healthData.frontend.rollno}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Assignment Seed:</strong> {healthData.frontend.assignmentSeed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Timestamp:</strong> {new Date(healthData.frontend.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Backend Health */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Storage color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Backend Health
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={healthData.backend.status.toUpperCase()}
                    color={getStatusColor(healthData.backend.status)}
                    icon={getStatusIcon(healthData.backend.status)}
                  />
                </Box>

                {healthData.backend.status === 'healthy' ? (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Database:</strong> {healthData.backend.database}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Assignment Seed:</strong> {healthData.backend.assignmentSeed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Timestamp:</strong> {new Date(healthData.backend.timestamp).toLocaleString()}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="error">
                    <strong>Error:</strong> {healthData.backend.error}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Loading State */}
      {isLoading && !healthData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Additional Info */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Health Check Information
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This page provides real-time health status for both frontend and backend services.
          The frontend is always considered healthy if this page loads successfully.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Roll Number:</strong> IEC2024058 <br />
          <strong>Assignment Seed:</strong> {ASSIGNMENT_SEED} <br />
          <strong>Endpoint:</strong> /IEC2024058/healthz
        </Typography>
      </Paper>
    </Container>
  );
};

export default HealthPage;
