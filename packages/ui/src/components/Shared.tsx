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

// 1. Panel Component with minimum/maximum boundaries and smooth hover animations
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
          minWidth: '40px',
          height: '100%',
          bgcolor: '#102031',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          transition: 'all 0.15s ease-in-out',
        }}
      >
        <IconButton
          onClick={onToggleCollapse}
          size="small"
          sx={{
            color: '#b2bac2',
            '&:hover': { color: '#90caf9', bgcolor: 'rgba(144,202,249,0.08)' },
          }}
        >
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
        minWidth: '150px',
        maxWidth: '100%',
        bgcolor: '#102031',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.15s ease-in-out',
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
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.2px', fontSize: '0.8rem' }}
            >
              {title}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
            {onToggleCollapse && (
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                sx={{
                  color: '#b2bac2',
                  p: 0.5,
                  transition: 'transform 0.15s ease',
                  '&:hover': { color: '#ff9800', transform: 'scale(1.1)' },
                }}
              >
                ➖
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#102031' }}>{children}</Box>
    </Box>
  );
};

// 2. Inspector Component with premium visual separation
interface InspectorProps {
  title: string;
  children: React.ReactNode;
}

export const Inspector: React.FC<InspectorProps> = ({ title, children }) => {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#102031',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #1e293b', bgcolor: '#0a1929' }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', color: '#ffffff', letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>{children}</Box>
    </Box>
  );
};

// 3. PropertyGrid Component with standard creative alignment
interface PropertyGridProps {
  properties: Array<{ label: string; value: React.ReactNode }>;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ properties }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: '8px 16px',
        alignItems: 'center',
        py: 0.5,
      }}
    >
      {properties.map((prop, idx) => (
        <React.Fragment key={idx}>
          <Typography
            variant="caption"
            sx={{
              color: '#b2bac2',
              fontWeight: 'medium',
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {prop.label}
          </Typography>
          <Box
            sx={{
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {prop.value}
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

// 4. Toolbar Component with aligned gap controls
interface ToolbarProps {
  children: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 0.75,
        bgcolor: '#0a1929',
        borderBottom: '1px solid #1e293b',
      }}
    >
      {children}
    </Box>
  );
};

// 5. Sidebar Component with modern spacing limits
interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#102031',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

// 6. ContextMenu component with smooth hover highlights and standard dark-theme styles
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            color: '#ffffff',
            borderRadius: '6px',
            minWidth: '160px',
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
            sx={{
              gap: 1.5,
              fontSize: '0.78rem',
              py: 1,
              transition: 'all 0.1s ease',
              '&:hover': {
                bgcolor: 'rgba(144, 202, 249, 0.08)',
                color: '#90caf9',
              },
            }}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// 7. Modal component with optimized dialog padding
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
          borderRadius: '8px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          color: '#ffffff',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', letterSpacing: '0.2px' }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#b2bac2',
            '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, bgcolor: '#102031' }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1e293b', bgcolor: '#0a1929' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

// 8. SearchBar Component with clean focused outlines
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
        startAdornment: <SearchIcon sx={{ color: '#b2bac2', mr: 1, fontSize: 16 }} />,
        sx: {
          height: '32px',
          fontSize: '0.78rem',
          bgcolor: '#0a1929',
          color: '#ffffff',
          borderRadius: '4px',
          transition: 'all 0.1s ease-in-out',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1e293b',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#b2bac2',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90caf9',
            borderWidth: '1.5px',
          },
        },
      }}
    />
  );
};

// 9. CommandPalette Component with unified search controls
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
          top: '15%',
          bgcolor: '#102031',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          color: '#ffffff',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #1e293b' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Type a command or search workspace..." />
      </Box>
      <List sx={{ maxHeight: '240px', overflowY: 'auto', p: 0 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#b2bac2', fontSize: '0.78rem' }}>
              No matching commands
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
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                justifyContent: 'space-between',
                transition: 'all 0.1s ease',
                '&:hover': {
                  bgcolor: 'rgba(144, 202, 249, 0.08)',
                  color: '#90caf9',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.78rem' }}>
                {cmd.label}
              </Typography>
              <Chip
                label={cmd.category}
                size="small"
                sx={{
                  bgcolor: '#0a1929',
                  color: '#90caf9',
                  height: 16,
                  fontSize: '0.6rem',
                  fontWeight: 'bold',
                  border: '1px solid rgba(144,202,249,0.15)',
                }}
              />
            </MenuItem>
          ))
        )}
      </List>
    </Dialog>
  );
};

