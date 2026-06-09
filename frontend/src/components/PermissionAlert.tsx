import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Snackbar, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface PermissionAlertProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export const PermissionAlert: React.FC<PermissionAlertProps> = ({ message, open, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity="warning"
        onClose={onClose}
        sx={{
          width: '100%',
          maxWidth: '600px',
          '& .MuiAlert-message': {
            fontSize: '0.95rem',
            lineHeight: '1.4',
          }
        }}
      >
        <AlertTitle>⚠️ Permission Refusée</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

// Hook pour gérer les alertes de permission
export const usePermissionAlert = () => {
  const [alert, setAlert] = useState<{ message: string; open: boolean }>({
    message: '',
    open: false
  });

  const showPermissionAlert = (message: string) => {
    setAlert({ message, open: true });
  };

  const closeAlert = () => {
    setAlert({ message: '', open: false });
  };

  return {
    alert,
    showPermissionAlert,
    closeAlert
  };
};
