import { useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Code,
  Palette,
  Security,
  Speed,
  Store,
  CheckCircle,
} from "@mui/icons-material";

import { getSeedInfo, ASSIGNMENT_SEED } from "../utils/seedUtils";
import { seedInfo } from "../theme/muiTheme";
import useActivityStore from "../stores/activityStore";

const AboutPage = () => {
  const { logPageVisit } = useActivityStore();
  const seedData = getSeedInfo();

  useEffect(() => {
    logPageVisit("About Page", "/about");
  }, [logPageVisit]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 6 },
            px: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mb: 2,
            }}
          >
            About Marketplace
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Your trusted platform for quality pre-owned items
          </Typography>
        </Box>

        {/* Assignment Seed Display - MANDATORY REQUIREMENT */}
        <Card
          elevation={8}
          sx={{
            mb: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${seedInfo.primaryColor}15, ${seedInfo.accentColor}15)`,
            border: `3px solid ${seedInfo.primaryColor}`,
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${seedInfo.primaryColor}05, transparent)`,
              zIndex: 1,
            },
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: { xs: 4, md: 6 },
              px: { xs: 3, md: 4 },
              position: "relative",
              zIndex: 2,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                fontSize: { xs: "1.5rem", md: "2rem" },
                mb: 3,
              }}
            >
              <Code color="primary" sx={{ fontSize: { xs: 28, md: 32 } }} />
              Assignment Seed
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Paper
                elevation={4}
                sx={{
                  display: "inline-block",
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  bgcolor: seedInfo.primaryColor,
                  color: "white",
                  border: `2px solid ${seedInfo.accentColor}`,
                  boxShadow: `0 8px 32px ${seedInfo.primaryColor}40`,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {ASSIGNMENT_SEED}
                </Typography>
              </Paper>
            </Box>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Seed Number
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {seedData.seedNumber}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Platform Fee
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {seedData.platformFeePercentage}%
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    Theme Hue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {seedData.hue}°
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: seedData.primaryColor,
                  border: "3px solid white",
                  boxShadow: 2,
                }}
                title="Primary Color"
              />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: seedData.accentColor,
                  border: "3px solid white",
                  boxShadow: 2,
                }}
                title="Accent Color"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Security color="primary" />
                  <Typography variant="h5" fontWeight="bold">
                    Secure & Reliable
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="JWT-based authentication" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Rate limiting & HMAC signatures" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Idempotency protection" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Secure checkout process" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Speed color="primary" />
                  <Typography variant="h5" fontWeight="bold">
                    Modern Technology
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="React with Material-UI design" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Zustand state management" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="TanStack Query for data fetching" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Responsive mobile-first design" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Seed-Based Features */}
        <Card>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Palette color="primary" />
              Seed-Based Features
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Dynamic Color Theme
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  The entire color scheme is generated from the assignment seed{" "}
                  {ASSIGNMENT_SEED}, creating a unique visual identity with HSL
                  color calculations.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Platform Fee Calculation
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Platform fees are calculated as ({seedData.seedNumber} % 10)%
                  = {seedData.platformFeePercentage}% of the subtotal, ensuring
                  consistent pricing based on the seed.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Product ID Checksums
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  All product IDs include a checksum digit derived from the seed
                  for additional verification and unique identification.
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Graceful Fallbacks
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  The application gracefully handles missing seed values with
                  default themes and continues to function normally.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AboutPage;
