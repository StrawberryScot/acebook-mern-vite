import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, vi, expect } from "vitest";
import LikeButton from "../../src/components/LikeButton";
import { store } from "../../src/redux/store";
import { Provider } from "react-redux";
import { MemoryRouter, useNavigate } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the post service functions
vi.mock("../../src/services/posts", () => ({
    likeUnlikePost: vi.fn(),
}));

import { likeUnlikePost } from "../../src/services/posts";

describe("LikeButton", () => {
    const postId = "789";
    const currentUserId = "123";

    const mockState = {
        user: { user: { _id: currentUserId } }
    };

    beforeEach(() => {
        localStorage.setItem("token", "test-token");
        likeUnlikePost.mockReset();
        mockNavigate.mockReset();
        vi.restoreAllMocks();
    });

    test('displays "Like" if the user has not liked the post', async () => {
        render(
            <Provider store={{ ...store, getState: () => mockState }}>
                <MemoryRouter>
                    <LikeButton post={{ _id: postId, likes: [] }} />
                </MemoryRouter>
            </Provider>
        );
        
        const button = await screen.findByRole("button");
        expect(button.textContent).toContain("Like");
    });
    
    test('displays "Liked" if the user has already liked the post', async () => {
        // Create a post with this user already in the likes array
        const post = { 
            _id: postId, 
            likes: [currentUserId] 
        };
    
        render(
            <Provider store={{ ...store, getState: () => mockState }}>
                <MemoryRouter>
                    <LikeButton post={post} />
                </MemoryRouter>
            </Provider>
        );
    
        // Wait for the component to render and check for the "Liked" text
        const button = await screen.findByRole("button");
        expect(button.textContent).toContain("Liked");
    });
    
    test("calls likeUnlikePost when button is clicked", async () => {
        // Setup the mock implementation to simulate liking a post
        likeUnlikePost.mockResolvedValue({ message: "Post liked" });
        
        const post = { _id: postId, likes: [] };
        const mockOnLikeUpdated = vi.fn();
        
        render(
            <Provider store={{ ...store, getState: () => mockState }}>
                <MemoryRouter>
                    <LikeButton post={post} onLikeUpdated={mockOnLikeUpdated} />
                </MemoryRouter>
            </Provider>
        );
    
        // Find and click the like button
        const likeButton = screen.getByRole("button");
        fireEvent.click(likeButton);
        
        // Check if likeUnlikePost was called 
        await waitFor(() => {
            expect(likeUnlikePost).toHaveBeenCalledWith("test-token", postId);
        });
        
        // Check if the callback was called
        await waitFor(() => {
            expect(mockOnLikeUpdated).toHaveBeenCalledWith(postId, "like");
        });
    });


    test("increases like count when the button is clicked multiple times", async () => {
        // Mock the service responses to simulate like and unlike
        likeUnlikePost.mockResolvedValueOnce({ message: "Post liked" })  // First click - like
            .mockResolvedValueOnce({ message: "Post unliked" })  // Second click - unlike
            .mockResolvedValueOnce({ message: "Post liked" });  // Third click - like again
        
        const post = { _id: postId, likes: [] };
        const mockOnLikeUpdated = vi.fn();
        
        render(
            <Provider store={{ ...store, getState: () => mockState }}>
                <MemoryRouter>
                    <LikeButton post={post} onLikeUpdated={mockOnLikeUpdated} />
                </MemoryRouter>
            </Provider>
        );
        
        const likeButton = screen.getByRole("button");
        const likeCountText = screen.getByText(/like/i);  // This is to initially get the 'Like' button text
    
        // First click (like)
        fireEvent.click(likeButton);
        await waitFor(() => {
            const likeCountSpan = screen.getByText("1 like");  // Check the like count span
            expect(likeCountSpan.textContent).toContain("1 like");
        });
        
        // Second click (unlike)
        fireEvent.click(likeButton);
        await waitFor(() => {
        const likeCountSpan = screen.queryByRole("span", { name: /like/i });
        expect(likeCountSpan).toBeNull();  // Nothing shows when it is unliked 
        })
        
        // Third click (like again)
        fireEvent.click(likeButton);
        await waitFor(() => {
            const likeCountSpan = screen.getByText("1 like");  // Check the like count span - should show '1 like' again
            expect(likeCountSpan.textContent).toContain("1 like");
        });
    
        // Check if onLikeUpdated was called on each click with the correct action
        await waitFor(() => {
            expect(mockOnLikeUpdated).toHaveBeenCalledWith(postId, "like");
            expect(mockOnLikeUpdated).toHaveBeenCalledWith(postId, "unlike");
            expect(mockOnLikeUpdated).toHaveBeenCalledWith(postId, "like");
        });
    });
    
});