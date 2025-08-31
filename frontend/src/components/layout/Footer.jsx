import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Store, GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { ASSIGNMENT_SEED } from '../../utils/seedUtils';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 4,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Store color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Marketplace
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your trusted platform for buying and selling quality pre-owned items.
              Built with modern technology and secure transactions.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Assignment Seed: {ASSIGNMENT_SEED}
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" color="text.secondary" underline="hover">
                Browse Products
              </Link>
              <Link href="/about" color="text.secondary" underline="hover">
                About Us
              </Link>
              <Link href="/IEC2024058/healthz" color="text.secondary" underline="hover">
                System Status
              </Link>
              <Link href="/logs/recent" color="text.secondary" underline="hover">
                Activity Logs
              </Link>
            </Box>
          </Grid>

          {/* Contact & Social */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              support@marketplace.com
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Link href="https://github.com/Digvijay-x1" color="text.secondary">
                <GitHub />
              </Link>
              <Link href="#" color="text.secondary">
                <LinkedIn />
              </Link>
              <Link href="#" color="text.secondary">
                <Twitter />
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
            {' | '}
            <Link href="/about" color="inherit" underline="hover">
              Seed: {ASSIGNMENT_SEED}
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
