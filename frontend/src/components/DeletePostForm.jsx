import { useState } from "react";
import { deletePost } from "../services/posts";

function DeletePostForm({ post, onPostDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      await deletePost(token, post._id);
      setShowConfirm(false);

      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("You can't delete another Hiver's post!!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-post-form">
      <button
        onClick={handleDeleteClick}
        className="delete-button"
        aria-label="Delete post"
      >
        <i class="fa-solid fa-trash fa-beat"></i>
      </button>

      {showConfirm && (
        <div className="delete-confirm-modal">
          <p>Are you sure you want to delete this post?</p>
          <div className="delete-confirm-buttons">
            <button onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="delete-confirm-button"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeletePostForm;
