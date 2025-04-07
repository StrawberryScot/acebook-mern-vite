import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUserByToken, login } from "../services/authentication";
import InputBox from "./InputBox";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); //a new state for an error
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Allows us to update the redux store

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const token = await login(email, password);
            localStorage.setItem("token", token);
            // Get the user data given the token
            const user = await getUserByToken(token);
            debugger;
            // Update the user in the redux store
            dispatch(setUser(user));

            navigate("/posts");
        } catch (err) {
            console.error("Login error: ", err);
            setErrorMessage(err.message || "An unexpected error occurred"); //setting error to the message pulled from services/authentication.js
            navigate("/login");
        }
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    return (
        <>
            {errorMessage && (
                <div
                    className="error-message"
                    style={{ color: "red", marginBottom: "10px" }}
                >
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="vertical-items">
                <label htmlFor="email" className="hidden">
                    Email:
                </label>
                <InputBox
                    placeholder="Email"
                    id="email"
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                />
                <label htmlFor="password" className="hidden">
                    Password:
                </label>
                <InputBox
                    placeholder="Password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <input
                    className="round-edge primary-text-color primary-background-color std-padding button"
                    role="submit-button"
                    id="submit"
                    type="submit"
                    value="Login"
                />
            </form>
        </>
    );
}
