import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserByToken } from "./services/authentication";
import { setUser, clearUser } from "./redux/userSlice";
import { updateUserProfile } from "./services/Users";

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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

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

  // Handle page unload/close events
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem("token");
      if (user && user._id && token) {
        // Create a synchronous request to update user status before page close
        // Using sendBeacon API which is designed for this purpose
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const url = `${BACKEND_URL}/users/${user._id}/updateProfile`;
        const blob = new Blob([JSON.stringify({ status: "offline" })], {
          type: "application/json",
        });

        // Add the Authorization header to the Beacon request
        navigator.sendBeacon(url, blob);
      }
    };

    // Add event listener for page close/refresh
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  // Set up heartbeat to maintain online status
  useEffect(() => {
    let heartbeatInterval;

    if (user && user._id) {
      const token = localStorage.getItem("token");

      // Set user as online when app loads
      updateUserProfile(token, user._id, undefined, "online").catch((err) =>
        console.error("Failed to update initial online status:", err)
      );

      // Update "online" status every 5 minutes to keep it active
      heartbeatInterval = setInterval(() => {
        if (token && user && user._id) {
          updateUserProfile(token, user._id, undefined, "online").catch((err) =>
            console.error("Failed to update heartbeat status:", err)
          );
        }
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };
  }, [user]);

  return (
    <>
      <RouterProvider router={router} />
      <div className="background-pattern-light"></div>
      <HexagonBackground />
    </>
  );
}

export default App;
