import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserPosts } from "../../services/posts";
import { updateUserProfile } from "../../services/Users";
import { setUser } from "../../redux/userSlice";
import { Navbar } from "../../components/navbar/Navbar";
import LogoutButton from "../../components/LogoutButton";
import "../../App.css";
import "./ProfilePage.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const [userStatus, setUserStatus] = useState(user?.status || "online");
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProfilePicForm, setShowProfilePicForm] = useState(false);
  const [profilePicPath, setProfilePicPath] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    // Check if user is logged in
    if (!user || !token) {
      // If no user or token, set status to offline and redirect to login
      if (userStatus !== "offline") {
        updateUserStatusInApp("offline");
      }
      navigate("/login");
      return;
    } else if (userStatus === "offline" && user && token) {
      // If user was offline but is now logged in, set to online
      updateUserStatusInApp("online");
    }

    async function fetchUserPosts() {
      setIsLoading(true);
      setError(null);
      try {
        const posts = await getUserPosts(token);
        setUserPosts(posts);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setError("Failed to load your posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserPosts();
  }, [user, token, navigate, userStatus]);

  // Function to update user status in the backend and Redux store
  const updateUserStatusInApp = async (newStatus) => {
    try {
      setIsLoading(true);

      if (token && user?._id) {
        // Only call the API if we have a token and user ID
        await updateUserProfile(token, user._id, undefined, newStatus);

        // Update the user in Redux store
        dispatch(setUser({ ...user, status: newStatus }));
      }

      setUserStatus(newStatus);
      if (newStatus !== "offline") {
        setUpdateMessage(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setUpdateMessage("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFeed = () => {
    navigate("/posts");
  };

  const handleUpdateProfilePic = async (e) => {
    e.preventDefault();
    if (!profilePicPath.trim()) {
      setUpdateMessage("Please enter a valid profile picture path");
      return;
    }

    try {
      setIsLoading(true);
      // Call the updateUserProfile service
      const updatedUser = await updateUserProfile(
        token,
        user._id,
        profilePicPath
      );

      // Update the user in Redux store using the setUser action
      dispatch(setUser({ ...user, profilePicPath }));

      setUpdateMessage("Profile picture updated successfully!");
      setShowProfilePicForm(false);
      setProfilePicPath("");
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      setUpdateMessage("Failed to update profile picture. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modified status toggle to switch between online and busy
  const handleStatusToggle = async () => {
    // If user is not logged in, don't allow toggling
    if (!token || !user) {
      setUpdateMessage("You need to be logged in to change your status.");
      return;
    }

    // Toggle between online and busy
    const newStatus = userStatus === "online" ? "busy" : "online";
    updateUserStatusInApp(newStatus);
  };

  // Determine what text to show on the status button
  const getStatusButtonText = () => {
    if (userStatus === "offline") return "Offline";
    if (userStatus === "busy") return "Busy";
    return "Online";
  };

  // Determine what class to apply to the status button
  const getStatusButtonClass = () => {
    return `status-toggle ${userStatus}`;
  };

  return (
    <div className="content-container">
      <Navbar />
      <div className="profile-header">
        <button className="back-button" onClick={handleBackToFeed}>
          <i class="fa-solid fa-backward"></i>
          <span>
            <p>Back</p>
          </span>
        </button>
        <div className="title-my-profile"><h2>My Profile</h2></div>
      </div>
      <div className="profile-container">
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={user?.profilePicPath || "/default_avatar.png"}
              alt="Profile"
              className="profile-image"
            />
          </div>
          <div className="profile-details">
            <h3>{user?.firstName || "Username"}</h3>
            <p className="profile-email">
              {user?.email || "email@example.com"}
            </p>
            <div className="user-status">
              <span>Status: </span>
              <button
                className={getStatusButtonClass()}
                onClick={handleStatusToggle}
                disabled={isLoading || userStatus === "offline"}
                title={
                  userStatus === "offline"
                    ? "You're offline. Log in to change status."
                    : "Click to toggle between Online and Busy"
                }
              >
                {getStatusButtonText()}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-number">{userPosts.length || 0}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">
              {userPosts.reduce((total, post) => total + post.likes.length, 0)}
            </span>
            <span className="stat-label">Likes</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="edit-profile-button"
            onClick={() => setShowProfilePicForm(!showProfilePicForm)}
          >
            {showProfilePicForm ? "Cancel" : "Set Profile Picture"}
          </button>
        </div>

        {updateMessage && (
          <div
            className={`update-message ${
              updateMessage.includes("Failed") ? "error" : "success"
            }`}
          >
            {updateMessage}
          </div>
        )}

        {showProfilePicForm && (
          <div className="profile-pic-form">
            <form onSubmit={handleUpdateProfilePic}>
              <div className="form-group">
                <label htmlFor="profilePicPath">Profile Picture URL:</label>
                <input
                  type="text"
                  id="profilePicPath"
                  value={profilePicPath}
                  onChange={(e) => setProfilePicPath(e.target.value)}
                  placeholder="Enter URL to your profile picture"
                  required
                />
              </div>
              <button
                type="submit"
                className="update-pic-button"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Picture"}
              </button>
            </form>
          </div>
        )}

        <div className="user-posts-section">
          <h3>My Posts</h3>
          {isLoading && !showProfilePicForm ? (
            <p>Loading posts...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="user-posts">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post._id} className="user-post-card">
                    <p>{post.text}</p>
                    <div className="post-metadata">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span>{post.likes.length} likes</span>
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-posts-message">
                  You haven't created any posts yet!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
