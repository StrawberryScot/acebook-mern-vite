import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getPosts } from "../../services/posts";
import Post from "../../components/Post";
import CreatePostForm from "../../components/CreatePostForm";
import { HivemindLogo } from "../../components/HivemindLogo";
import LogoutButton from "../../components/LogoutButton";

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = token !== null;
    if (loggedIn) {
      getPosts(token)
        .then((data) => {
          setPosts(data.posts);
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
          navigate("/login");
        });
    }
  }, [navigate]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]); // Add new post to the top of the feed
  };

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <div className="feed" role="feed">
        <HivemindLogo />
        <CreatePostForm onPostCreated={handlePostCreated} />
        {posts.map((post) => (
          <Post post={post} key={post._id} />
        ))}
      </div>
      <LogoutButton />
    </>
  );
}
