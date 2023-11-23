import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import App from "./App";
import {
  makeOpfsAdapterSingleton,
  isPersistenceSupported,
} from "./services/origin-private-file-system";

jest.mock("./services/origin-private-file-system.ts", () => ({
  makeOpfsAdapterSingleton: jest
    .fn()
    .mockReturnValue(
      jest.fn().mockResolvedValue({ retrieve: jest.fn(), persist: jest.fn() })
    ),
  isPersistenceSupported: jest.fn().mockReturnValue(true),
}));

describe("App", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    (makeOpfsAdapterSingleton as jest.Mock).mockClear();
    (makeOpfsAdapterSingleton as jest.Mock).mockReturnValue(async () => ({
      retrieve: jest
        .fn()
        .mockResolvedValue("d48c2b8f-e557-4503-8fac-4561bba582ac"),
      persist: jest.fn(),
    }));
  });

  it("Renders fine at first", async () => {
    render(<App />);
    screen.getByText(/Postmaiden/i);
    screen.getByText(/Do you think love can bloom even on the battlefield/i);
  });

  it("Suspends interaction if persisted session changes", async () => {
    render(<App />);

    await act(() => jest.runAllTimers());

    (makeOpfsAdapterSingleton as jest.Mock).mockResolvedValue({
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

  it("Blocks interaction if browser doesnt support the offline persistence", () => {
    (isPersistenceSupported as jest.Mock).mockReturnValue(false);

    render(<App />);
    expect(screen.getByText(/Error/i)).toBeVisible();
  });
});
