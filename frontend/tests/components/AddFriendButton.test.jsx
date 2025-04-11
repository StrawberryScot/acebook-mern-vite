import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AddFriendButton from "../../src/components/AddFriendButton";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock services
vi.mock("../../src/services/Users", () => ({
  getFriends: vi.fn(),
  addFriend: vi.fn(),
}));

import { getFriends, addFriend } from "../../src/services/Users";

describe("AddFriendButton", () => {
  const friendId = "456";
  const currentUserId = "123";

  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    getFriends.mockReset();
    addFriend.mockReset();
    mockNavigate.mockReset();
  });

  test('displays "Add Friend" if users are not friends', async () => {
    getFriends.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AddFriendButton friendId={friendId} currentUserId={currentUserId} />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button");
    expect(button.textContent).to.include("Add Friend");
  });

  test('displays "Friends" if users are already friends', async () => {
    getFriends.mockResolvedValue([{ id: currentUserId }]);

    render(
      <MemoryRouter>
        <AddFriendButton friendId={friendId} currentUserId={currentUserId} />
      </MemoryRouter>
    );

    const label = await screen.findByText("Friends");
    expect(label.textContent).to.include("Friends");
  });

  test("calls addFriend when button is clicked", async () => {
    getFriends.mockResolvedValue([]);
    addFriend.mockResolvedValue({});

    render(
      <MemoryRouter>
        <AddFriendButton friendId={friendId} currentUserId={currentUserId} />
      </MemoryRouter>
    );

    const button = await screen.findByText("Add Friend");
    fireEvent.click(button);

    await waitFor(() => {
      expect(addFriend).toHaveBeenCalledWith("test-token", friendId);
    });

    const label = await screen.findByText("Friends");
    expect(label.textContent).to.include("Friends");
  });

  test("redirects to /login if token is missing", async () => {
    localStorage.removeItem("token");
    getFriends.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AddFriendButton friendId={friendId} currentUserId={currentUserId} />
      </MemoryRouter>
    );

    const button = await screen.findByText("Add Friend");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
