import { useSelector } from "react-redux";
import DeletePostForm from "./DeletePostForm";
import { useEffect, useState } from "react";
import EditPostForm from "./EditPostForm";
import LikeButton from "./LikeButton";
import "./Comments.css";

function Post({ post, onPostDeleted, onPostUpdated, onLikeUpdated }) {
  // Get the current user from Redux store
  const user = useSelector((state) => state.user.user);

  // Check if the current user is the author of the post
  const isAuthor = user && post.postedBy === user._id;

  const [posterName, setPosterName] = useState("");

  // Comments states:
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentUserNames, setCommentUserNames] = useState({});
  const [replyUserNames, setReplyUserNames] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [parentReplyId, setParentReplyId] = useState(null);

  // Track which comments have visible replies
  const [visibleReplies, setVisibleReplies] = useState({});

  // Updating comments when post prop changes
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

  // Fetching comment and reply user names
  useEffect(() => {
    const fetchUserNames = async () => {
      // Fetch comment user names
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

        // Fetch reply user names if this comment has replies
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            if (!reply.repliedBy) continue;

            if (!replyUserNames[reply.repliedBy]) {
              try {
                const replierId =
                  typeof reply.repliedBy === "object"
                    ? reply.repliedBy._id || reply.repliedBy.toString()
                    : reply.repliedBy.toString();

                const response = await fetch(
                  `http://localhost:3000/users/${replierId}/name`
                );
                if (response.ok) {
                  const data = await response.json();
                  setReplyUserNames((prev) => ({
                    ...prev,
                    [reply.repliedBy]: `${data.firstName} ${data.lastName}`,
                  }));
                } else {
                  setReplyUserNames((prev) => ({
                    ...prev,
                    [reply.repliedBy]: "Unknown User",
                  }));
                }
              } catch (error) {
                console.error("Error fetching replier name:", error);
                setReplyUserNames((prev) => ({
                  ...prev,
                  [reply.repliedBy]: "Unknown User",
                }));
              }
            }
          }
        }
      }
    };

    if (comments.length > 0 && commentsVisible) {
      fetchUserNames();
    }
  }, [comments, commentsVisible]);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  // Toggle visibility of replies for a specific comment
  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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

      const updatedComment = await response.json();

      // Clear the input field
      setCommentText("");

      // Ensure comments are visible after adding a new one
      setCommentsVisible(true);

      // Update local comments immediately
      if (user) {
        const newComment = {
          _id: updatedComment._id || `temp-${Date.now()}`,
          commentedBy: user._id,
          text: commentText,
          createdAt: new Date().toISOString(),
          replies: [],
        };

        setComments((prevComments) => [...prevComments, newComment]);
      }

      // Fetch updated post to get the updated comments list
      console.log("Fetching post with ID:", post._id);
      const postResponse = await fetch(
        `http://localhost:3000/posts/${post._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (postResponse.ok) {
        const updatedPost = await postResponse.json();
        if (onPostUpdated) {
          onPostUpdated(updatedPost);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle showing reply form
  const handleReplyClick = (commentId, replyId = null) => {
    setActiveReplyId(commentId);
    setParentReplyId(replyId);
    setReplyText(replyId ? `@${getUserName(replyId)} ` : "");

    // Automatically show replies when replying
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: true,
    }));
  };

  // Cancel reply
  const cancelReply = () => {
    setActiveReplyId(null);
    setParentReplyId(null);
    setReplyText("");
  };

  // Helper function to get user name based on ID from our state
  const getUserName = (id) => {
    if (replyUserNames[id]) return replyUserNames[id];
    if (commentUserNames[id]) return commentUserNames[id];
    return "Unknown User";
  };

  // Handle submitting a reply
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post._id}/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            text: replyText,
            parentReplyId: parentReplyId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add reply");
      }

      const updatedReply = await response.json();

      // Clear form and reset states
      setReplyText("");
      setActiveReplyId(null);
      setParentReplyId(null);

      // Update local comments with the new reply
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                {
                  _id: updatedReply._id || `temp-${Date.now()}`,
                  repliedBy: user._id,
                  text: replyText,
                  createdAt: new Date().toISOString(),
                  parentReplyId: parentReplyId,
                },
              ],
            };
          }
          return comment;
        })
      );

      // Ensure replies are visible after adding a new one
      setVisibleReplies((prev) => ({
        ...prev,
        [commentId]: true,
      }));

      // Fetch updated post to get the complete updated data
      const postResponse = await fetch(
        `http://localhost:3000/posts/${post._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (postResponse.ok) {
        const updatedPost = await postResponse.json();
        if (onPostUpdated) {
          onPostUpdated(updatedPost);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display in European format with 24-hour time
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    // Format as: DD/MM/YYYY HH:MM
    // padStart ensures two digits for day, month, hours and minutes
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `at ${hours}:${minutes} on ${day}/${month}/${year}`;
  };

  // Render a reply component with proper indentation and highlighting
  const renderReply = (reply, commentId, indentLevel = 0) => {
    const isParentReply = parentReplyId === reply._id;

    return (
      <div
        key={reply._id || `temp-${reply.createdAt}`}
        className={`reply ${isParentReply ? "highlighted-reply" : ""}`}
        style={{ marginLeft: `${indentLevel * 20}px` }}
      >
        <div className="reply-header">
          <strong>
            {replyUserNames[reply.repliedBy] || "Loading..."} replied:{" "}
          </strong>
          <span className="reply-time">{formatDate(reply.createdAt)}</span>
        </div>

        {reply.parentReplyId && (
          <div className="reply-parent">
            In response to:{" "}
            <span className="parent-user">
              {getUserName(reply.parentReplyId)}
            </span>
          </div>
        )}

        <p className="reply-text">{reply.text}</p>

        {user && (
          <button
            className="reply-button"
            onClick={() => handleReplyClick(commentId, reply.repliedBy)}
          >
            Reply
          </button>
        )}
      </div>
    );
  };

  return (
    <article className="post" key={post._id}>
      <p className="posterName">{posterName} says:</p>
      <p className="post-date">Posted {formatDate(post.createdAt)}</p>
      <p className="post-content">{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}

      <div className="post-actions">
        <LikeButton post={post} onLikeUpdated={onLikeUpdated} />
      </div>

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
                {comments.map((comment) => (
                  <div
                    key={comment._id || `temp-${comment.createdAt}`}
                    className="comment"
                  >
                    <div className="comment-header">
                      <strong>
                        {commentUserNames[comment.commentedBy] || "Loading..."}{" "}
                        commented:
                      </strong>
                      <span className="comment-time">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>

                    {/* Comment actions */}
                    <div className="comment-actions">
                      {user && (
                        <button
                          className="reply-button"
                          onClick={() => handleReplyClick(comment._id)}
                        >
                          Reply
                        </button>
                      )}

                      {/* Only show the replies toggle if there are replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <button
                          className="replies-toggle-button"
                          onClick={() => toggleReplies(comment._id)}
                          aria-expanded={visibleReplies[comment._id]}
                        >
                          {visibleReplies[comment._id] ? "Hide" : "Show"}{" "}
                          Replies ({comment.replies.length})
                        </button>
                      )}
                    </div>

                    {/* Reply form */}
                    {activeReplyId === comment._id && (
                      <div className="reply-form">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          required
                        />
                        <div className="reply-form-buttons">
                          <button
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={isSubmitting || !replyText.trim()}
                          >
                            {isSubmitting ? "Posting..." : "Post Reply"}
                          </button>
                          <button
                            className="cancel-button"
                            onClick={cancelReply}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies - only show if visibleReplies[comment._id] is true */}
                    {comment.replies &&
                      comment.replies.length > 0 &&
                      visibleReplies[comment._id] && (
                        <div className="replies-container">
                          {comment.replies.map((reply) =>
                            renderReply(reply, comment._id)
                          )}
                        </div>
                      )}
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
