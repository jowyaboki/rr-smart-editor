import React from 'react';
import { Alert, Snackbar, Stack } from '@mui/material';
import { useRecoveryStore } from '../store/recoveryStore';

export const RecoveryNotifications: React.FC = () => {
  const notifications = useRecoveryStore((s) => s.notifications);
  const removeNotification = useRecoveryStore((s) => s.removeNotification);

  return (
    <Snackbar
      open={notifications.length > 0}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ zIndex: 2000 }}
    >
      <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
        {notifications.map((notif) => (
          <Alert
            key={notif.id}
            severity={notif.type}
            onClose={() => removeNotification(notif.id)}
            variant="filled"
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {notif.message}
          </Alert>
        ))}
      </Stack>
    </Snackbar>
  );
};
