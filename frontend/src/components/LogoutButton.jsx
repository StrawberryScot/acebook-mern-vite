import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../redux/userSlice";

function LogoutButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function logOut() {
    dispatch(clearUser());
    localStorage.removeItem("token");
    navigate("/");
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
