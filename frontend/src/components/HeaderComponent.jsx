import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import  { useAuth } from './security/AuthContext'

function HeaderComponent() {

    const authContext = useAuth();
    const isAuthenticated = authContext.isAuthenticated;
    const defaultTheme = createTheme();

    const linkStyle = {
        mr: 2,
        '&:hover': {
            color: '#e0e0e0'
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <AppBar position="relative">
                <Toolbar>
                    <Link href="/" color="inherit" sx={linkStyle}><CameraIcon sx={{ ml: 2, mr: 2 }} /></Link>
                    <Link href="/merge-pdfs" color="inherit" sx={linkStyle}>Merge</Link>
                    <Link href="/split-pdfs" color="inherit" sx={linkStyle}>Split</Link>

                    <Box sx={{ flexGrow: 1 }} /> {/* To push "Sign Up" and "Sign In" to the right */}
                    
                    {isAuthenticated ? (
                        <Link href="/logout" color="inherit" sx={{ ...linkStyle, mr: 0 }}>Sign Out</Link>
                    ) : (
                        <>
                            <Link href="/signup" color="inherit" sx={linkStyle}>Sign Up</Link>
                            <Link href="/login" color="inherit" sx={{ ...linkStyle, mr: 0 }}>Sign In</Link>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
}

export default HeaderComponent