import { useSelector } from "react-redux";
import DeletePostForm from "./DeletePostForm";
import { useEffect, useState } from "react";
import EditPostForm from "./EditPostForm";

function Post({ post, onPostDeleted, onPostUpdated }) {
    // Get the current user from Redux store
  const user = useSelector((state) => state.user.user);

  // Check if the current user is the author of the post
  const isAuthor = user && post.postedBy === user._id;
  
  const [posterName, setPosterName] = useState("");
  // const [timestamp, setTimestamp] = useState(null);

  // useEffect(() => {
  //   const currentTimestamp = new Date().toLocaleString();
  //   setTimestamp(currentTimestamp);
// }, []);
  useEffect(() => {
    const fetchPosterName = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/users/${post.postedBy.toString()}/name`
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

    if (post.postedBy.toString()) {
      fetchPosterName();
    }
}, [post.postedBy]);


  return (
    <article className="post" key={post._id}>
      {/* <small>{timestamp ? `Posted on: ${timestamp}` : "Loading timestamp..."}</small> */}
      <p className="posterName">{posterName} says:</p>
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
