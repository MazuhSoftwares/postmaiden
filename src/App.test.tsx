import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import App from "./App";
import {
  makeOpfsFileAdapterSingleton,
  isPersistenceSupported,
} from "./services/origin-private-file-system";

jest.mock("./services/origin-private-file-system.ts", () => ({
  makeOpfsFileAdapterSingleton: jest
    .fn()
    .mockReturnValue(
      jest.fn().mockResolvedValue({ retrieve: jest.fn(), persist: jest.fn() })
    ),
  isPersistenceSupported: jest.fn().mockReturnValue(true),
}));

describe("App", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    (makeOpfsFileAdapterSingleton as jest.Mock).mockClear();
    (makeOpfsFileAdapterSingleton as jest.Mock).mockReturnValue(async () => ({
      retrieve: jest
        .fn()
        .mockResolvedValue("d48c2b8f-e557-4503-8fac-4561bba582ac"),
      persist: jest.fn(),
    }));
  });

  it("Renders fine at first", async () => {
    render(<App />);
    screen.getByText(/Postmaiden/i);
  });

  it("Suspends interaction if persisted session changes", async () => {
    render(<App />);

    await act(() => jest.runAllTimers());

    (makeOpfsFileAdapterSingleton as jest.Mock).mockResolvedValue({
      retrieve: jest
        .fn()
        .mockResolvedValue("01fb9ee8-926c-483e-9eb5-f020762d4b00"),
      persist: jest.fn(),
    });

    await act(() => jest.runAllTimers());

    expect(
      screen.queryByText(/The app was opened in another tab or window/i)
    ).toBeVisible();
  });

  it("Blocks interaction if browser doesnt support the offline persistence", () => {
    (isPersistenceSupported as jest.Mock).mockReturnValue(false);

    render(<App />);
    expect(
      screen.getByText(/Offline mode is not supported by this browser/i)
    ).toBeVisible();
  });
});
