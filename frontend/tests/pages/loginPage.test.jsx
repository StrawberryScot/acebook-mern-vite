import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { useNavigate } from "react-router-dom";
import { login } from "../../src/services/authentication";
import { getUserByToken } from "../../src/services/authentication";
import { LoginPage } from "../../src/pages/Login/LoginPage";

// for redux store state:
import { Provider } from "react-redux";
import { store } from "../../src/redux/store";

// Mocking React Router's useNavigate function
vi.mock("react-router-dom", () => {
    const navigateMock = vi.fn();
    const useNavigateMock = () => navigateMock; // Create a mock function for useNavigate
    return { useNavigate: useNavigateMock };
});

// Mocking the login service
vi.mock("../../src/services/authentication", () => {
    const loginMock = vi.fn();
    const getUserByTokenMock = vi.fn();
    return { login: loginMock, getUserByToken: getUserByTokenMock };
});

// Reusable function for filling out login form
async function completeLoginForm() {
    const user = userEvent.setup();

    const emailInputEl = screen.getByLabelText("Email:");
    const passwordInputEl = screen.getByLabelText("Password:");
    const submitButtonEl = screen.getByRole("submit-button");

    await user.type(emailInputEl, "test@email.com");
    await user.type(passwordInputEl, "1234");
    await user.click(submitButtonEl);
}

describe("Login Page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("allows a user to login", async () => {
        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        await completeLoginForm();

        expect(login).toHaveBeenCalledWith("test@email.com", "1234");
    });

    test("navigates to /posts on successful login", async () => {
        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        login.mockResolvedValue("secrettoken123");
        getUserByToken.mockResolvedValue({
            name: "Test User",
            email: "test@email.com",
        });
        const navigateMock = useNavigate();

        await completeLoginForm();

        expect(navigateMock).toHaveBeenCalledWith("/posts");
    });

    test("navigates to /login on unsuccessful login", async () => {
        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        login.mockRejectedValue(new Error("Error logging in"));
        const navigateMock = useNavigate();

        await completeLoginForm();

        expect(navigateMock).toHaveBeenCalledWith("/login");
    });
});
