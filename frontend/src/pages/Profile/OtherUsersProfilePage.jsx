import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserProfileById } from "../../services/Users";
import { Navbar } from "../../components/navbar/Navbar";
import "../Profile/ProfilePage.css";
import AddFriendButton from "../../components/AddFriendButton";
import images from "../../images";

export const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  //gets signed in user from token
  //check if we are friends
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getUserProfileById(token, userId);
        console.log(profileData);
        setUserProfile(profileData);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchUserProfile();
    } else {
      setError("Please log in to view this profile");
      setLoading(false);
    }
  }, [userId, token]);

  const handleBackToFeed = () => {
    navigate("/posts");
  };

  // Redirect to login if not authenticated
  if (!token) {
    return (
      <div className="content-container">
        <div className="profile-container">
          <div className="auth-message">
            <p>You need to be logged in to view this profile</p>
            <Link to="/login" className="edit-profile-button">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-container">
        <Navbar />
        <div className="profile-container">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <Navbar />
        <div className="profile-container">
          <div className="error-message">{error}</div>
          <button className="back-button" onClick={handleBackToFeed}>
            <span>Back to Feed</span>
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="content-container">
        <Navbar />
        <div className="profile-container">
          <div className="error-message">User not found</div>
          <button className="back-button" onClick={handleBackToFeed}>
            <span>Back to Feed</span>
          </button>
        </div>
      </div>
    );
  }

  console.log(userProfile);

  return (
    <div className="content-container">
      <Navbar />
      <div className="profile-header">
        <button
          className="back-button"
          onClick={handleBackToFeed}
          aria-label="Back to feed"
        >
          <span>Back to Feed</span>
        </button>
        <h2>{userProfile.firstName}'s Profile</h2>
      </div>

      <div className="profile-container">
        <div className="profile-info">
          <div className="profile-avatar">
            {userProfile.profilePicPath ? (
              <img
                src={userProfile.profilePicPath}
                alt={`${userProfile.firstName}'s profile`}
                className="profile-image"
              />
            ) : (
              <div className="profile-image placeholder-initials">
                <img src={images.default_avatar} />
              </div>
            )}
          </div>
          <div className="profile-details">
            <h3>
              {userProfile.firstName} {userProfile.lastName}
            </h3>
            <p className="profile-email">{userProfile.email}</p>
            <p className="profile-bio">
              {userProfile.status || "No status available"}
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-number">
              {typeof userProfile.friends === "number"
                ? userProfile.friends
                : userProfile.friends?.length || 0}
            </span>
            <span className="stat-label">Friends</span>
          </div>
          {userProfile.isFriend && (
            <div className="stat-box friend-status">
              <span className="stat-label">Already Friends</span>
            </div>
          )}
          <AddFriendButton friendId={userId} />
        </div>

        {/* Only show full friends list if user is a friend or it's their profile */}
        {Array.isArray(userProfile.friends) && (
          <div className="user-posts-section">
            <h3>Friends</h3>
            {userProfile.friends.length === 0 ? (
              <p className="no-posts-message">No friends yet</p>
            ) : (
              <div className="user-posts">
                <p>{userProfile.friends.length} friends</p>
                {/* You would map through friends here to display them */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
