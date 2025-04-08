import { createSlice } from "@reduxjs/toolkit";

// this object defines the initial state for our user slice:
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; //this will update user state
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null; //this will reset userr state
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, clearUser } = userSlice.actions; // exporting functions we will use to update state
export default userSlice.reducer;
