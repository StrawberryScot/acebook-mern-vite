import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getPosts } from "../../services/posts";
import Post from "../../components/Post";
import CreatePostForm from "../../components/CreatePostForm";
import { HivemindLogo } from "../../components/HivemindLogo";
import LogoutButton from "../../components/LogoutButton";

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

    return (
        <div className="content-container">
            <Navbar />
            <h2>Posts</h2>
            <div className="feed" role="feed">
                <CreatePostForm onPostCreated={handlePostCreated} />
                {posts.map((post, index) => (
                        <div className={"round-edge white-text " + ((index % 2) == 0 ? "brown" : "yellow")}>
                            <Post post={post} key={post._id} />
                        </div>
                ))}
            </div>
            <LogoutButton />
        </div>
    );
};
