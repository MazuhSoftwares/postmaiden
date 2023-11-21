import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeAll(() => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockImplementation(() => ({
          getFileHandle: jest.fn().mockImplementation(() => ({
            getFile: jest.fn().mockResolvedValue({
              text: jest.fn().mockResolvedValue("mock-uuid"),
            }),
            createWritable: jest.fn().mockResolvedValue({
              write: jest.fn(),
              close: jest.fn(),
            }),
          })),
        })),
      },
      writable: true,
    });
  });

  test("App can run", async () => {
    render(<App />);
    screen.getByText(/Postmaiden/i);
  });
});
