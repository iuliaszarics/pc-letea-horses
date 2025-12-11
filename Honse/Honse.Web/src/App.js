import { Outlet } from 'react-router';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { UserProvider } from './contexts/AuthContext';
import {CartProvider} from "./contexts/CartContext";

function App() {
    return (
        <>
            <UserProvider>
                <CartProvider>
                    <Navbar />
                    <Outlet />
                </CartProvider>
            </UserProvider>
        </>
    );
}

export default App;