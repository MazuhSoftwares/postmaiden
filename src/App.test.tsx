import { act, render, screen } from "@testing-library/react";
import App from "./App";
import { makeOpfsAdapter } from "./services/origin-private-file-system";

jest.mock("./services/origin-private-file-system.ts", () => ({
  makeOpfsAdapter: jest.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    (makeOpfsAdapter as jest.Mock).mockClear();
    (makeOpfsAdapter as jest.Mock).mockResolvedValue({
      retrieve: jest
        .fn()
        .mockResolvedValue("d48c2b8f-e557-4503-8fac-4561bba582ac"),
      persist: jest.fn(),
    });
  });

  test("App will render fine at first", async () => {
    render(<App />);
    screen.getByText(/Postmaiden/i);
    screen.getByText(/Do you think love can bloom even on the battlefield/i);
  });

  test("App will be blocked if persisted session changes", async () => {
    render(<App />);

    await act(() => jest.runAllTimers());

    (makeOpfsAdapter as jest.Mock).mockResolvedValue({
      retrieve: jest
        .fn()
        .mockResolvedValue("01fb9ee8-926c-483e-9eb5-f020762d4b00"),
      persist: jest.fn(),
    });

    await act(() => jest.runAllTimers());

    expect(
      screen.queryByText(/Do you think love can bloom even on the battlefield/i)
    ).toBeNull();
  });
});
