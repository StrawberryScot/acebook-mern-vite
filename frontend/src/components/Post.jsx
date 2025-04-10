import { useSelector } from "react-redux";
import DeletePostForm from "./DeletePostForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditPostForm from "./EditPostForm";
import LikeButton from "./LikeButton";
import "./Comments.css";
import "./Post.css";
import images from "../images"

function Post({ post, onPostDeleted, onPostUpdated, onLikeUpdated }) {
  const navigate = useNavigate();
  const handleViewAnotherUsersProfile = () => {
    if (!user || !post.postedBy) {
      console.log("Missing user info for navigation");
      return;
    }
    const postAuthorId =
      typeof post.postedBy === "object" ? post.postedBy._id : post.postedBy;
    // Check if this is the current user's post
    if (user._id === postAuthorId) {
      navigate("/profile");
    } else {
      // Navigate to the other user's profile if not logged in users post
      navigate(`/profile/${postAuthorId}`);
    }
  };

  // Get the current user from Redux store
  const user = useSelector((state) => state.user.user);

  // Check if the current user is the author of the post
  const isAuthor = user && post.postedBy === user._id;

  const [posterName, setPosterName] = useState("Loading...");
  const [posterProfilePic, setPosterProfilePic] = useState("");

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
  // New state to track the user ID of the reply we're responding to
  const [replyingToUserId, setReplyingToUserId] = useState(null);

  // Track which comments have visible replies
  const [visibleReplies, setVisibleReplies] = useState({});

  // Default profile picture path
  const DEFAULT_PROFILE_PIC = images.default_avatar;

  // Debug logging function - add this to help diagnose issues
  const debugLog = (message, data) => {
    console.log(`DEBUG - ${message}:`, data);
  };

  // Updating comments when post prop changes
  useEffect(() => {
    if (post && post.comments) {
      const sortedComments = [...post.comments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComments(sortedComments);
    }
  }, [post]);

  useEffect(() => {
    const fetchPosterInfo = async () => {
      try {
        if (!post.postedBy) {
          setPosterName("Unknown User");
          setPosterProfilePic(DEFAULT_PROFILE_PIC);
          return;
        }

        const postedById =
          typeof post.postedBy === "object"
            ? post.postedBy._id || post.postedBy.toString()
            : post.postedBy.toString();

        // Log the ID we're using to fetch the profile
        debugLog("Fetching poster info with ID", postedById);

        // Try the /profile endpoint first
        let response = await fetch(
          `http://localhost:3000/users/${postedById}/profile`
        );

        // If /profile fails, fall back to /name
        if (!response.ok) {
          console.warn(
            "Failed to fetch profile data, trying name endpoint instead"
          );
          response = await fetch(
            `http://localhost:3000/users/${postedById}/name`
          );
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        debugLog("Poster data received", data);

        // Check what fields we actually get back from the API
        if (data) {
          // Set the name based on what's available
          if (data.firstName && data.lastName) {
            setPosterName(`${data.firstName} ${data.lastName}`);
          } else if (data.name) {
            setPosterName(data.name);
          } else if (data.username) {
            setPosterName(data.username);
          } else {
            setPosterName("User");
          }

          // Set profile pic if available
          setPosterProfilePic(
            data.profilePicPath ||
              data.profilePic ||
              data.avatar ||
              DEFAULT_PROFILE_PIC
          );
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("Error fetching poster info:", error);
        setPosterName("Unknown User");
        setPosterProfilePic(DEFAULT_PROFILE_PIC);
      }
    };

    fetchPosterInfo();
  }, [post.postedBy]);

  // Fetching comment and reply user names
  useEffect(() => {
    const fetchUserNamesAndProfilePics = async () => {
      // Fetch comment user names and profile pictures
      for (const comment of comments) {
        if (!comment.commentedBy) continue;

        try {
          const commenterId =
            typeof comment.commentedBy === "object"
              ? comment.commentedBy._id || comment.commentedBy.toString()
              : comment.commentedBy.toString();

          debugLog("Fetching commenter info with ID", commenterId);

          // Try the /profile endpoint first
          let response = await fetch(
            `http://localhost:3000/users/${commenterId}/profile`
          );

          // If that fails, try the /name endpoint as fallback
          if (!response.ok) {
            response = await fetch(
              `http://localhost:3000/users/${commenterId}/name`
            );
          }

          if (response.ok) {
            const data = await response.json();
            debugLog("Comment user data received", data);

            let userName = "User";
            if (data.firstName && data.lastName) {
              userName = `${data.firstName} ${data.lastName}`;
            } else if (data.name) {
              userName = data.name;
            } else if (data.username) {
              userName = data.username;
            }

            setCommentUserNames((prev) => ({
              ...prev,
              [comment.commentedBy]: {
                name: userName,
                profilePicture:
                  data.profilePicPath ||
                  data.profilePic ||
                  data.avatar ||
                  DEFAULT_PROFILE_PIC,
              },
            }));
          } else {
            console.warn(
              `Failed to fetch information for commenter ID: ${commenterId}`
            );
            setCommentUserNames((prev) => ({
              ...prev,
              [comment.commentedBy]: {
                name: "User",
                profilePicture: DEFAULT_PROFILE_PIC,
              },
            }));
          }
        } catch (error) {
          console.error("Error fetching commenter data:", error);
          setCommentUserNames((prev) => ({
            ...prev,
            [comment.commentedBy]: {
              name: "User",
              profilePicture: DEFAULT_PROFILE_PIC,
            },
          }));
        }

        // Fetch replies' user names and profile pictures if this comment has replies
        if (comment.replies && comment.replies.length > 0) {
          for (const reply of comment.replies) {
            if (!reply.repliedBy) continue;

            try {
              const replierId =
                typeof reply.repliedBy === "object"
                  ? reply.repliedBy._id || reply.repliedBy.toString()
                  : reply.repliedBy.toString();

              debugLog("Fetching replier info with ID", replierId);

              // Try the /profile endpoint first
              let response = await fetch(
                `http://localhost:3000/users/${replierId}/profile`
              );

              // If that fails, try the /name endpoint as fallback
              if (!response.ok) {
                response = await fetch(
                  `http://localhost:3000/users/${replierId}/name`
                );
              }

              if (response.ok) {
                const data = await response.json();
                debugLog("Reply user data received", data);

                let userName = "User";
                if (data.firstName && data.lastName) {
                  userName = `${data.firstName} ${data.lastName}`;
                } else if (data.name) {
                  userName = data.name;
                } else if (data.username) {
                  userName = data.username;
                }

                setReplyUserNames((prev) => ({
                  ...prev,
                  [reply.repliedBy]: {
                    name: userName,
                    profilePicture:
                      data.profilePicPath ||
                      data.profilePic ||
                      data.avatar ||
                      DEFAULT_PROFILE_PIC,
                  },
                }));
              } else {
                console.warn(
                  `Failed to fetch information for replier ID: ${replierId}`
                );
                setReplyUserNames((prev) => ({
                  ...prev,
                  [reply.repliedBy]: {
                    name: "User",
                    profilePicture: DEFAULT_PROFILE_PIC,
                  },
                }));
              }
            } catch (error) {
              console.error("Error fetching replier data:", error);
              setReplyUserNames((prev) => ({
                ...prev,
                [reply.repliedBy]: {
                  name: "User",
                  profilePicture: DEFAULT_PROFILE_PIC,
                },
              }));
            }
          }
        }
      }
    };

    // Run the fetchUserNamesAndProfilePics function when comments are available and visible
    if (comments.length > 0 && commentsVisible) {
      fetchUserNamesAndProfilePics();
    }
  }, [comments, commentsVisible]);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);

    // If we're showing comments and there are comments to show, make sure we fetch user data
    if (!commentsVisible && comments.length > 0) {
      // This will trigger the useEffect that fetches user names and profile pics
    }
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

        // Add the current user to commentUserNames if not already present
        if (!commentUserNames[user._id]) {
          const currentUserName =
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.username || "Current User";

          setCommentUserNames((prev) => ({
            ...prev,
            [user._id]: {
              name: currentUserName,
              profilePicture:
                user.profilePicPath ||
                user.profilePic ||
                user.avatar ||
                DEFAULT_PROFILE_PIC,
            },
          }));
        }
      }

      // Fetch updated post to get the updated comments list
      console.log("Fetching post with ID:", post._id);
      const postResponse = await fetch(
        `http://localhost:3000/posts/${post._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
  const handleReplyClick = (
    commentId,
    replyId = null,
    repliedByUserId = null
  ) => {
    setActiveReplyId(commentId);
    setParentReplyId(replyId);
    setReplyingToUserId(repliedByUserId);

    // Get the user name based on user ID
    let replyToName = "User";
    if (repliedByUserId) {
      if (
        replyUserNames[repliedByUserId] &&
        replyUserNames[repliedByUserId].name
      ) {
        replyToName = replyUserNames[repliedByUserId].name.split(" ")[0]; // Just use the first name
      } else if (
        commentUserNames[repliedByUserId] &&
        commentUserNames[repliedByUserId].name
      ) {
        replyToName = commentUserNames[repliedByUserId].name.split(" ")[0];
      }
      setReplyText(`@${replyToName} `);
    } else {
      setReplyText("");
    }

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
    setReplyingToUserId(null);
    setReplyText("");
  };

  // Helper function to get user name based on ID from our state
  const getUserName = (id) => {
    if (replyUserNames[id] && replyUserNames[id].name)
      return replyUserNames[id].name;
    if (commentUserNames[id] && commentUserNames[id].name)
      return commentUserNames[id].name;
    return "User";
  };

  // Get profile picture URL based on user ID
  const getProfilePicture = (id) => {
    if (replyUserNames[id] && replyUserNames[id].profilePicture)
      return replyUserNames[id].profilePicture;
    if (commentUserNames[id] && commentUserNames[id].profilePicture)
      return commentUserNames[id].profilePicture;
    return DEFAULT_PROFILE_PIC;
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
      setReplyingToUserId(null);

      // Add current user to replyUserNames if not already present
      if (!replyUserNames[user._id]) {
        const currentUserName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username || "Current User";

        setReplyUserNames((prev) => ({
          ...prev,
          [user._id]: {
            name: currentUserName,
            profilePicture:
              user.profilePicPath ||
              user.profilePic ||
              user.avatar ||
              DEFAULT_PROFILE_PIC,
          },
        }));
      }

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
          },
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
    const isActiveReply =
      activeReplyId === commentId && parentReplyId === reply._id;
    const replyUserName = replyUserNames[reply.repliedBy]?.name || "Loading...";
    const replyProfilePic =
      replyUserNames[reply.repliedBy]?.profilePicture || DEFAULT_PROFILE_PIC;

    return (
      <div
        key={reply._id || `temp-${reply.createdAt}`}
        className={`reply ${isParentReply ? "highlighted-reply" : ""}`}
        style={{ marginLeft: `${indentLevel * 20}px` }}
      >
        <div className="reply-header">
          <img
            src={replyProfilePic}
            alt="Profile"
            className="profile-picture-small"
          />
          <strong>{replyUserName} replied: </strong>
          <span className="reply-time">{formatDate(reply.createdAt)}</span>
        </div>

        {reply.parentReplyId && (
          <div className="reply-parent">
            In response to:{" "}
            <span className="parent-user">{getUserName(reply.repliedBy)}</span>
          </div>
        )}

        <p className="reply-text">{reply.text}</p>

        {user && (
          <button
            className="reply-button"
            onClick={() =>
              handleReplyClick(commentId, reply._id, reply.repliedBy)
            }
          >
            Reply
          </button>
        )}
        {/* Add the reply form directly below this reply if it's active */}
        {isActiveReply && (
          <div className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              required
            />
            <div className="reply-form-buttons">
              <button
                onClick={() => handleReplySubmit(commentId)}
                disabled={isSubmitting || !replyText.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </button>
              <button className="cancel-button" onClick={cancelReply}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <article className="post" key={post._id}>
      <div className="post-header">
        <img
          src={posterProfilePic || DEFAULT_PROFILE_PIC}
          alt="Profile"
          className="profile-picture"
          onClick={handleViewAnotherUsersProfile}
          onError={(e) => {
            console.log("Image error, using default");
            e.target.src = DEFAULT_PROFILE_PIC;
          }}
        />
        <div className="post-subheader">
          <div className="post-author-info">
            <strong className="posterName">{posterName} says:</strong>
            <p className="post-date">Posted {formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>

      <p className="post-content">{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}

      <div className="post-actions">
        <LikeButton post={post} onLikeUpdated={onLikeUpdated} />
        {isAuthor && (
          <div className="edit-delete-buttons">
            <EditPostForm post={post} onPostUpdated={onPostUpdated} />
            <DeletePostForm post={post} onPostDeleted={onPostDeleted} />
          </div>
        )}
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
                {comments.map((comment) => {
                  const commentUserName =
                    commentUserNames[comment.commentedBy]?.name || "Loading...";
                  const commentProfilePic =
                    commentUserNames[comment.commentedBy]?.profilePicture ||
                    DEFAULT_PROFILE_PIC;

                  return (
                    <div
                      key={comment._id || `temp-${comment.createdAt}`}
                      className="comment"
                    >
                      <div className="comment-header">
                        <img
                          src={commentProfilePic}
                          alt="Profile"
                          className="profile-picture"
                          onError={(e) => {
                            console.log("Comment image error, using default");
                            e.target.src = DEFAULT_PROFILE_PIC;
                          }}
                        />
                        <div className="comment-user-info">
                          <strong>{commentUserName} commented:</strong>
                          <span className="comment-time">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="comment-text">{comment.text}</p>

                      {/* Comment actions */}
                      <div className="comment-actions">
                        {user && (
                          <button
                            className="reply-button"
                            onClick={() =>
                              handleReplyClick(
                                comment._id,
                                null,
                                comment.commentedBy
                              )
                            }
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

                      {/* Reply form - only show if actively replying to the comment itself, not a reply */}
                      {activeReplyId === comment._id &&
                        parentReplyId === null && (
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
                            {[...comment.replies]
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt) - new Date(a.createdAt)
                              )
                              .map((reply) => renderReply(reply, comment._id))}
                          </div>
                        )}
                    </div>
                  );
                })}
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
    </article>
  );
}

export default Post;
