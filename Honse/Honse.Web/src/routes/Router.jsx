import {createBrowserRouter} from 'react-router';
import App from '../App';
import RestaurantsListPage from '../pages/public/RestaurantsListPage/RestaurantsListPage';

import AuthenticatedRoute from '../routes/AuthenticatedRoute';
import UnauthenticatedRoute from '../routes/UnauthenticatedRoute';

import LoginPage from '../pages/public/Auth/LoginPage';
import RegisterPage from '../pages/public/Auth/RegisterPage';
import AllProductsPage from '../pages/private/products/AllProductsPage';
import AddProductPage from '../pages/private/products/AddProductPage';
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

            // Landing page: /public

            {path: "/public", element: <RestaurantsListPage />},
            
            // Restaurants list page : /public/restaurants
            {path: "/public/restaurants", element: <RestaurantsListPage />},

            // Restaurant menu page : /public/restaurants/:id
            
            // UNAUTHENTICATED PAGES - you can access them only if you aren't logged in

            { path: "/public/login",
                element: (
                    <UnauthenticatedRoute redirectPage='/public'>
                        <LoginPage />
                    </UnauthenticatedRoute>
                )
            },
            { path: "/public/register",
                element: (
                    <UnauthenticatedRoute redirectPage='/public'>
                        <RegisterPage />
                    </UnauthenticatedRoute>
                )
            },

            // PRIVATE PAGES - you can access them only if you are logged in


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


            // Restaurants page: /restaurants

            // Restaurants add page: /restaurants/add

            // Restaurants edit page: /restaurants/edit

            // {path: "*", element: <ErrorPage />}
        ]
    }
])