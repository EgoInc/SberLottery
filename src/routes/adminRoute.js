import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminRoute = (props) => {
    const isAdmin = localStorage.getItem("LoggedIn");
    const navigate = useNavigate();
    function presentPage() {
        navigate(-1);
    }

    if (!isAdmin) return <Navigate to="/" />;

    // useEffect(() => {
    //     if (isAdmin === "owner") {
    //         presentPage()
    //     }
    // }, [isAdmin])


    if (isAdmin !== "admin") {
        return <Outlet {...props} />;
        console.log('!==')
    }
    else if (isAdmin === "admin") {
        console.log("===")
        presentPage()
    }
};

export default AdminRoute;