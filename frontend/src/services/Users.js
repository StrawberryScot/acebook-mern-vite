const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getUserProfileById(token, userId) {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(
    `${BACKEND_URL}/users/${userId}/completeProfile`,
    requestOptions
  );

  if (response.status !== 200) {
    throw new Error("Unable to fetch user profile");
  }

  const data = await response.json();
  return data;
}

export async function updateUserProfile(token, userId, profilePicPath, status) {
  const updateData = {};
  if (profilePicPath !== undefined) updateData.profilePicPath = profilePicPath;
  if (status !== undefined) updateData.status = status;

  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  };

  const response = await fetch(
    `${BACKEND_URL}/users/${userId}/updateProfile`,
    requestOptions
  );
  if (response.status !== 200) {
    throw new Error("Unable to update profile");
  }
  const data = await response.json();
  return data;
}

export async function addFriend(token, friendUserId) {
  if (!friendUserId) {
    throw new Error("friendUserId is required");
  }

  const userSignedIn = await extractUserIdFromToken(token);
  console.log(userSignedIn);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userSignedIn }),
  };

  const response = await fetch(
    `${BACKEND_URL}/users/${friendUserId}/friend`,
    requestOptions
  );

  if (response.status !== 200) {
    throw new Error("Unable to add friend");
  }

  const data = await response.json();
  return data;
}

export async function getFriends(token, friendUserId) {
  if (!friendUserId) {
    throw new Error("friendUserId is required");
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(
    `${BACKEND_URL}/users/${friendUserId}/getFriends`,
    requestOptions
  );

  if (response.status !== 200) {
    throw new Error("Unable to get friends");
  }
  const data = await response.json();
  return data;
}

export async function searchUsers(query) {
  console.log("query in search bar is ", query);
  const res = await fetch(
    `${BACKEND_URL}/users/search?query=${encodeURIComponent(query)}`
  );
  console.log("res is ", res);
  if (!res.ok) {
    throw new Error("Failed to search users");
  }
  return await res.json();
}

//get user from token
// Simple function to extract user ID from token
function extractUserIdFromToken(token) {
  try {
    // Split the token and get the payload (middle part)
    const payload = token.split(".")[1];
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    // Return the user_id from the payload
    return decodedPayload.user_id;
  } catch (error) {
    console.error("Error extracting user ID from token:", error);
    return null;
  }
}
