import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  History,
  Refresh,
  ExpandMore,
  Search,
  ShoppingCart,
  Favorite,
  Visibility,
  Login,
  Logout,
  FilterList,
} from "@mui/icons-material";

import useActivityStore from "../stores/activityStore";
import { ASSIGNMENT_SEED } from "../utils/seedUtils";

const LogsPage = () => {
  const {
    getRecentActivities,
    getActivityStats,
    logPageVisit,
    clearActivities,
  } = useActivityStore();

  const [refreshKey, setRefreshKey] = useState(0);
  const activities = getRecentActivities(20); // Last 20 activities
  const stats = getActivityStats();

  useEffect(() => {
    logPageVisit("Logs Page", "/logs/recent");
  }, [logPageVisit]);

  // Separate effect for debugging (only runs when refreshKey changes)
  useEffect(() => {
    if (refreshKey > 0) {
      console.log("Current activities:", activities);
      console.log("Activity stats:", stats);
      console.log(
        "LocalStorage activity-storage:",
        localStorage.getItem("activity-storage")
      );
    }
  }, [refreshKey]);

  const getActionIcon = (action) => {
    switch (action) {
      case "SEARCH":
        return <Search fontSize="small" />;
      case "PRODUCT_VIEW":
        return <Visibility fontSize="small" />;
      case "CART_ACTION":
        return <ShoppingCart fontSize="small" />;
      case "FAVORITE_ACTION":
        return <Favorite fontSize="small" />;
      case "LOGIN":
        return <Login fontSize="small" />;
      case "LOGOUT":
        return <Logout fontSize="small" />;
      case "CATEGORY_FILTER":
      case "PRICE_FILTER":
        return <FilterList fontSize="small" />;
      default:
        return <History fontSize="small" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "LOGIN":
        return "success";
      case "LOGOUT":
        return "warning";
      case "CART_ACTION":
        return "primary";
      case "FAVORITE_ACTION":
        return "error";
      case "SEARCH":
        return "info";
      default:
        return "default";
    }
  };

  const formatActionDetails = (activity) => {
    const { action, details } = activity;

    switch (action) {
      case "SEARCH":
        return `Query: "${details.query}"${
          details.filters?.category
            ? ` | Category: ${details.filters.category}`
            : ""
        }`;
      case "PRODUCT_VIEW":
        return `Product: ${details.productName} (ID: ${details.productId})`;
      case "CART_ACTION":
        return `${details.action.toUpperCase()}: ${details.productName} (Qty: ${
          details.quantity
        })`;
      case "FAVORITE_ACTION":
        return `${details.action.toUpperCase()}: ${details.productName}`;
      case "PAGE_VISIT":
        return `Page: ${details.pageName} (${details.pageUrl})`;
      case "LOGIN":
        return `User: ${details.userEmail} | Role: ${details.userRole}`;
      case "LOGOUT":
        return "User logged out";
      case "CATEGORY_FILTER":
        return `Category: ${details.categoryName}`;
      case "PRICE_FILTER":
        return `Price: $${details.minPrice} - $${details.maxPrice}`;
      case "CHECKOUT":
        return `Order Total: $${details.orderTotal} | Items: ${details.itemCount}`;
      default:
        return JSON.stringify(details);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClearLogs = () => {
    clearActivities();
    setRefreshKey((prev) => prev + 1);
  };

  const handleTestLog = () => {
    logPageVisit("Test Activity", "/test");
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Recent Activity Logs
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Last 20 user actions tracked in local storage
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClearLogs}
          disabled={activities.length === 0}
        >
          Clear Logs
        </Button>
        <Button variant="outlined" color="info" onClick={handleTestLog}>
          Test Log
        </Button>
      </Box>

      {/* Activity Statistics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Actions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.searches}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Searches
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.productViews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Product Views
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {stats.cartActions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cart Actions
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      {activities.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <History sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No activities logged yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start browsing the marketplace to see your activity here
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Page</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={getActionIcon(activity.action)}
                      label={activity.action.replace("_", " ")}
                      color={getActionColor(activity.action)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatActionDetails(activity)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {activity.url}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Technical Details */}
      <Accordion sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Technical Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Storage:</strong> Activities are stored in browser
            localStorage using Zustand persist middleware
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Privacy:</strong> Sensitive data like full email addresses
            and user agents are redacted
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Retention:</strong> Only the last 20 activities are kept,
            older entries are automatically removed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Assignment Seed:</strong> {ASSIGNMENT_SEED} is integrated
            into all logged activities
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default LogsPage;
