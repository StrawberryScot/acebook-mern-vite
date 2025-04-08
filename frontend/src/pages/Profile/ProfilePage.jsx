import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HivemindLogo } from "../../components/HivemindLogo";
import { Navbar } from "../../components/navbar/Navbar";
import LogoutButton from "../../components/LogoutButton";
import "../../App.css";
import "./ProfilePage.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Here you would fetch the user's posts
    // For now, we're just setting up the structure
    // Example: getUserPosts(user._id).then(posts => setUserPosts(posts));
  }, [user, navigate]);

  const handleBackToFeed = () => {
    navigate("/posts");
  };

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
        <h2>My Profile</h2>
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
            <p className="profile-bio">
              John's Bio. Do we need to add a bio option to the schema?
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-number">{userPosts.length || 0}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-box">
            <span className="stat-number">0</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-profile-button">Edit Profile</button>
        </div>

        <div className="user-posts-section">
          <h3>My Posts</h3>
          <div className="user-posts">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post._id} className="user-post-card">
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p className="no-posts-message">
                You haven't created any posts yet!
              </p>
            )}
          </div>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
