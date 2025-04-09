import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getPosts } from "../../services/posts";
import Post from "../../components/Post";
import CreatePostForm from "../../components/CreatePostForm";
import { HivemindLogo } from "../../components/HivemindLogo";

import { Navbar } from "../../components/navbar/Navbar";
import "../../App.css";
import { useSelector } from "react-redux";
import "../../components/Post.css";

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = localStorage.getItem("token");
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]); // Add new post to the top of the feed
  };

  useEffect(() => {
    const loggedIn = user !== null;
    if (loggedIn) {
      getPosts(token)
        .then((data) => {
          setPosts(data.posts);
        })
        .catch((err) => {
          console.error(err);
          navigate("/login");
        });
    } else {
      navigate("/login");
      return;
    }
  }, [navigate, user]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="header-container">
          <h2>Posts</h2>
        </div>
        <div className="feed" role="feed">
          <CreatePostForm onPostCreated={handlePostCreated} />
          {posts.map((post, index) => (
            <div
              className={
                "round-edge white-text " + (index % 2 == 0 ? "brown" : "yellow")
              }

            >
              <Post
                post={post}
                key={post._id}
                onPostDeleted={(deletedPostId) => {
                  setPosts((prevPosts) =>
                    prevPosts.filter((post) => post._id !== deletedPostId)
                  );
                }}
                onPostUpdated={(updatedPost) => {
                  setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                      post._id === updatedPost._id ? updatedPost : post
                    )
                  );
                }}
                onLikeUpdated={(postId, action) => {
                  setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                      if (post._id === postId) {
                        const userId = user._id;
                        const updatedLikes = [...post.likes];

                        if (
                          action === "like" &&
                          !updatedLikes.includes(userId)
                        ) {
                          updatedLikes.push(userId);
                        } else if (action === "unlike") {
                          const index = updatedLikes.indexOf(userId);
                          if (index !== -1) {
                            updatedLikes.splice(index, 1);
                          }
                        }

                      return { ...post, likes: updatedLikes };
                    }
                    return post;
                  })
                );
              }}
            />
          </div>
        ))}
      </div>
      <div className="right-5vh">
        <Navbar />
        <CreatePostForm onPostCreated={handlePostCreated} />

      </div>
    </div>
  );
}
