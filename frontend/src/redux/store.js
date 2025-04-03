import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// creating the store for App state:
export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});
