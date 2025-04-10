import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers } from "../services/Users"; 
import "./UserSearchBar.css"

//below should work, might need to improve CSS, currently is a bog standard one whipped up at last second

const UserSearchBar = () => {
    //holds the queries as we type
    const [query, setQuery] = useState("");
    
    const [dropdownUsers, setDropdownUsers] = useState([]);
    
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
    const timeout = setTimeout(() => {
        //checks empty strings to ignore
        if (query.trim() !== "") {
        fetchUsers();
        } else {
        //empty list of users on load
        setDropdownUsers([]);
        }
    }, 300);
    
    return () => clearTimeout(timeout);
    }, [query]);

    const fetchUsers = async () => {
    setLoading(true);
    try {
        const results = await searchUsers(query);
        setDropdownUsers(results);
        setShowDropdown(true);
    } catch (err) {
        console.error("Error fetching users", err);
    } finally {
        setLoading(false);
    }
    };

    //redirect when we got the one we want!!!
    const handleSelectUser = (userId) => {
    navigate(`/profile/${userId}`);
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
        navigate(`/search?query=${encodeURIComponent(query)}`);
    }
    };

  // Close the dropdown of users if we click outside
    useEffect(() => {
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        }
    };

    //webpage eventlistener hooked up to leftbuttonclick, haven't tested right button click yet!!
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
    <div className="user-search-container" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="search-form">
        <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            onFocus={() => setShowDropdown(true)}
        />
        <button type="submit" className="search-button">Search</button>
        </form>

        {showDropdown && dropdownUsers.length > 0 && (
        <ul className="search-dropdown">
            {dropdownUsers.map((user) => (
            <li
                key={user._id}
                onClick={() => handleSelectUser(user._id)}
                className="search-dropdown-item"
            >
                {user.profilePicPath && (
                <img src={user.profilePicPath} alt="profile" className="avatar-small" />
                )}
                {user.firstName} {user.lastName}
            </li>
            ))}
        </ul>
        )}
    </div>
    );
};

export default UserSearchBar;
