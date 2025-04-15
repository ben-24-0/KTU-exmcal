import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './config/theme';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import './App.css';

// Pages
import Calendar from './pages/Calendar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminUtils from './pages/AdminUtils';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box className="app-container">
          <Routes>
            <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
            <Route path="/" element={<Layout isAdmin={isAdmin} />}>
              <Route index element={<Calendar />} />
              {isAdmin && <Route path="/admin" element={<Admin />} />}
              <Route path="/admin-utils" element={<AdminUtils />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 