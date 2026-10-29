import React, { useState } from 'react';

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';

import {
  Menu as MenuIcon,
  Dashboard,
  Receipt,
  Inventory,
  Description,
  Category,
  Business,
  LightMode,
  DarkMode,
  AccountCircle,
  Logout,
  Home,
} from '@mui/icons-material';

import { useTranslation } from '../contexts/TranslationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRoleBadge } from './UserRoleBadge';

interface NavbarProps {
  darkMode?: boolean;
  setDarkMode?: (darkMode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode = true, setDarkMode }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: t.nav.accueil, icon: <Home />, path: '/' },
    { label: t.nav.dashboard, icon: <Dashboard />, path: '/dashboard' },
    { label: t.nav.articles, icon: <Inventory />, path: '/articles' },
    { label: t.nav.tickets, icon: <Receipt />, path: '/tickets' },
    { label: t.nav.factures, icon: <Description />, path: '/factures' },
    { label: t.nav.familles, icon: <Category />, path: '/familles' },
    { label: t.nav.fournisseurs, icon: <Business />, path: '/fournisseurs' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    if (setDarkMode) {
      setDarkMode(!darkMode);
    }
  };

  const handleAccountOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchor(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchor(null);
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: 'linear-gradient(180deg, #0f172a, #111827)',
        color: '#fff',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            background: 'linear-gradient(135deg, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          MEGA-Central
        </Typography>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Gestion commerciale
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            sx={{
              mb: 0.7,
              borderRadius: 2.5,
              color: 'rgba(255,255,255,0.85)',
              transition: 'all 0.25s ease',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                color: '#fff',
                boxShadow: '0 10px 25px rgba(37,99,235,0.3)',
              },
              '&:hover': {
                transform: 'translateX(4px)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          py: 0.5,
          background:
            'linear-gradient(90deg, rgba(15,23,42,0.97), rgba(30,41,59,0.95), rgba(15,23,42,0.97))',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(96,165,250,0.18)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 72,
              md: 78,
              lg: 82,
            },
            px: {
              xs: 2,
              md: 4,
              lg: 5,
            },
            gap: 1.5,
            maxWidth: '1700px',
            width: '100%',
            mx: 'auto',
          }}
        >
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            onClick={() => handleNavigation('/')}
            sx={{
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              letterSpacing: 0.5,
              mr: {
                md: 2,
                lg: 3,
              },
              fontSize: {
                xs: '1.1rem',
                md: '1.2rem',
                lg: '1.35rem',
              },
              background: 'linear-gradient(135deg, #ffffff, #93c5fd, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MEGA-Central
          </Typography>

          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: {
                  md: 0.5,
                  lg: 0.8,
                  xl: 1,
                },
                flex: 1,
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {menuItems.map((item) => (
                <Tooltip key={item.path} title={item.label}>
                  <Button
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      position: 'relative',
                      px: {
                        md: 1.2,
                        lg: 1.8,
                        xl: 2.2,
                      },
                      py: 1.2,
                      minWidth: 0,
                      minHeight: 44,
                      borderRadius: 2.5,
                      fontSize: {
                        md: '0.82rem',
                        lg: '0.92rem',
                        xl: '0.98rem',
                      },
                      fontWeight: 800,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      flexShrink: 1,
                      transition: 'all 0.25s ease',
                      background: isActive(item.path)
                        ? 'linear-gradient(135deg, rgba(37,99,235,0.45), rgba(14,165,233,0.35))'
                        : 'transparent',
                      boxShadow: isActive(item.path)
                        ? '0 8px 22px rgba(37,99,235,0.25)'
                        : 'none',

                      '&:hover': {
                        transform: 'translateY(-2px)',
                        background:
                          'linear-gradient(135deg, rgba(37,99,235,0.28), rgba(14,165,233,0.22))',
                        boxShadow: '0 8px 20px rgba(14,165,233,0.18)',
                      },

                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: '18%',
                        right: '18%',
                        bottom: 5,
                        height: '2px',
                        borderRadius: 2,
                        background: isActive(item.path)
                          ? 'linear-gradient(90deg, #38bdf8, #60a5fa)'
                          : 'transparent',
                        transition: 'all 0.25s ease',
                      },

                      '& .MuiButton-startIcon': {
                        mr: {
                          md: 0.5,
                          lg: 0.8,
                        },
                        transition: 'transform 0.25s ease',
                      },

                      '&:hover .MuiButton-startIcon': {
                        transform: 'scale(1.12)',
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: {
                          md: 'none',
                          lg: 'inline',
                        },
                      }}
                    >
                      {item.label}
                    </Box>
                  </Button>
                </Tooltip>
              ))}
            </Box>
          )}

          <Button
            color="inherit"
            onClick={handleAccountOpen}
            startIcon={<AccountCircle />}
            sx={{
              ml: 'auto',
              px: {
                xs: 1.8,
                md: 2.5,
              },
              py: 1.2,
              borderRadius: 999,
              minHeight: 46,
              fontWeight: 900,
              fontSize: '0.9rem',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(16,185,129,0.22))',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.18)',
              transition: 'all 0.25s ease',

              '&:hover': {
                transform: 'translateY(-2px)',
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(16,185,129,0.32))',
                boxShadow: '0 12px 30px rgba(37,99,235,0.28)',
              },
            }}
          >
            Compte
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={handleAccountClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 260,
            borderRadius: 3,
            background: darkMode ? '#111827' : '#ffffff',
            color: darkMode ? '#ffffff' : '#111827',
            border: darkMode
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <UserRoleBadge showLogout={false} />
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            handleThemeToggle();
            handleAccountClose();
          }}
        >
          {darkMode ? <LightMode sx={{ mr: 1.5 }} /> : <DarkMode sx={{ mr: 1.5 }} />}
          {darkMode ? 'Mode clair' : 'Mode sombre'}
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            handleAccountClose();
            handleLogout();
          }}
          sx={{ color: '#ef4444', fontWeight: 800 }}
        >
          <Logout sx={{ mr: 1.5 }} />
          Déconnexion
        </MenuItem>
      </Menu>
    </>
  );
};

export { Navbar };
