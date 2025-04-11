import { render, screen } from "@testing-library/react";
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Post from "../../src/components/Post";


describe("Post", () => {
  test("displays the message as an article", () => {
    const testPost = {
      _id: "123", 
      text: "test message",
      user: { id: 123, name: 'Alice' },
      likes: ['123'],
    };

    const initialState = {
      user: { user: {_id: '123', name: 'Alice' } },
    };

    const store = configureStore({
      reducer: {
        user: (state = initialState.user, action) => state,
      }
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Post post={testPost} />
        </MemoryRouter>
      </Provider>
    );

    const article = screen.getByRole("article");
    expect(article.textContent).to.include("test message")
  });
});
