import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { SignupPage } from "./pages/Signup/SignupPage";
import { FeedPage } from "./pages/Feed/FeedPage";
import HexagonBackground from "./components/HexagonBackground";

// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    },
    {
        path: "/posts",
        element: <FeedPage />,
    },
]);

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <div className="background-pattern-light"></div>
            <HexagonBackground />
        </>
    );
}

export default App;
