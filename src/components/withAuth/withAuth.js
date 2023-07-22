import React, {useState} from "react";
import { RedirectFunction } from "react-router-dom";
import { Navigate } from "react-router-dom";

const withAuth = (element) => {
    const AuthRoute = (props) => {
        const [isAdmin, setIsAdmin] = useState(() => {
            try {
                var savedItem = localStorage.getItem("LoggedIn");
                var parsedItem = JSON.parse(savedItem);
                if (parsedItem === 'owner')
                return true;
            } catch (err) {
                return false
            }
        });
        if (isAdmin) {
            return <element/>;
        } else {
            return <Navigate to="/" />;
        }
    };
    return AuthRoute;
};

export default withAuth;