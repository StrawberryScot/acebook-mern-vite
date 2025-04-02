import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../../services/authentication";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); //a new state for an error
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const token = await login(email, password);
            localStorage.setItem("token", token);
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
            <h2>Login</h2>
            {errorMessage && (
                <div
                    className="error-message"
                    style={{ color: "red", marginBottom: "10px" }}
                >
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={handleEmailChange}
                />
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <input
                    role="submit-button"
                    id="submit"
                    type="submit"
                    value="Submit"
                />
            </form>
        </>
    );
}
