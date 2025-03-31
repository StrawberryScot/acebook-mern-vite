import { screen, render } from "@testing-library/react";

import Hello from "../src/components/Hello";

describe("Hello", () => {
  it("Should render a h1 with the correct name", () => {
    render(<Hello name="Alice" />);
    expect(screen.getByText("Hello Alice!"));
  });
});
