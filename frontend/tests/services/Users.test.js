import createFetchMock from "vitest-fetch-mock";
import { describe, expect, vi } from "vitest";

import {
  getUserProfileById,
  updateUserProfile,
  addFriend,
  getFriends,
  searchUsers,
} from "../../src/services/Users";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

createFetchMock(vi).enableMocks();

describe("users service", () => {
  describe("getUserProfileById", () => {
    test("includes a token with its request", async () => {
      const userId = "123"; // Add a test userId
      fetch.mockResponseOnce(JSON.stringify({ user: [], token: "newToken" }), {
        status: 200,
      });

      await getUserProfileById("testToken", userId);

      // This is an array of the arguments that were last passed to fetch
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/users/${userId}/completeProfile`);
      expect(options.method).toEqual("GET");
      expect(options.headers["Authorization"]).toEqual("Bearer testToken");
    });

    test("rejects with an error if the status is not 200", async () => {
      const userId = "123";
      fetch.mockResponseOnce(
        JSON.stringify({ message: "Unable to fetch user profile" }),
        { status: 400 }
      );

      try {
        await getUserProfileById("testToken", userId);
      } catch (err) {
        expect(err.message).toEqual("Unable to fetch user profile");
      }
    });

    test("returns all user data on successful response", async () => {
      const userId = "61a1234b5678c9defg012345";
      const mockUser = {
        _id: userId,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        profilePicPath: "/uploads/profile/test.jpg",
        friends: ["61b2345c6789d0efgh123456", "61c3456d7890e1fghi234567"],
        status: "Online",
        backgroundPicPath: "/uploads/background/test.jpg",
        isOnlyFriends: true,
      };

      // Note: password shouldn't be returned in API responses
      const mockResponse = { user: mockUser, token: "newToken" };

      fetch.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

      const result = await getUserProfileById("testToken", userId);

      expect(result).toEqual(mockResponse);
      expect(result.user.email).toEqual("test@example.com");
      expect(result.user.firstName).toEqual("Test");
      expect(result.user.lastName).toEqual("User");
      expect(result.user.friends).toHaveLength(2);
      expect(result.user.status).toEqual("Online");
      expect(result.user.isOnlyFriends).toBe(true);

      // Ensure password is not returned in the response
      expect(result.user.password).toBeUndefined();
    });
  });

  describe("updateUserProfile", () => {
    test("Includes a token with its response", async () => {
      const userId = "123"; // Add a test userId
      const profilePicPath = "testPicUrlPath";
      const status = "online";
      fetch.mockResponseOnce(JSON.stringify({ user: [], token: "newToken" }), {
        status: 200,
      });

      await updateUserProfile("testToken", userId, profilePicPath, status);

      // This is an array of the arguments that were last passed to fetch
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/users/${userId}/updateProfile`);
      expect(options.method).toEqual("PUT");
      expect(options.headers["Authorization"]).toEqual("Bearer testToken");
    });

    test("recieve an error response if unable to update profile", async () => {
      const userId = "123";
      const profilePicPath = "testPath";
      const status = "online";

      fetch.mockResponseOnce(JSON.stringify({ message: "server error" }), {
        status: 400,
      });

      try {
        await updateUserProfile("testToken", userId, profilePicPath, status);
      } catch (err) {
        expect(err.message).toEqual("Unable to update profile");
      }
    });

    test("returns updated fields on successful repsonse", async () => {
      const userId = "61a1234b5678c9defg012345";

      // Original user state (before update)
      const originalUser = {
        _id: userId,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        profilePicPath: "/original/profile/pic/path",
        friends: ["61b2345c6789d0efgh123456", "61c3456d7890e1fghi234567"],
        status: "online",
        backgroundPicPath: "/uploads/background/test.jpg",
        isOnlyFriends: true,
      };

      // What we expect after update
      const updatedUser = {
        ...originalUser,
        profilePicPath: "/updated/profile/pic/path",
        status: "offline",
      };

      // Mock response from server after update
      const mockResponse = {
        user: updatedUser,
        token: "newToken",
      };

      fetch.mockResponseOnce(JSON.stringify(mockResponse), {
        status: 200,
      });

      // Call the update function with new values
      const result = await updateUserProfile(
        "testToken",
        userId,
        "/updated/profile/pic/path",
        "offline"
      );

      // Verify the changes were applied correctly
      expect(result.user.profilePicPath).not.toEqual(
        originalUser.profilePicPath
      );
      expect(result.user.profilePicPath).toEqual("/updated/profile/pic/path");
      expect(result.user.status).not.toEqual(originalUser.status);
      expect(result.user.status).toEqual("offline");

      // Verify other fields remained unchanged
      expect(result.user.email).toEqual(originalUser.email);
      expect(result.user.firstName).toEqual(originalUser.firstName);
      expect(result.user.lastName).toEqual(originalUser.lastName);
    });
  });

  describe("Add friend", () => {
    test("includes a token with its request", async () => {
      const friendUserId = "123";
      const userSignedIn = "456";

      // Fake JWT token that will decode to what we want
      const fakePayload = JSON.stringify({ user_id: userSignedIn });
      const encodedPayload = btoa(fakePayload);
      const fakeToken = `header.${encodedPayload}.signature`;

      fetch.mockResponseOnce(JSON.stringify({ user: [], token: "newToken" }), {
        status: 200,
      });

      await addFriend(fakeToken, friendUserId);

      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/users/${friendUserId}/friend`);
      expect(options.method).toEqual("POST");
      expect(options.headers.Authorization).toEqual(`Bearer ${fakeToken}`);

      const requestBody = JSON.parse(options.body);
      expect(requestBody.userSignedIn).toEqual(userSignedIn);
    });

    test("returns an error if unable to add friend", async () => {
      const friendUserId = "123";
      const userSignedIn = "456";

      // Create a fake JWT token that will decode properly
      const fakePayload = JSON.stringify({ user_id: userSignedIn });
      const encodedPayload = btoa(fakePayload);
      const fakeToken = `header.${encodedPayload}.signature`;

      // Mock a failed response
      fetch.mockResponseOnce(JSON.stringify({ message: "Server error" }), {
        status: 400,
      });

      // Ensure we expect an error to be thrown
      expect.assertions(1);

      try {
        await addFriend(fakeToken, friendUserId);
        // If we get here, the test should fail
        fail("Expected function to throw an error but it didn't");
      } catch (error) {
        // Verify the error message matches what we expect
        expect(error.message).toBe("Unable to add friend");
      }
    });

    test("not friend becomes friend after adding successfully", async () => {
      const friendUserId = "123";
      const userSignedIn = "456";

      const fakePayload = JSON.stringify({ user_id: userSignedIn });
      const encodedPayload = btoa(fakePayload);
      const fakeToken = `header.${encodedPayload}.signature`;

      // Initial state - user doesn't have friendUserId in their friends list
      const initialUser = {
        _id: userSignedIn,
        friends: ["789", "101112"], // Other friends, but not the one we're adding
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      // Mock response after adding friend - now includes the new friendUserId
      const updatedUser = {
        ...initialUser,
        friends: [...initialUser.friends, friendUserId], // Added the new friend
      };

      const mockResponse = {
        user: updatedUser,
        token: "newToken",
      };

      fetch.mockResponseOnce(JSON.stringify(mockResponse), {
        status: 200,
      });

      const result = await addFriend(fakeToken, friendUserId);

      // Verify the friend wasn't in the initial list
      expect(initialUser.friends).not.toContain(friendUserId);

      // Verify the friend is now in the list after the operation
      expect(result.user.friends).toContain(friendUserId);

      // Verify the new friends list contains all the original friends plus the new one
      expect(result.user.friends.length).toBe(initialUser.friends.length + 1);
      initialUser.friends.forEach((friend) => {
        expect(result.user.friends).toContain(friend);
      });

      // Verify other user properties weren't changed
      expect(result.user._id).toEqual(initialUser._id);
      expect(result.user.email).toEqual(initialUser.email);
      expect(result.user.firstName).toEqual(initialUser.firstName);
      expect(result.user.lastName).toEqual(initialUser.lastName);
    });
  });

  describe("getFriends", () => {
    test("throws an error when server returns a non-200 status code", async () => {
      const friendUserId = "123";
      const token = "fake-token";

      // Mock a failed response
      fetch.mockResponseOnce(JSON.stringify({ message: "Server error" }), {
        status: 400,
      });

      expect.assertions(1);

      try {
        await getFriends(token, friendUserId);
        fail("Expected function to throw an error but it didn't");
      } catch (error) {
        // Verify the error message matches what we expect
        expect(error.message).toBe("Unable to get friends");
      }
    });

    // Test for successful request
    test("returns data on successful response", async () => {
      const friendUserId = "123";
      const token = "fake-token";

      // Mock successful response
      const mockResponse = {
        friends: [],
      };

      fetch.mockResponseOnce(JSON.stringify(mockResponse), {
        status: 200,
      });

      // Call the function
      const result = await getFriends(token, friendUserId);

      // Verify result matches the mock response
      expect(result).toEqual(mockResponse);

      // Verify the request was made correctly
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];
      const options = fetchArguments[1];

      expect(url).toEqual(`${BACKEND_URL}/users/${friendUserId}/getFriends`);
      expect(options.method).toEqual("GET");
      expect(options.headers.Authorization).toEqual(`Bearer ${token}`);
    });

    // Test with mock friends data
    test("returns friends list populated from the database", async () => {
      const friendUserId = "123";
      const token = "fake-token";

      // Create mock friends data that would come from the database
      const mockFriendsList = [
        {
          _id: "456",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          profilePicPath: "/profile/john.jpg",
          status: "online",
        },
        {
          _id: "789",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          profilePicPath: "/profile/jane.jpg",
          status: "offline",
        },
      ];

      // Mock successful response with friends data
      const mockResponse = {
        friends: mockFriendsList,
      };

      fetch.mockResponseOnce(JSON.stringify(mockResponse), {
        status: 200,
      });

      // Call the function
      const result = await getFriends(token, friendUserId);

      // Verify the result contains the mock friends list
      expect(result.friends).toBeDefined();
      expect(Array.isArray(result.friends)).toBe(true);
      expect(result.friends.length).toBe(2);

      // Verify the first friend's data
      expect(result.friends[0]._id).toBe("456");
      expect(result.friends[0].firstName).toBe("John");
      expect(result.friends[0].lastName).toBe("Doe");

      // Verify the second friend's data
      expect(result.friends[1]._id).toBe("789");
      expect(result.friends[1].firstName).toBe("Jane");
      expect(result.friends[1].lastName).toBe("Smith");

      // Verify the URL was constructed correctly for this specific user ID
      const fetchArguments = fetch.mock.lastCall;
      expect(fetchArguments[0]).toContain(friendUserId);
    });

    test("throws an error when friendUserId is not provided", async () => {
      const token = "fake-token";

      // Try different invalid values for friendUserId
      const invalidValues = [null, undefined, ""];

      expect.assertions(invalidValues.length);

      for (const invalidValue of invalidValues) {
        try {
          await getFriends(token, invalidValue);
          // If we get here, the test should fail
          fail(
            `Expected function to throw an error with friendUserId = ${invalidValue} but it didn't`
          );
        } catch (error) {
          // Verify the error message matches what we expect
          expect(error.message).toBe("friendUserId is required");
        }
      }
    });
  });

  describe("searchUsers", () => {
    test("returns search results on successful response", async () => {
      const searchQuery = "john";

      // Mock successful response with search results
      const mockUsers = [
        {
          _id: "123",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
        {
          _id: "456",
          firstName: "Johnny",
          lastName: "Smith",
          email: "johnny@example.com",
        },
      ];

      fetch.mockResponseOnce(JSON.stringify(mockUsers), {
        status: 200,
        ok: true,
      });

      const result = await searchUsers(searchQuery);

      // Verify the result contains the mock users
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);

      // Verify the correct URL was constructed with encoded query
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];

      expect(url).toEqual(
        `${BACKEND_URL}/users/search?query=${encodeURIComponent(searchQuery)}`
      );
    });

    // Test for error response
    test("throws an error when the server response is not ok", async () => {
      const searchQuery = "john";

      // Mock failed response
      fetch.mockResponseOnce(JSON.stringify({ message: "Server error" }), {
        status: 500,
        ok: false,
      });

      // Ensure we expect an error to be thrown
      expect.assertions(1);

      try {
        await searchUsers(searchQuery);
        fail("Expected function to throw an error but it didn't");
      } catch (error) {
        expect(error.message).toBe("Failed to search users");
      }
    });

    // Test with special characters in query
    test("properly encodes special characters in the search query", async () => {
      const searchQuery = "john & mary+smith";

      // Mock successful response
      fetch.mockResponseOnce(JSON.stringify([]), {
        status: 200,
        ok: true,
      });

      // Call the function
      await searchUsers(searchQuery);

      // Verify the URL was constructed with properly encoded query
      const fetchArguments = fetch.mock.lastCall;
      const url = fetchArguments[0];

      // The expected URL should have the query properly encoded
      const expectedUrl = `${BACKEND_URL}/users/search?query=${encodeURIComponent(
        searchQuery
      )}`;
      expect(url).toEqual(expectedUrl);

      // Double-check that special characters were actually encoded
      expect(url).toContain("john%20%26%20mary%2Bsmith");
    });

    // Test with empty search results
    test("returns empty array when no users match the search", async () => {
      const searchQuery = "nonexistentuser";

      // Mock successful response with empty array
      fetch.mockResponseOnce(JSON.stringify([]), {
        status: 200,
        ok: true,
      });

      // Call the function
      const result = await searchUsers(searchQuery);

      // Verify the result is an empty array
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
