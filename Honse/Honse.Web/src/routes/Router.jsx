import {createBrowserRouter} from 'react-router';
import App from '../App';
import LandingPage from '../pages/public/LandingPage/LandingPage';
import RestaurantsListPage from '../pages/public/RestaurantsListPage/RestaurantsListPage';
import RestaurantMenuPage from '../pages/public/RestaurantMenuPage/RestaurantMenuPage';

import AuthenticatedRoute from '../routes/AuthenticatedRoute';
import UnauthenticatedRoute from '../routes/UnauthenticatedRoute';

import LoginPage from '../pages/public/Auth/LoginPage';
import RegisterPage from '../pages/public/Auth/RegisterPage';
import AllProductsPage from '../pages/private/products/AllProductsPage';
import AddProductPage from '../pages/private/products/AddProductPage';
import AllRestaurantsPage from '../pages/private/restaurants/AllRestaurantsPage';
import AddRestaurantPage from '../pages/private/restaurants/AddRestaurantPage';
import AllConfigurationsPage from '../pages/private/configurations/AllConfigurationsPage';
import AddConfigurationPage from '../pages/private/configurations/AddConfigurationPage';
import OrderTrackingPage from '../pages/public/OrderTrackingPage/OrderTrackingPage';
import AllOrdersPage from '../pages/private/orders/AllOrdersPage';
import OrderDetailsPage from '../pages/private/orders/OrderDetailsPage';
import AccountSettingsPage from "../pages/private/settings/AccountSettingsPage";
import AllSalesPage from '../pages/private/sales/AllSalesPage';
import SalesDetailsPage from '../pages/private/sales/SalesDetailsPage';

import CheckoutPage from "../pages/public/Checkout/CheckoutPage";
import OrderEmailConfirmationPage from "../pages/public/Checkout/OrderEmailConfirmationPage";
import ConfirmOrderPage from '../pages/public/OrderTrackingPage/ConfirmOrderPage';
import DashboardPage from '../pages/private/Dashboard/DashboardPage';
export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        // errorElement: <ErrorPage/>,
        children: [
            // {path: "/", element: <UnauthentificatedRoute redirectPage='/events'><LandingPage /></UnauthentificatedRoute>},
            // {path: "/events", element:<AuthentificatedRoute redirectPage='/login'><EventsPage /></AuthentificatedRoute>},
            // {path: "/events/:id", element:<AuthentificatedRoute redirectPage='/login'><EventDetailsPage /></AuthentificatedRoute>},
            // {path: "/login", element: <UnauthentificatedRoute redirectPage='/events'><LoginPage /></UnauthentificatedRoute>},
            // {path: "/register", element: <UnauthentificatedRoute redirectPage='/events'><RegisterPage /></UnauthentificatedRoute>},

            // PUBLIC PAGES - anyone can access them

            // Landing page: /
            { path: "/", element: <LandingPage /> },
            
            // Public pages
            {path: "/public", element: <RestaurantsListPage />},

            // Restaurants list page : /public/restaurants
            {path: "/public/restaurants", element: <RestaurantsListPage />},

            // Restaurant menu page : /public/restaurants/:id
            {path: "/public/restaurants/:restaurantId", element: <RestaurantMenuPage />},

            // Checkout page: /public/restaurants/:restaurantId/checkout
            {path: "/public/restaurants/:restaurantId/checkout", element: <CheckoutPage />},

            // Email confirmation page
            {path: "/order/confirm-email", element: <OrderEmailConfirmationPage />},

            // UNAUTHENTICATED PAGES

            { path: "/login",
                element: (
                    <UnauthenticatedRoute redirectPage='/dashboard'>
                        <LoginPage />
                    </UnauthenticatedRoute>
                )
            },
            { path: "/public/login",
                element: (
                    <UnauthenticatedRoute redirectPage='/dashboard'>
                        <LoginPage />
                    </UnauthenticatedRoute>
                )
            },
            { path: "/register",
                element: (
                    <UnauthenticatedRoute redirectPage='/dashboard'>
                        <RegisterPage />
                    </UnauthenticatedRoute>
                )
            },
            { path: "/public/register",
                element: (
                    <UnauthenticatedRoute redirectPage='/dashboard'>
                        <RegisterPage />
                    </UnauthenticatedRoute>
                )
            },

             { path: "/public/order-tracking/:id",
                element: (
                        < OrderTrackingPage/>
                )
            },
            
             { path: "/public/confirm-order/:id",
                element: (
                        <ConfirmOrderPage/>
                )
            },

            // PRIVATE PAGES


             {
                path: "/products",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AllProductsPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/products/add",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                    <AddProductPage />
                    </AuthenticatedRoute>
                ),

            },
            {
                path: "/products/edit/:id",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                    <AddProductPage />
                    </AuthenticatedRoute>
                ),
            },

            // Restaurants management routes
            {
                path: "/restaurants",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AllRestaurantsPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/restaurants/add",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AddRestaurantPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/restaurants/edit/:id",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AddRestaurantPage />
                    </AuthenticatedRoute>
                ),
            },

            // Configurations management routes
            {
                path: "/configurations",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AllConfigurationsPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/configurations/add",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AddConfigurationPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/configurations/edit/:id",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AddConfigurationPage />
                    </AuthenticatedRoute>
                ),
            },

            // Orders management routes
            {
                path: "/orders",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AllOrdersPage />
                    </AuthenticatedRoute>
                ),
            },
            
            {
                path: "/orders/:orderId",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <OrderDetailsPage />
                    </AuthenticatedRoute>
                ),
            },

            {
                path: "/dashboard",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login" > 
                        <DashboardPage />
                   </AuthenticatedRoute> 
                ),
            },


            // Account settings page
            {
                path: "/settings/account",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AccountSettingsPage />
                   </AuthenticatedRoute>
                ),
            },
            // Sales management routes
            {
                path: "/sales",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <AllSalesPage />
                    </AuthenticatedRoute>
                ),
            },
            
            {
                path: "/sales/:orderId",
                element: (
                    <AuthenticatedRoute redirectPage="/public/login">
                        <SalesDetailsPage />
                    </AuthenticatedRoute>
                ),
            },

            // Restaurants page: /restaurants

            // Restaurants add page: /restaurants/add

            // Restaurants edit page: /restaurants/edit

            // {path: "*", element: <ErrorPage />}
        ]
    }
])