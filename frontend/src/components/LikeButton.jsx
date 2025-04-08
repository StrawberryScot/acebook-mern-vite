import { useState } from "react";
import { useSelector } from "react-redux";
import { likeUnlikePost } from "../services/posts";
import "./LikeButton.css";

function LikeButton({ post, onLikeUpdated }) {
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const [isLiked, setIsLiked] = useState(post.likes.includes(user._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLoading, setIsLoading] = useState(false);

  const handleLikeClick = async () => {
    try {
      setIsLoading(true);

      const response = await likeUnlikePost(token, post._id);

      // Update local state and notify parent with the correct action
      if (response.message === "Post liked") {
        setIsLiked(true);
        setLikeCount((prevCount) => prevCount + 1);

        // Notify parent with the action that just happened
        if (onLikeUpdated) {
          onLikeUpdated(post._id, "like");
        }
      } else {
        setIsLiked(false);
        setLikeCount((prevCount) => prevCount - 1);

        // Notify parent with the action that just happened
        if (onLikeUpdated) {
          onLikeUpdated(post._id, "unlike");
        }
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="like-container">
      <button
        className={`like-button ${isLiked ? "liked" : ""}`}
        onClick={handleLikeClick}
        disabled={isLoading}
      >
        <i className={`fa fa-thumbs-up ${isLiked ? "liked-icon" : ""}`}></i>
        <span>{isLiked ? "Liked" : "Like"}</span>
      </button>
      <span className="like-count">
        {likeCount > 0
          ? `${likeCount} ${likeCount === 1 ? "like" : "likes"}`
          : ""}
      </span>
    </div>
  );
}

export default LikeButton;
