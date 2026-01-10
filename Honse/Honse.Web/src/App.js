import { Outlet, useLocation } from 'react-router';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { UserProvider } from './contexts/AuthContext';
import {CartProvider} from "./contexts/CartContext";

function App() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';
    
    return (
        <>
            <UserProvider>
                <CartProvider>
                    {!isLandingPage && <Navbar />}
                    <Outlet />
                </CartProvider>
            </UserProvider>
        </>
    );
}

export default App;