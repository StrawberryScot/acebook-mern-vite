import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFriend, getFriends } from "../services/Users";
import "./AddFriendButton.css"

const AddFriendButton = ({ friendId, currentUserId }) => {
  const [token, setToken] = useState("");
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // For loading spinner
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    console.log("Initial token set from localStorage:", storedToken);
    const checkIfFriend = async () => {
        try {
            const friends = await getFriends(token, friendId);
            console.log('fetched friends:', friends);
            const found = friends.some(friend => friend.id === currentUserId);
            setIsFriend(found);
            console.log('found value is ', found);
        }
        catch (err) {
            console.error('error checking friendship in addfriend component', err);
        }
    };
    if (storedToken && friendId & currentUserId) {
        checkIfFriend();
    }
    else {
        console.log('cant check if id in profile owners friend list as missing either token or friendid or currentuserid')
        console.log('friendid is ', friendId)
        console.log('currentuserid is ', currentUserId)
        console.log('token is ', storedToken)
    }
    checkIfFriend();
  }, []);

  const handleOnClick = async () => {
    console.log('friendId is', friendId);
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);  // Trigger the loading state

    try {
      await addFriend(token, friendId);
      setIsFriend(true);
      setIsLoading(false);  // Stop the spinner after adding the friend
    } catch (err) {
      console.error("Unable to add friend", err);
      setIsLoading(false);  // Stop the spinner even if there's an error
    }
  };

  return (
    <div className="profile-actions">
      {!isFriend && (
        <div>
          <button
            className={`add-friend-button ${isLoading ? 'clicked' : ''}`}
            onClick={handleOnClick}
            disabled={isLoading}  // Disable button while loading
          >
            {isLoading ? (
              <div className="spinner"></div> // Show spinner while loading
            ) : (
              "Add Friend"
            )}
          </button>
        </div>
      )}
      {isFriend && (
        <div className="already-friends">
          Friends
        </div>
      )}
    </div>
  );
};

export default AddFriendButton;
