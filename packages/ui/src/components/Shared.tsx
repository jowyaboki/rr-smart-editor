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
import { DESIGN_TOKENS } from '../theme';

// Layout Persistence Abstract Interface for LocalStorage or future Cloud Sync
export const LayoutPersistenceService = {
  savePreset: (presetName: string, state: any) => {
    try {
      localStorage.setItem(`rr_layout_preset_data_${presetName}`, JSON.stringify(state));
    } catch (e) {
      console.error('Error persisting layout preset:', e);
    }
  },
  loadPreset: (presetName: string) => {
    try {
      const data = localStorage.getItem(`rr_layout_preset_data_${presetName}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  exportWorkspace: () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('rr_'));
    const exportObj: Record<string, string | null> = {};
    keys.forEach((k) => {
      exportObj[k] = localStorage.getItem(k);
    });
    return JSON.stringify(exportObj, null, 2);
  },
  importWorkspace: (jsonStr: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      Object.keys(obj).forEach((k) => {
        if (k.startsWith('rr_')) {
          localStorage.setItem(k, obj[k]);
        }
      });
      return true;
    } catch {
      return false;
    }
  },
};

// 1. Panel Component with minimum/maximum boundaries and smooth hover animations
interface PanelProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  tabGroup?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  pinned?: boolean;
  onTogglePin?: () => void;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  actions,
  children,
  collapsed,
  onToggleCollapse,
  tabGroup,
  activeTab,
  onTabChange,
  pinned,
  onTogglePin,
}) => {
  if (collapsed) {
    return (
      <Box
        sx={{
          width: '40px',
          minWidth: '40px',
          height: '100%',
          bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
          borderRight: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
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
            color: DESIGN_TOKENS.colors.dark.textSecondary,
            '&:hover': {
              color: DESIGN_TOKENS.colors.dark.accentPrimary,
              bgcolor: 'rgba(0,240,255,0.08)',
            },
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
        bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
        border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
        borderRadius: DESIGN_TOKENS.borderRadius.sm,
        overflow: 'hidden',
        boxShadow: DESIGN_TOKENS.shadows.panel,
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          borderColor: DESIGN_TOKENS.colors.dark.borderHover,
        },
      }}
    >
      {(title || actions || onToggleCollapse || tabGroup) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 0.75,
            bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
            borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
          }}
        >
          {tabGroup && tabGroup.length > 0 ? (
            <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', mr: 2 }}>
              {tabGroup.map((tab) => {
                const isSel = activeTab === tab;
                return (
                  <Button
                    key={tab}
                    size="small"
                    onClick={() => onTabChange?.(tab)}
                    sx={{
                      fontSize: '0.7rem',
                      px: 1.5,
                      py: 0.25,
                      minWidth: 'unset',
                      color: isSel
                        ? DESIGN_TOKENS.colors.dark.accentPrimary
                        : DESIGN_TOKENS.colors.dark.textSecondary,
                      borderBottom: isSel
                        ? `2px solid ${DESIGN_TOKENS.colors.dark.accentPrimary}`
                        : 'none',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: 'rgba(0, 240, 255, 0.04)',
                      },
                    }}
                  >
                    {tab}
                  </Button>
                );
              })}
            </Box>
          ) : (
            title && (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: DESIGN_TOKENS.typography.weight.bold,
                  color: DESIGN_TOKENS.colors.dark.textPrimary,
                  letterSpacing: '0.2px',
                  fontSize: DESIGN_TOKENS.typography.size.caption,
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Typography>
            )
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {actions}
            {onTogglePin && (
              <IconButton
                onClick={onTogglePin}
                size="small"
                sx={{
                  color: pinned
                    ? DESIGN_TOKENS.colors.dark.accentPrimary
                    : DESIGN_TOKENS.colors.dark.textSecondary,
                  p: 0.5,
                  '&:hover': { color: DESIGN_TOKENS.colors.dark.accentPrimary },
                }}
              >
                📌
              </IconButton>
            )}
            {onToggleCollapse && (
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                sx={{
                  color: DESIGN_TOKENS.colors.dark.textSecondary,
                  p: 0.5,
                  transition: 'transform 0.15s ease',
                  '&:hover': {
                    color: DESIGN_TOKENS.colors.dark.accentSecondary,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                ➖
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      <Box
        sx={{ flexGrow: 1, overflow: 'auto', p: 1.5, bgcolor: DESIGN_TOKENS.colors.dark.bgPaper }}
      >
        {children}
      </Box>
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
        bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
        border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
        borderRadius: DESIGN_TOKENS.borderRadius.sm,
        boxShadow: DESIGN_TOKENS.shadows.panel,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
          bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: DESIGN_TOKENS.typography.weight.bold,
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: DESIGN_TOKENS.typography.size.caption,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>{children}</Box>
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
              color: DESIGN_TOKENS.colors.dark.textSecondary,
              fontWeight: DESIGN_TOKENS.typography.weight.medium,
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
              color: DESIGN_TOKENS.colors.dark.textPrimary,
              fontSize: DESIGN_TOKENS.typography.size.body2,
              fontWeight: DESIGN_TOKENS.typography.weight.bold,
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
        bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
        borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
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
        bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
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
            bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
            border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            boxShadow: DESIGN_TOKENS.shadows.dropdown,
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            borderRadius: DESIGN_TOKENS.borderRadius.sm,
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
                bgcolor: 'rgba(0, 240, 255, 0.08)',
                color: DESIGN_TOKENS.colors.dark.accentPrimary,
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
          bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
          border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
          borderRadius: DESIGN_TOKENS.borderRadius.md,
          boxShadow: DESIGN_TOKENS.shadows.dropdown,
          color: DESIGN_TOKENS.colors.dark.textPrimary,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: DESIGN_TOKENS.typography.weight.bold, letterSpacing: '0.2px' }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: DESIGN_TOKENS.colors.dark.textSecondary,
            '&:hover': {
              color: DESIGN_TOKENS.colors.dark.textPrimary,
              bgcolor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, bgcolor: DESIGN_TOKENS.colors.dark.bgPaper }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
          }}
        >
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
        startAdornment: (
          <SearchIcon
            sx={{ color: DESIGN_TOKENS.colors.dark.textSecondary, mr: 1, fontSize: 16 }}
          />
        ),
        sx: {
          height: '32px',
          fontSize: '0.78rem',
          bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
          color: DESIGN_TOKENS.colors.dark.textPrimary,
          borderRadius: '4px',
          transition: 'all 0.1s ease-in-out',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: DESIGN_TOKENS.colors.dark.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: DESIGN_TOKENS.colors.dark.textSecondary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: DESIGN_TOKENS.colors.dark.accentPrimary,
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
      cmd.category.toLowerCase().includes(search.toLowerCase()),
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
          bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
          border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
          borderRadius: DESIGN_TOKENS.borderRadius.md,
          boxShadow: DESIGN_TOKENS.shadows.dropdown,
          color: DESIGN_TOKENS.colors.dark.textPrimary,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}` }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Type a command or search workspace..."
        />
      </Box>
      <List sx={{ maxHeight: '240px', overflowY: 'auto', p: 0 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: DESIGN_TOKENS.colors.dark.textSecondary, fontSize: '0.78rem' }}
            >
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
                  bgcolor: 'rgba(0, 240, 255, 0.08)',
                  color: DESIGN_TOKENS.colors.dark.accentPrimary,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: DESIGN_TOKENS.typography.weight.medium, fontSize: '0.78rem' }}
              >
                {cmd.label}
              </Typography>
              <Chip
                label={cmd.category}
                size="small"
                sx={{
                  bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
                  color: DESIGN_TOKENS.colors.dark.accentPrimary,
                  height: 16,
                  fontSize: '0.6rem',
                  fontWeight: DESIGN_TOKENS.typography.weight.bold,
                  border: `1px solid rgba(0, 240, 255, 0.15)`,
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
        border: `1px dashed ${DESIGN_TOKENS.colors.dark.border}`,
        borderRadius: DESIGN_TOKENS.borderRadius.sm,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: DESIGN_TOKENS.typography.weight.bold,
          color: DESIGN_TOKENS.colors.dark.textPrimary,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          mb: 2,
          maxWidth: 280,
          display: 'block',
          lineHeight: 1.4,
        }}
      >
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
            border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            borderRadius: '4px',
            bgcolor: 'rgba(255,255,255,0.01)',
          }}
        >
          <Skeleton
            variant="rectangular"
            width={32}
            height={32}
            sx={{ bgcolor: DESIGN_TOKENS.colors.dark.border, borderRadius: '4px' }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton
              variant="text"
              width="50%"
              height={16}
              sx={{ bgcolor: DESIGN_TOKENS.colors.dark.border }}
            />
            <Skeleton
              variant="text"
              width="30%"
              height={12}
              sx={{ bgcolor: DESIGN_TOKENS.colors.dark.border, mt: 0.5 }}
            />
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
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.25)',
          text: DESIGN_TOKENS.colors.dark.success,
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.25)',
          text: DESIGN_TOKENS.colors.dark.warning,
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.25)',
          text: DESIGN_TOKENS.colors.dark.error,
        };
      case 'info':
      default:
        return {
          bg: 'rgba(0, 240, 255, 0.08)',
          border: 'rgba(0, 240, 255, 0.25)',
          text: DESIGN_TOKENS.colors.dark.accentPrimary,
        };
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
          color: DESIGN_TOKENS.colors.dark.textPrimary,
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
            bgcolor: DESIGN_TOKENS.colors.dark.bgPaper,
            border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            boxShadow: DESIGN_TOKENS.shadows.dropdown,
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            borderRadius: DESIGN_TOKENS.borderRadius.sm,
          },
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: DESIGN_TOKENS.typography.weight.bold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            System Alerts
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: DESIGN_TOKENS.colors.dark.textSecondary }}>
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
                borderBottom: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
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
                  color: DESIGN_TOKENS.colors.dark.textSecondary,
                  p: 0.25,
                  '&:hover': { color: DESIGN_TOKENS.colors.dark.textPrimary },
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
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          '&:hover': {
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            bgcolor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <SkipPreviousIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={onPlayToggle}
        sx={{
          bgcolor: DESIGN_TOKENS.colors.dark.accentPrimary,
          color: DESIGN_TOKENS.colors.dark.bgMain,
          width: '32px',
          height: '32px',
          transition: 'all 0.1s ease',
          '&:hover': { bgcolor: '#00d0f0', transform: 'scale(1.05)' },
          p: 0.5,
        }}
      >
        {playing ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
      </IconButton>
      <IconButton
        onClick={onSkipNext}
        size="small"
        sx={{
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          '&:hover': {
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            bgcolor: 'rgba(255,255,255,0.05)',
          },
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
        bgcolor: DESIGN_TOKENS.colors.dark.bgMain,
        p: 0.5,
        borderRadius: '4px',
        border: `1px solid ${DESIGN_TOKENS.colors.dark.border}`,
      }}
    >
      <IconButton
        onClick={onZoomOut}
        size="small"
        sx={{
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          p: 0.5,
          '&:hover': {
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            bgcolor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <ZoomOutIcon style={{ fontSize: '14px' }} />
      </IconButton>
      <IconButton
        onClick={onZoomIn}
        size="small"
        sx={{
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          p: 0.5,
          '&:hover': {
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            bgcolor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <ZoomInIcon style={{ fontSize: '14px' }} />
      </IconButton>
      <IconButton
        onClick={onFit}
        size="small"
        sx={{
          color: DESIGN_TOKENS.colors.dark.textSecondary,
          p: 0.5,
          '&:hover': {
            color: DESIGN_TOKENS.colors.dark.textPrimary,
            bgcolor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <FitIcon style={{ fontSize: '14px' }} />
      </IconButton>
    </Box>
  );
};
