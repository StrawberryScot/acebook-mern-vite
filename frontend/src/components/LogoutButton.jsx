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

    return <button onClick={logOut}>Log out</button>;
}

export default LogoutButton;
