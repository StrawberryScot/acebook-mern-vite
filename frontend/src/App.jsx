import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUserByToken } from "./services/authentication";
import { setUser, clearUser } from "./redux/userSlice";

import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { SignupPage } from "./pages/Signup/SignupPage";
import { FeedPage } from "./pages/Feed/FeedPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { UserProfilePage } from "./pages/Profile/OtherUsersProfilePage";
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
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/profile/:userId",
    element: <UserProfilePage />,
  },
]);

function App() {
  const dispatch = useDispatch(); // for persisting login

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserByToken(token)
        .then((user) => {
          dispatch(setUser(user));
        })
        .catch((err) => {
          console.error("Failed to restore user from token:", err);
          localStorage.removeItem("token");
          dispatch(clearUser());
        });
    }
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <div className="background-pattern-light"></div>
      <HexagonBackground />
    </>
  );
}

export default App;
