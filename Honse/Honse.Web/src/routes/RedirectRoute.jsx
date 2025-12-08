import React, { Children } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function RedirectRoute({redirectPage}){

    const location = useLocation();
    return (
        <Navigate to={redirectPage} state={{from: location}} replace></Navigate>
    )
}