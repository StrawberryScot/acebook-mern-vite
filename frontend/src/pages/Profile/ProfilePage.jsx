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
    if (!user) {
      navigate("/login");
      return;
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
  }, [user, token, navigate]);

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

  const handleStatusToggle = async () => {
    const newStatus = userStatus === "online" ? "offline" : "online";

    try {
      setIsLoading(true);
      // Call the updateUserProfile service with just the status
      const updatedUser = await updateUserProfile(
        token,
        user._id,
        undefined,
        newStatus
      );

      // Update the user in Redux store
      dispatch(setUser({ ...user, status: newStatus }));

      setUserStatus(newStatus);
      setUpdateMessage(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      setUpdateMessage("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <div className="title-my-profile">
          <h2>My Profile</h2>
        </div>
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
                className={`status-toggle ${userStatus}`}
                onClick={handleStatusToggle}
                disabled={isLoading}
              >
                {userStatus === "online" ? "Online" : "Offline"}
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
    </div>
  );
}
