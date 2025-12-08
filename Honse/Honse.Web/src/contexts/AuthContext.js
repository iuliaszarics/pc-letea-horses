import React from "react";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { loginAPI, registerAPI } from "../services/userService";

const UserContext = createContext(null);

export const UserProvider = ({children}) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [loggedStatus,setLoggedStatus] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        if (token) {
            setToken(token);
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        }

        if (username) {
            setUsername(username);
        }

        setIsReady(true);
    }, [loggedStatus]);


    const registerUser = async (email, username, password, confirmPassword) => {

        const result = await registerAPI(email, username, password, confirmPassword);

        if(result.errorMessage){
            return result;
        }

        // Store in local storage

        localStorage.setItem('token', result?.token);
        localStorage.setItem('username',result?.username);


        setToken(result?.token);
        setUsername(result?.username);
        setLoggedStatus(true);

        navigate('/products');
    }

    const loginUser = async (username, password) => {
        const result = await loginAPI(username,password);

        if(result.errorMessage || !result.succeeded){
            return result;
        }

        // Store in local storage

        localStorage.setItem('token',result?.token);
        localStorage.setItem('username',result?.username);


        setToken(result?.token);
        setUsername(result?.username);
        setLoggedStatus(true);

        navigate('/products');

    }

    const isLoggedIn = () => {
        return !!token;
    }

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setToken(null);
        setUsername(null);
        axios.defaults.headers.common["Authorization"] = "";
        setLoggedStatus(false);

        navigate('/');
    };


    return (
        <UserContext.Provider value={{loginUser, registerUser, logoutUser, token, isLoggedIn, username}}>
            {isReady ? children : null}
        </UserContext.Provider>
    )
}

export const useAuth = () => React.useContext(UserContext);