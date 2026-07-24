import React from 'react';
import { Chip, Avatar, Box } from '@mui/material';
import { Business, Person, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserRoleBadgeProps {
  showLogout?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ showLogout = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Chip
        avatar={
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: isAdmin ? 'primary.main' : 'secondary.main',
              color: 'white',
            }}
          >
            {isAdmin ? <Business fontSize="small" /> : <Person fontSize="small" />}
          </Avatar>
        }
        label={isAdmin ? 'Admin' : 'Manager'}
        color={isAdmin ? 'primary' : 'secondary'}
        variant="filled"
        clickable
        onClick={() => navigate('/profile')}
        sx={{
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: 0.8,
          px: 2.5,
          py: 1.2,
          height: 36,
          borderRadius: 18,
          textTransform: 'uppercase',
          cursor: 'pointer',
          '& .MuiChip-label': {
            px: 1.5,
          },
          ...(isAdmin
            ? {
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }
            : {
                background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(73, 80, 87, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }),
        }}
      />

      {showLogout && (
        <Chip
          avatar={
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'error.main',
                color: 'white',
              }}
            >
              <Logout fontSize="small" />
            </Avatar>
          }
          label="Déconnexion"
          color="error"
          variant="filled"
          onClick={handleLogout}
          clickable
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: 0.8,
            px: 2.5,
            py: 1.2,
            height: 36,
            borderRadius: 18,
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '& .MuiChip-label': {
              px: 1.5,
            },
            background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(108, 117, 125, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(108, 117, 125, 0.4)',
              background: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
            },
          }}
        />
      )}
    </Box>
  );
};
