// docs: https://vitejs.dev/guide/env-and-mode.html
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getPosts(token) {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(`${BACKEND_URL}/posts`, requestOptions);

  if (response.status !== 200) {
    throw new Error("Unable to fetch posts");
  }

  const data = await response.json();
  return data;
}

export async function createPost(token, text) {
  // We need to decode the token to get the user ID
  const userId = extractUserIdFromToken(token);

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
      postedBy: userId,
    }),
  };

  const response = await fetch(`${BACKEND_URL}/posts`, requestOptions);

  if (response.status !== 201) {
    throw new Error("Unable to create post");
  }

  const data = await response.json();
  return data;
}

export async function deletePost(token, postId) {
  const requestOptions = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(
    `${BACKEND_URL}/posts/${postId}`,
    requestOptions
  );

  if (response.status !== 200) {
    throw new Error("Unable to delete post");
  }

  const data = await response.json();
  return data;
}

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