// 10. EmptyState Component with clean aesthetic padding
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
        py: 6,
        px: 3,
        textAlign: 'center',
        bgcolor: 'rgba(255,255,255,0.01)',
        border: '1px dashed #1e293b',
        borderRadius: '6px',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ffffff', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: '#b2bac2', mb: 2, maxWidth: 280, display: 'block', lineHeight: 1.4 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
};

// 11. SkeletonLoader Component
export const SkeletonLoader: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            border: '1px solid #1e293b',
            borderRadius: '4px',
            bgcolor: 'rgba(255,255,255,0.01)',
          }}
        >
          <Skeleton variant="rectangular" width={32} height={32} sx={{ bgcolor: '#1e293b', borderRadius: '4px' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="50%" height={16} sx={{ bgcolor: '#1e293b' }} />
            <Skeleton variant="text" width="30%" height={12} sx={{ bgcolor: '#1e293b', mt: 0.5 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// 12. StatusBadge Component with flat/vibrant design parameters
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getColors = () => {
    switch (status) {
      case 'success':
        return { bg: 'rgba(76, 175, 80, 0.08)', border: 'rgba(76, 175, 80, 0.25)', text: '#4caf50' };
      case 'warning':
        return { bg: 'rgba(255, 152, 0, 0.08)', border: 'rgba(255, 152, 0, 0.25)', text: '#ff9800' };
      case 'error':
        return { bg: 'rgba(244, 67, 54, 0.08)', border: 'rgba(244, 67, 54, 0.25)', text: '#f44336' };
      case 'info':
      default:
        return { bg: 'rgba(144, 202, 249, 0.08)', border: 'rgba(144, 202, 249, 0.25)', text: '#90caf9' };
    }
  };

  const colors = getColors();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.25,
        borderRadius: '4px',
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: '0.68rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
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
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          color: '#ffffff',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon fontSize="small" />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            width: '280px',
            bgcolor: '#102031',
            border: '1px solid #1e293b',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            color: '#ffffff',
            borderRadius: '6px',
          },
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#0a1929' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            System Alerts
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#b2bac2' }}>
              No active warnings
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              sx={{
                py: 1.25,
                px: 2,
                borderBottom: '1px solid #1e293b',
                whiteSpace: 'normal',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
              }}
            >
              <Typography variant="caption" sx={{ flexGrow: 1, mr: 1.5, lineHeight: 1.3 }}>
                {notif.message}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onClear(notif.id)}
                sx={{
                  color: '#b2bac2',
                  p: 0.25,
                  '&:hover': { color: '#ffffff' },
                }}
              >
                <CloseIcon fontSize="inherit" style={{ fontSize: '10px' }} />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

// 14. PlaybackControls Component with focused borders
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <IconButton
        onClick={onSkipPrev}
        size="small"
        sx={{
          color: '#b2bac2',
          '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <SkipPreviousIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={onPlayToggle}
        sx={{
          bgcolor: '#90caf9',
          color: '#0a1929',
          width: '32px',
          height: '32px',
          transition: 'all 0.1s ease',
          '&:hover': { bgcolor: '#64b5f6', transform: 'scale(1.05)' },
          p: 0.5,
        }}
      >
        {playing ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
      </IconButton>
      <IconButton
        onClick={onSkipNext}
        size="small"
        sx={{
          color: '#b2bac2',
          '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <SkipNextIcon fontSize="small" />
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: '#0a1929',
        p: 0.5,
        borderRadius: '4px',
        border: '1px solid #1e293b',
      }}
    >
      <IconButton
        onClick={onZoomOut}
        size="small"
        sx={{
          color: '#b2bac2',
          p: 0.5,
          '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <ZoomOutIcon style={{ fontSize: '14px' }} />
      </IconButton>
      <IconButton
        onClick={onZoomIn}
        size="small"
        sx={{
          color: '#b2bac2',
          p: 0.5,
          '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <ZoomInIcon style={{ fontSize: '14px' }} />
      </IconButton>
      <IconButton
        onClick={onFit}
        size="small"
        sx={{
          color: '#b2bac2',
          p: 0.5,
          '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        <FitIcon style={{ fontSize: '14px' }} />
      </IconButton>
    </Box>
  );
};
