import { useState } from "react";
import { updatePost } from "../services/posts"; // Update the import path as needed

function EditPostForm({ post, onPostUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = () => {
    setEditText(post.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(post.text); // Reset to original text
  };

  const handleSubmitEdit = async () => {
    if (!editText.trim()) {
      alert("Post cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const updatedPost = await updatePost(token, post._id, editText);
      setIsEditing(false);

      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("You can't edit another Hiver's post!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-post-form">
      {!isEditing ? (
        <button
          onClick={handleEditClick}
          className="edit-button"
          aria-label="Edit post"
        >
          <i class="fa-solid fa-pen fa-beat"></i>
        </button>
      ) : (
        <div className="edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-textarea"
            rows="3"
          />
          <div className="edit-buttons">
            <button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="cancel-edit-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEdit}
              disabled={isSubmitting}
              className="save-edit-button"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditPostForm;
