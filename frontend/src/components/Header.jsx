import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export function Header() {
    const defaultTheme = createTheme();

    const linkStyle = {
        mr: 2,
        '&:hover': {
            textDecoration: 'underline',
            color: '#e0e0e0'
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <AppBar position="relative">
                <Toolbar>
                    <CameraIcon sx={{ ml: 2, mr: 2 }} />
                    <Link href="#" color="inherit" sx={linkStyle}>Merge</Link>
                    <Link href="#" color="inherit" sx={linkStyle}>Split</Link>
                    {/* ... other service links ... */}
                    <Box sx={{ flexGrow: 1 }} /> {/* To push "Sign Up" and "Sign In" to the right */}

                    {/* Sign Up and Sign In Links */}
                    <Link href="#" color="inherit" sx={linkStyle}>Sign Up</Link>
                    <Link href="#" color="inherit" sx={{ ...linkStyle, mr: 0 }}>Sign In</Link>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}