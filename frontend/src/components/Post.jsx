function Post({ post }) {
  return (
    <article className="post" key={post._id}>
      <p>{post.text}</p>
      {post.img && (
        <img src={post.img} alt="Post image" className="post-image" />
      )}
    </article>
  );
}

export default Post;
