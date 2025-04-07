import { useSelector } from "react-redux";
import DeletePostForm from "./DeletePostForm";
import EditPostForm from "./EditPostForm";

function Post({ post, onPostDeleted, onPostUpdated }) {
  // Get the current user from Redux store
  const user = useSelector((state) => state.user.user);

  // Check if the current user is the author of the post
  const isAuthor = user && post.postedBy === user._id;

  return (
    <article className="post" key={post._id}>
      <p>{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}
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
