import { useSelector } from "react-redux";
import DeletePostForm from "./DeletePostForm";
import { useEffect, useState } from "react";
import EditPostForm from "./EditPostForm";
import "./Comments.css";

function Post({ post, onPostDeleted, onPostUpdated }) {
  // Get the current user from Redux store
  const user = useSelector((state) => state.user.user);

  // Check if the current user is the author of the post
  const isAuthor = user && post.postedBy === user._id;

  const [posterName, setPosterName] = useState("");
  //comments states:
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentUserNames, setCommentUserNames] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // updating comments when post prop changes:
  useEffect(() => {
    if (post && post.comments) {
      setComments([...post.comments]);
    }
  }, [post]);

  useEffect(() => {
    const fetchPosterName = async () => {
      try {
        if (!post.postedBy) {
          setPosterName("Unknown User");
          return;
        }

        const postedById =
          typeof post.postedBy === "object"
            ? post.postedBy._id || post.postedBy.toString()
            : post.postedBy.toString();

        const response = await fetch(
          `http://localhost:3000/users/${postedById}/name`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user name");
        }
        const data = await response.json();
        setPosterName(`${data.firstName} ${data.lastName}`);
      } catch (error) {
        console.error("Error fetching poster name:", error);
        setPosterName("Unknown User");
      }
    };

    fetchPosterName();
  }, [post.postedBy]);
  // fetching comment user names:
  useEffect(() => {
    const fetchCommentUserNames = async () => {
      for (const comment of comments) {
        if (!comment.commentedBy) continue;

        if (!commentUserNames[comment.commentedBy]) {
          try {
            const commenterId =
              typeof comment.commentedBy === "object"
                ? comment.commentedBy._id || comment.commentedBy.toString()
                : comment.commentedBy.toString();

            const response = await fetch(
              `http://localhost:3000/users/${commenterId}/name`
            );
            if (response.ok) {
              const data = await response.json();
              setCommentUserNames((prev) => ({
                ...prev,
                [comment.commentedBy]: `${data.firstName} ${data.lastName}`,
              }));
            } else {
              setCommentUserNames((prev) => ({
                ...prev,
                [comment.commentedBy]: "Unknown User",
              }));
            }
          } catch (error) {
            console.error("Error fetching commenter name:", error);
            setCommentUserNames((prev) => ({
              ...prev,
              [comment.commentedBy]: "Unknown User",
            }));
          }
        }
      }
    };

    if (comments.length > 0 && commentsVisible) {
      fetchCommentUserNames();
    }
  }, [comments, commentsVisible]);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post._id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            text: commentText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();

      // Clear the input field
      setCommentText("");

      // Ensure comments are visible after adding a new one
      setCommentsVisible(true);

      // Update local comments immediately
      if (user) {
        const newComment = {
          _id: `temp-${Date.now()}`,
          commentedBy: user._id,
          text: commentText,
          createdAt: new Date().toISOString(),
        };

        setComments((prevComments) => [...prevComments, newComment]);
      }

      // Notify parent component about the update
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display in European format with 24-hour time
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Format as: DD/MM/YYYY HH:MM
    // padStart ensures two digits for day, month, hours and minutes
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return ` at ${hours}:${minutes} on ${day}/${month}/${year} `;
  };

  return (
    <article className="post" key={post._id}>
      <p className="post-date">{formatDate(post.createdAt)}</p>
      <p className="posterName">{posterName} says:</p>
      <p>{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}

      {/* Comments section */}
      <div className="comments-section">
        <button
          className="comments-toggle-button"
          onClick={toggleComments}
          aria-expanded={commentsVisible}
        >
          {commentsVisible ? "Hide" : "Show"} Comments ({comments.length})
        </button>

        {commentsVisible && (
          <>
            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div key={comment._id || `temp-${index}`} className="comment">
                    <div className="comment-header">
                      <strong>
                        {commentUserNames[comment.commentedBy] || "Loading..."}
                      </strong>
                      <span className="comment-time">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}

            {user && (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {isAuthor && (
        <div className="post-delete-footer">
          <EditPostForm post={post} onPostUpdated={onPostUpdated} />
          <DeletePostForm post={post} onPostDeleted={onPostDeleted} />
        </div>
      )}
    </article>
  );
}

export default Post;
