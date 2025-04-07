import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { FeedPage } from "../../src/pages/Feed/FeedPage";
import { getPosts } from "../../src/services/posts";
import { useNavigate } from "react-router-dom";

// for redux store state:
import { Provider } from "react-redux";
import { store } from "../../src/redux/store"; //delete?
import { configureStore } from "@reduxjs/toolkit";

// Mocking the getPosts service
vi.mock("../../src/services/posts", () => {
    const getPostsMock = vi.fn();
    return { getPosts: getPostsMock };
});

// Mocking React Router's useNavigate function
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom"); // Import actual module

    const navigateMock = vi.fn();

    return {
        ...actual, // Keep other actual exports
        useNavigate: () => navigateMock, // Mock useNavigate
        Link: ({ to, children }) => <a href={to}>{children}</a>, // Mock Link component
    };
});

// mocking the Post component since we're not testing its implementation:
vi.mock("../../src/components/Post", () => ({
    default: ({ post }) => <div data-testid="post">{post.message}</div>,
}));

describe("Feed Page", () => {
    beforeEach(() => {
        window.localStorage.removeItem("token");
    });

    test("It displays posts from the backend", async () => {
        window.localStorage.setItem("token", "testToken");

        const mockPosts = [{ _id: "12345", message: "Test Post 1" }];

        getPosts.mockResolvedValue({ posts: mockPosts, token: "newToken" });

        // creating a mock store with a user in it:
        const mockStore = configureStore({
            reducer: {
                user: (state = { user: { id: "mock-user-id" } }) => state,
            },
        });

        render(
            <Provider store={mockStore}>
                <FeedPage />
            </Provider>
        );

        const post = await screen.findByText("Test Post 1");
        expect(post.textContent).toEqual("Test Post 1");
    });

    test("It navigates to login if no token is present", async () => {
        render(
            <Provider store={store}>
                <FeedPage />
            </Provider>
        );
        const navigateMock = useNavigate();
        await waitFor(() =>
            expect(navigateMock).toHaveBeenCalledWith("/login")
        );
    });
});
