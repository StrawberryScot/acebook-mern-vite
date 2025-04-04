import { render, screen } from "@testing-library/react";

import Post from "../../src/components/Post";

describe("Post", () => {
  test("displays the message as an article", () => {
    const testPost = { _id: "123", text: "test message" };
    render(<Post post={testPost} />);

    const article = screen.getByRole("article");
    expect(article.textContent).toBe("test message");
  });
});
