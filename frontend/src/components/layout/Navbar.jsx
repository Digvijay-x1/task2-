import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  AccountCircle,
  Store,
  Brightness4,
  Brightness7,
  Search,
  Menu as MenuIcon,
} from "@mui/icons-material";

import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import useFavoritesStore from "../../stores/favoritesStore";
import useThemeStore from "../../stores/themeStore";
import useActivityStore from "../../stores/activityStore";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { getFavoriteCount } = useFavoritesStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { logPageVisit, logLogout } = useActivityStore();

  const cartItemCount = getItemCount();
  const favoriteCount = getFavoriteCount();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    logLogout();
    handleMenuClose();
    navigate("/");
  };

  const handleNavigation = (path, pageName) => {
    logPageVisit(pageName, path);
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={4}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 1, md: 2 },
          minHeight: { xs: 56, md: 64 },
        }}
      >
        {/* Logo and Brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
          }}
        >
          <Store
            sx={{
              fontSize: { xs: 24, md: 32 },
              color: "primary.main",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
          />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "1.1rem", md: "1.5rem" },
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              "&:hover": {
                color: "primary.dark",
              },
              transition: "color 0.2s ease",
            }}
            onClick={() => handleNavigation("/", "Home")}
          >
            Marketplace
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/products"
            onClick={() => handleNavigation("/products", "Products")}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "action.hover",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Browse Products
          </Button>

          {isAuthenticated && user?.role === "Seller" && (
            <Button
              color="inherit"
              component={Link}
              to="/seller"
              onClick={() => handleNavigation("/seller", "Seller Dashboard")}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Seller Dashboard
            </Button>
          )}
        </Box>

        {/* Right side actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, md: 1 },
          }}
        >
          {/* Theme toggle */}
          <Tooltip
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <Tooltip title="Shopping Cart">
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  onClick={() => handleNavigation("/cart", "Cart")}
                  sx={{
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Badge
                    badgeContent={cartItemCount}
                    color="secondary"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      },
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Favorites */}
              <Tooltip title="Favorites">
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/favorites"
                  onClick={() => handleNavigation("/favorites", "Favorites")}
                  sx={{
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "action.hover",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Badge
                    badgeContent={favoriteCount}
                    color="secondary"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      },
                    }}
                  >
                    <Favorite />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User menu */}
              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  {user?.profilePicture ? (
                    <Avatar
                      src={user.profilePicture}
                      alt={user.name}
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircle sx={{ fontSize: 32 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.name} ({user?.role})
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleNavigation("/profile", "Profile");
                    handleMenuClose();
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleNavigation("/orders", "Orders");
                    handleMenuClose();
                  }}
                >
                  My Orders
                </MenuItem>
                {user?.role === "Seller" && (
                  <MenuItem
                    onClick={() => {
                      handleNavigation("/seller", "Seller Dashboard");
                      handleMenuClose();
                    }}
                  >
                    Seller Dashboard
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                onClick={() => handleNavigation("/login", "Login")}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/register"
                onClick={() => handleNavigation("/register", "Register")}
                sx={{ ml: 1 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
