import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "./InputBox";

import { signup } from "../services/authentication";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await signup(email, password, firstName, lastName);
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);

      // Simply set the error message from the Error object
      // This will contain the validation message from the backend
      setErrorMessage(err.message || "An unexpected error occurred");
      navigate("/signup");
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleFirstNameChange(event) {
    setFirstName(event.target.value);
  }

  function handleLastNameChange(event) {
    setLastName(event.target.value);
  }

  return (
    <>
      <h2>Signup</h2>
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
        <label htmlFor="firstName" className="hidden">
          First Name:
        </label>
        <InputBox
          placeholder="First Name"
          id="firstName"
          type="text"
          value={firstName}
          onChange={handleFirstNameChange}
        />
        <label htmlFor="lastName" className="hidden">
          Last Name:
        </label>
        <InputBox
          placeholder="Last Name"
          id="lastName"
          type="text"
          value={lastName}
          onChange={handleLastNameChange}
        />
        <input role="submit-button" id="submit" type="submit" value="Submit" />
      </form>
    </>
  );
}
