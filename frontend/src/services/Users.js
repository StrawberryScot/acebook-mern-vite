const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getUserProfileById(token, userId) {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(
    `${BACKEND_URL}/users/${userId}/profile`,
    requestOptions
  );

  if (response.status !== 200) {
    throw new Error("Unable to fetch user profile");
  }

  const data = await response.json();
  return data;
}
