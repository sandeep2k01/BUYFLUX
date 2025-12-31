import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { VerificationBanner } from '../components/auth/VerificationBanner';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <VerificationBanner />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
