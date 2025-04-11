import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../redux/userSlice";
import { updateUserProfile } from "../services/Users";

function LogoutButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");

  async function logOut() {
    try {
      // First update the user's status to offline in the backend
      if (user && user._id && token) {
        await updateUserProfile(token, user._id, undefined, "offline");
        console.log("User status set to offline");
      }

      // Then clear the user data from Redux store
      dispatch(clearUser());

      // Finally remove the token and navigate to the home page
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Error updating status during logout:", error);
      // Continue with logout even if status update fails
      dispatch(clearUser());
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  return (
    <div className="logout-button">
      <button
        onClick={logOut}
        className="round-edge primary-text-color primary-background-color std-padding button"
      >
        Log out
      </button>
    </div>
  );
}

export default LogoutButton;
