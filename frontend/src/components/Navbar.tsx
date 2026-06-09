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

  ListItem,

  ListItemIcon,

  ListItemText,

  Button,

  FormControl,

  InputLabel,

  Select,

} from '@mui/material';

import {

  Menu as MenuIcon,

  Dashboard,

  Receipt,

  Inventory,

  Description,

  Category,

  Business,

  ShoppingCart,

  Percent,

  Warehouse,

  Assessment,

  Home,

  Language,

  LightMode,

  DarkMode,

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

  const { language, setLanguage, t } = useTranslation();

  const { user, logout } = useAuth();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();



  const menuItems = [

    { label: t.nav.accueil, icon: <Dashboard />, path: '/' },

    { label: t.nav.dashboard, icon: <Dashboard />, path: '/dashboard' },

    { label: t.nav.articles, icon: <Inventory />, path: '/articles' },

    { label: t.nav.tickets, icon: <Receipt />, path: '/tickets' },

    { label: t.nav.factures, icon: <Description />, path: '/factures' },

    { label: t.nav.familles, icon: <Category />, path: '/familles' },

    { label: t.nav.fournisseurs, icon: <Business />, path: '/fournisseurs' },

    { label: t.nav.commandes, icon: <ShoppingCart />, path: '/commandes' },

    { label: 'Stock', icon: <Warehouse />, path: '/stock' },

  ];





  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {

    setMobileMenuAnchor(event.currentTarget);

  };



  const handleMobileMenuClose = () => {

    setMobileMenuAnchor(null);

  };



  const handleNavigation = (path: string) => {

    navigate(path);

    handleMobileMenuClose();

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





  const drawerContent = (

    <Box sx={{ width: 250, pt: 2 }}>

      <Typography variant="h6" sx={{ p: 2, color: 'primary.main', fontWeight: 'bold' }}>

        MEGA-Central

      </Typography>

      <List>

        {menuItems.map((item) => (

          <ListItem

            button

            key={item.path}

            onClick={() => handleNavigation(item.path)}

            selected={location.pathname === item.path}

            sx={{

              mx: 1,

              borderRadius: 2,

              '&.Mui-selected': {

                backgroundColor: 'primary.main',

                color: 'white',

                '&:hover': {

                  backgroundColor: 'primary.dark',

                },

              },

            }}

          >

            <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : 'primary.main' }}>

              {item.icon}

            </ListItemIcon>

            <ListItemText primary={item.label} />

          </ListItem>

        ))}

      </List>

    </Box>

  );



  return (

    <>

      <AppBar position="sticky" sx={{ background: '#2c3e50' }}>

        <Toolbar>

          {isMobile && (

            <IconButton

              color="inherit"

              onClick={() => setDrawerOpen(true)}

              edge="start"

              sx={{ mr: 2 }}

            >

              <MenuIcon />

            </IconButton>

          )}

          

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>

            MEGA-Central

          </Typography>



          {!isMobile && (

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

              {menuItems.map((item) => (

                <Button

                  key={item.path}

                  color="inherit"

                  onClick={() => handleNavigation(item.path)}

                  startIcon={item.icon}

                  sx={{

                    px: 3,

                    py: 1.5,

                    fontSize: '1rem',

                    fontWeight: 'bold',

                    borderRadius: 2,

                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.3)' : 'transparent',

                    '&:hover': {

                      backgroundColor: 'rgba(255,255,255,0.2)',

                    },

                    textTransform: 'none',

                    minHeight: '48px',

                  }}

                >

                  {item.label}

                </Button>

              ))}

              

              {/* Sélecteur de langue à côté de déconnexion */}

              <FormControl size="small" sx={{ 

                minWidth: 80,

                '& .MuiOutlinedInput-root': {

                  borderRadius: 2,

                  background: 'rgba(255, 255, 255, 0.1)',

                  border: '1px solid rgba(255, 255, 255, 0.2)',

                  transition: 'all 0.3s ease',

                  '&:hover': {

                    background: 'rgba(255, 255, 255, 0.15)',

                    border: '1px solid rgba(255, 255, 255, 0.3)',

                  },

                }

              }}>

                <InputLabel 

                  id="language-select-label"

                  sx={{ 

                    color: 'rgba(255, 255, 255, 0.9)',

                    fontSize: '0.75rem',

                    fontWeight: 600,

                    transform: 'translate(14px, -6px) scale(0.85)',

                    backgroundColor: '#2c3e50',

                    padding: '0 4px'

                  }}

                >

                  <Language sx={{ mr: 0.5, fontSize: 14 }} />

                </InputLabel>

                <Select

                  labelId="language-select-label"

                  value={language}

                  label=""

                  onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}

                  sx={{ 

                    color: 'rgba(255, 255, 255, 0.9)',

                    fontSize: '0.875rem',

                    fontWeight: 600,

                    '& .MuiSelect-select': { 

                      py: 1.5,

                      px: 1,

                      backgroundColor: 'transparent',

                    },

                    '& .MuiOutlinedInput-notchedOutline': {

                      border: 'none'

                    },

                    '&:hover .MuiOutlinedInput-root': {

                      background: 'rgba(255, 255, 255, 0.15)',

                    },

                    '& .MuiSvgIcon-root': {

                      color: 'rgba(255, 255, 255, 0.9)',

                    }

                  }}

                >

                  <MenuItem value="fr" sx={{ 

                    fontSize: '0.875rem',

                    fontWeight: 600,

                    color: '#2c3e50'

                  }}>

                    🇫🇷 FR

                  </MenuItem>

                  <MenuItem value="en" sx={{ 

                    fontSize: '0.875rem',

                    fontWeight: 600,

                    color: '#2c3e50'

                  }}>

                    🇬🇧 EN

                  </MenuItem>

                </Select>

              </FormControl>



              {/* Bouton de basculement thème */}

              <Button

                color="inherit"

                onClick={handleThemeToggle}

                sx={{

                  px: 2,

                  py: 1.5,

                  fontSize: '0.875rem',

                  fontWeight: 'bold',

                  borderRadius: 2,

                  background: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',

                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',

                  '&:hover': {

                    background: darkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.4)',

                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',

                  },

                  textTransform: 'none',

                  minHeight: '48px',

                  minWidth: 'auto',

                  ml: 1,

                }}

                title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}

              >

                {darkMode ? <LightMode /> : <DarkMode />}

              </Button>

              

              {/* Badge de rôle utilisateur avec bouton déconnexion intégré */}

              <UserRoleBadge showLogout={true} />

            </Box>

          )}





          {isMobile && (

            <IconButton color="inherit" onClick={handleMobileMenuOpen}>

              <MenuIcon />

            </IconButton>

          )}

        </Toolbar>

      </AppBar>



      <Drawer

        anchor="left"

        open={drawerOpen}

        onClose={() => setDrawerOpen(false)}

        sx={{

          '& .MuiDrawer-paper': {

            background: 'linear-gradient(180deg, #1a1a1a, #2a2a2a)',

            borderRight: '1px solid rgba(255,255,255,0.1)',

          },

        }}

      >

        {drawerContent}

      </Drawer>



      <Menu

        anchorEl={mobileMenuAnchor}

        open={Boolean(mobileMenuAnchor)}

        onClose={handleMobileMenuClose}

        sx={{

          '& .MuiPaper': {

            background: '#1a1a1a',

            border: '1px solid rgba(255,255,255,0.1)',

          },

        }}

      >

        {menuItems.map((item) => (

          <MenuItem

            key={item.path}

            onClick={() => handleNavigation(item.path)}

            selected={location.pathname === item.path}

          >

            <ListItemIcon sx={{ color: 'primary.main' }}>

              {item.icon}

            </ListItemIcon>

            <ListItemText primary={item.label} />

          </MenuItem>

        ))}

      </Menu>

    </>

  );

};



export { Navbar };

