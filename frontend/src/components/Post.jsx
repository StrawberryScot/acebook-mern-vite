import DeletePostForm from "./DeletePostForm";

function Post({ post, onPostDeleted }) {
  return (
    <article className="post" key={post._id}>
      <p>{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}
      <div className="post-delete-footer">
        <DeletePostForm post={post} onPostDeleted={onPostDeleted} />
      </div>
    </article>
  );
}

export default Post;
