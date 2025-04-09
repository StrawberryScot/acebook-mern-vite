import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { addFriend } from "../services/Users"

const AddFriendButton = ({friendId}) => {

    const [token, setToken] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        // Debug log
        console.log("Initial token set from localStorage:", storedToken);
    }, []);

    const handleOnClick = async () => {
        console.log('friendId is ', friendId);
        if (!token) {
            setError("You must be logged in to add a friend");
            navigate("/login");
            return;
        }
        try {
            await addFriend(token, friendId);
        } catch (err) {
            console.error("unable to add friend ", err);
        }
    }

    return (
        <div>
            <button onClick={handleOnClick}>
                Add Friend
            </button>
        </div>
    )
}

export default AddFriendButton;
