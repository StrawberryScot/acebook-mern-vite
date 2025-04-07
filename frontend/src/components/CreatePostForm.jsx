import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/posts";

function CreatePostForm({ onPostCreated }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(""); // Add token state
  const navigate = useNavigate();

  // Get the token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Debug log
    console.log("Initial token set from localStorage:", storedToken);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    // Debug
    console.log("Token in state at submission:", token);
    console.log("Token in localStorage:", localStorage.getItem("token"));

    if (!token) {
      setError("You must be logged in to post");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Use the token from state, not localStorage
      const newPost = await createPost(token, text);
      setText("");
      onPostCreated(newPost);

      // If response contains a new token, update both state and localStorage
      if (newPost.token) {
        localStorage.setItem("token", newPost.token);
        setToken(newPost.token);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post");

      if (error.message === "Unable to create post") {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={500}
        disabled={isSubmitting}
      />
      <div className="form-actions">
        <span className="char-count">{text.length}/500</span>
        <button type="submit" disabled={!text.trim() || isSubmitting}>
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
      {error && (
        <div style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
          {error}
        </div>
      )}
    </form>
  );
}

export default CreatePostForm;
