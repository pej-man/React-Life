import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Users from "./views/Users";
import Lifes from "./views/Lifes";
import UserForm from "./views/UserForm";
import MultiStepForm from "./views/form-0/MultiStepForm";
import LifeCompare from "./views/form-1/LifeCompare";
import LifeMedicalInfo from "./views/form-2/LifeMedicalInfo";
import InsuranceTargetDetails from "./views/form-3/InsuranceTargetDetails";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Navigate to="/users" />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/users",
                element: <Users />,
            },
            {
                path: "/users/new",
                element: <UserForm key="userCreate" />,
            },
            {
                path: "/users/:id",
                element: <UserForm key="userUpdate" />,
            },
            {
                path: "/lifes",
                element: <Lifes />,
            },
            {
                path: "/life-insurance",
                element: <LifeCompare />,
            },
            // {
            //     path: "/life",
            //     element: <MultiStepForm />,
            // },
            {
                path: "/life-medical-info",
                element: <LifeMedicalInfo />,
            },
            {
                path: "/insurance-target-details",
                element: <InsuranceTargetDetails />,
            },
        ],
    },
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/signup",
                element: <Signup />,
            },
            {
                path: "/life",
                element: <MultiStepForm />,
            },
            {
                path: "/life-compare",
                element: <LifeCompare />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

export default router;
