import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { HomePage } from "../../src/pages/Home/HomePage";
import { HivemindLogo } from "../../src/components/HivemindLogo";


// for redux store state:
import { Provider } from "react-redux";
import { store } from "../../src/redux/store";
import '@testing-library/jest-dom';


describe("Home Page", () => {
    test("renders the HivemindLogo", () => {
        // We need the Browser Router so that the Link elements load correctly
        render(
        <HivemindLogo />
        );
          
        const logo = screen.getByRole("img", { name: /HiveMind/i });
    expect(logo).toBeInTheDocument();
    });

    test("Displays a signup link", async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        const signupLink = screen.getByText("Sign Up");
        expect(signupLink.getAttribute("href")).toEqual("/signup");
    });

    test("Displays a login link", async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            </Provider>
        );

        const loginLink = screen.getByText("Log In");
        expect(loginLink.getAttribute("href")).toEqual("/login");
    });
});
