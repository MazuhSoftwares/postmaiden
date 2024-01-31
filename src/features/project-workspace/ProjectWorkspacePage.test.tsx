import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import * as wouter from "wouter";
import { ProjectWorkspacePage } from "./ProjectWorkspacePage";
import * as OPFSProjectService from "./opfs-project-service";

jest.mock("wouter", () => ({
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock("@/services/opfs-projects-shared-internals", () => ({
  retrieveProject: jest.fn(),
}));

describe("Projects workspace page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(wouter, "useParams").mockReturnValue({
      uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
    });

    jest.spyOn(OPFSProjectService, "retrieveProject").mockResolvedValue({
      uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
      name: "Umbrella Corp API",
      sections: [],
      specs: [],
    });
  });

  it("displays the name of the retrieved project matching the url params", async () => {
    await act(async () => render(<ProjectWorkspacePage />));

    expect(screen.getByText(/Umbrella Corp API/i)).toBeVisible();
  });

  it("shows error if theres an invalid url params", async () => {
    jest.spyOn(wouter, "useParams").mockReturnValue({
      uuid: "aaaa-bbbb-cccc-dddd-eeee",
    });

    await act(async () => render(<ProjectWorkspacePage />));

    expect(screen.getByText(/Invalid project URL/i)).toBeVisible();
  });
});
