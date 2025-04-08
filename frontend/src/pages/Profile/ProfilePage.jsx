import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserPosts } from "../../services/posts";
import { HivemindLogo } from "../../components/HivemindLogo";
import { Navbar } from "../../components/navbar/Navbar";
import LogoutButton from "../../components/LogoutButton";
import "../../App.css";
import "./ProfilePage.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
            <p className="profile-bio">{user?.bio || "No bio available"}</p>
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
          <button className="edit-profile-button">Edit Profile</button>
        </div>

        <div className="user-posts-section">
          <h3>My Posts</h3>
          {isLoading ? (
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
