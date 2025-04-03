import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getPosts } from "../../services/posts";
import Post from "../../components/Post";
import LogoutButton from "../../components/LogoutButton";

import { Navbar } from "../../components/navbar/Navbar";
import "../../App.css";
import { useSelector } from "react-redux";

export function FeedPage() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");

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
                {posts.map((post) => (
                    <Post post={post} key={post._id} />
                ))}
            </div>
            <LogoutButton />
        </div>
    );
}
