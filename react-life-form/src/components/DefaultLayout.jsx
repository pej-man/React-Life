import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import { useEffect } from "react";

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification, setNext } = useStateContext();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const onLogout = (ev) => {
        ev.preventDefault();

        axiosClient.post("/logout").then(() => {
            setUser({});
            setToken(null);
        });
    };

    useEffect(() => {
        axiosClient.get("/user").then(({ data }) => {
            setUser(data);
        });
        setNext(null);
    }, []);

    return (
        <div id="defaultLayout">
            <aside>
                <Link to="/dashboard">داشبورد</Link>
                <Link to="/users">کاربران</Link>
                <Link to="/lifes">بیمه های عمر</Link>
                <Link to="/life-insurance">ثبت بیمه عمر</Link>
            </aside>
            <div className="content">
                <header>
                    <div></div>

                    <div>
                        سلام آقای {user.name} &nbsp; &nbsp;
                        <a onClick={onLogout} className="btn-logout" href="#">
                            خروج
                        </a>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
                {notification && (
                    <div className="notification">{notification}</div>
                )}
            </div>
        </div>
    );
}
