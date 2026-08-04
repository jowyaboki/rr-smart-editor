import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitIcon,
} from '@mui/icons-material';

// 1. Panel component
interface PanelProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  actions,
  children,
  collapsed,
  onToggleCollapse,
}) => {
  if (collapsed) {
    return (
      <Box
        sx={{
          width: '40px',
          bgcolor: '#102031',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
        }}
      >
        <IconButton onClick={onToggleCollapse} size="small" sx={{ color: '#b2bac2' }}>
          ➕
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#102031',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      {(title || actions || onToggleCollapse) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: '#0a1929',
            borderBottom: '1px solid #1e293b',
          }}
        >
          {title && (
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
              {title}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
            {onToggleCollapse && (
              <IconButton onClick={onToggleCollapse} size="small" sx={{ color: '#b2bac2', p: 0.5 }}>
                ➖
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>{children}</Box>
    </Box>
  );
};

// 2. Inspector component
interface InspectorProps {
  title: string;
  children: React.ReactNode;
}

export const Inspector: React.FC<InspectorProps> = ({ title, children }) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#102031' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #1e293b' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>{children}</Box>
    </Box>
  );
};

// 3. PropertyGrid component
interface PropertyGridProps {
  properties: Array<{ label: string; value: React.ReactNode }>;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: '12px 16px',
        alignItems: 'center',
        py: 1,
      }}
    >
      {properties.map((prop, idx) => (
        <React.Fragment key={idx}>
          <Typography variant="caption" sx={{ color: '#b2bac2', fontWeight: 'medium' }}>
            {prop.label}
          </Typography>
          <Box sx={{ color: '#ffffff' }}>{prop.value}</Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

// 4. Toolbar component
interface ToolbarProps {
  children: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        bgcolor: '#0a1929',
        borderBottom: '1px solid #1e293b',
      }}
    >
      {children}
    </Box>
  );
};

// 5. Sidebar component
interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <Box
      sx={{
        width: '240px',
        height: '100%',
        bgcolor: '#102031',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

// 6. ContextMenu component
interface ContextMenuProps {
  trigger: (onOpen: (e: React.MouseEvent) => void) => React.ReactNode;
  items: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ trigger, items }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget as HTMLElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {trigger(handleOpen)}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: '#102031',
            border: '1px solid #1e293b',
            color: '#ffffff',
          },
        }}
      >
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            onClick={() => {
              item.onClick();
              handleClose();
            }}
            sx={{ gap: 1.5, fontSize: '0.85rem' }}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// 7. Modal component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, actions }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: '#102031',
          border: '1px solid #1e293b',
          color: '#ffffff',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#b2bac2' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: '#1e293b', py: 2 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// 8. SearchBar component
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: <SearchIcon sx={{ color: '#b2bac2', mr: 1, fontSize: 18 }} />,
        sx: {
          height: '36px',
          bgcolor: '#0a1929',
          color: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1e293b',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90caf9',
          },
        },
      }}
    />
  );
};

// 9. CommandPalette Component
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: Array<{ label: string; category: string; action: () => void }>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, commands }) => {
  const [search, setSearch] = useState('');

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '10%',
          bgcolor: '#102031',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          color: '#ffffff',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Type a command or search workspace..." />
      </Box>
      <List sx={{ maxHeight: '300px', overflowY: 'auto', p: 0 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#b2bac2' }}>
              No commands found
            </Typography>
          </Box>
        ) : (
          filtered.map((cmd, idx) => (
            <MenuItem
              key={idx}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {cmd.label}
              </Typography>
              <Chip label={cmd.category} size="small" sx={{ bgcolor: '#0a1929', color: '#90caf9', height: 18, fontSize: '0.65rem' }} />
            </MenuItem>
          ))
        )}
      </List>
    </Dialog>
  );
};

// 10. EmptyState Component
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#b2bac2', mb: 3, maxWidth: 300 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
};

// 11. SkeletonLoader Component
export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={40} height={40} sx={{ bgcolor: '#1e293b', borderRadius: '4px' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" sx={{ bgcolor: '#1e293b' }} />
            <Skeleton variant="text" width="40%" sx={{ bgcolor: '#1e293b' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// 12. StatusBadge Component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getColors = () => {
    switch (status) {
      case 'success':
        return { bg: 'rgba(76, 175, 80, 0.1)', border: '#4caf50', text: '#4caf50' };
      case 'warning':
        return { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', text: '#ff9800' };
      case 'error':
        return { bg: 'rgba(244, 67, 54, 0.1)', border: '#f44336', text: '#f44336' };
      case 'info':
      default:
        return { bg: 'rgba(33, 150, 243, 0.1)', border: '#2196f3', text: '#2196f3' };
    }
  };

  const colors = getColors();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.25,
        borderRadius: '12px',
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: '0.75rem',
        fontWeight: 'bold',
      }}
    >
      {label}
    </Box>
  );
};

// 13. NotificationCenter Component
interface NotificationCenterProps {
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' }>;
  onClear: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClear,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#ffffff' }}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            width: '320px',
            bgcolor: '#102031',
            border: '1px solid #1e293b',
            color: '#ffffff',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#b2bac2' }}>
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: '1px solid #1e293b',
                whiteSpace: 'normal',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" sx={{ flexGrow: 1, mr: 2 }}>
                {notif.message}
              </Typography>
              <IconButton size="small" onClick={() => onClear(notif.id)} sx={{ color: '#b2bac2', p: 0.5 }}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

// 14. PlaybackControls Component
interface PlaybackControlsProps {
  playing: boolean;
  onPlayToggle: () => void;
  onSkipNext?: () => void;
  onSkipPrev?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playing,
  onPlayToggle,
  onSkipNext,
  onSkipPrev,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
      <IconButton onClick={onSkipPrev} size="small" sx={{ color: '#ffffff' }}>
        <SkipPreviousIcon />
      </IconButton>
      <IconButton
        onClick={onPlayToggle}
        sx={{
          bgcolor: '#90caf9',
          color: '#0a1929',
          '&:hover': { bgcolor: '#64b5f6' },
          p: 1,
        }}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </IconButton>
      <IconButton onClick={onSkipNext} size="small" sx={{ color: '#ffffff' }}>
        <SkipNextIcon />
      </IconButton>
    </Box>
  );
};

// 15. TimelineControls Component
interface TimelineControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFit,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#0a1929', p: 0.5, borderRadius: '4px' }}>
      <IconButton onClick={onZoomOut} size="small" sx={{ color: '#b2bac2' }}>
        <ZoomOutIcon fontSize="small" />
      </IconButton>
      <IconButton onClick={onZoomIn} size="small" sx={{ color: '#b2bac2' }}>
        <ZoomInIcon fontSize="small" />
      </IconButton>
      <IconButton onClick={onFit} size="small" sx={{ color: '#b2bac2' }}>
        <FitIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
