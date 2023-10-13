import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginComponent from './LoginComponent';
import MergeComponent from './merge/MergeComponent';
import SplitComponent from './SplitComponent';
import LogoutComponent from './LogoutComponent';
import ErrorComponent from './ErrorComponent';
import HeaderComponent from './HeaderComponent';
import AuthProvider, { useAuth } from './security/AuthContext'
import AlbumComponent from './AlbumComponent';
import FooterComponent from './FooterComponent';
import './PdfTransformationApp.css'

export default function PdfTransformationApp() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

function AppContent() {

    const authContext = useAuth();

    return (
        <div className="main-content-wrapper">
            <HeaderComponent/>
            <Routes>
                <Route path="/" element={<AlbumComponent />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/merge-pdfs" element={<MergeComponent />} />
                <Route path="/split-pdfs" element={<SplitComponent />} />
                <Route path='/logout' element={
                    <AuthenticatedRoute>
                        <LogoutComponent />
                    </AuthenticatedRoute>
                } />
                <Route path="*" element={<ErrorComponent />} />
            </Routes>
            <FooterComponent/>
        </div>
    );
}

function AuthenticatedRoute({ children }) {
    const authContext = useAuth();

    if (authContext.isAuthenticated) {
        return children;
    }
    return <Navigate to="/" replace />;
}