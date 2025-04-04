import { createSlice } from "@reduxjs/toolkit";

// this object defines the initial state for our user slice:
const initialState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload; //this will update user state
        },
        clearUser: (state) => {
            state.user = null; //this will reset userr state
        },
    },
});

export const { setUser, clearUser } = userSlice.actions; // exporting functions we will use to update state
export default userSlice.reducer;
