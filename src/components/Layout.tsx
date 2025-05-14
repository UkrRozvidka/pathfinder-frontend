import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Delete as DeleteIcon } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface LayoutProps {
  children: React.ReactNode;
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const Layout: React.FC<LayoutProps> = ({ children, toggleColorMode, mode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userName, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            PathFinder
          </Typography>
          <IconButton
            sx={{ mr: 2 }}
            onClick={toggleColorMode}
            color="inherit"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                Welcome, {userName}
              </Typography>
              <Button color="inherit" onClick={() => navigate('/hikes/create')}>
                Create Hike
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 