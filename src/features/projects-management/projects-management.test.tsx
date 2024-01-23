import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ProjectsManagementPage } from "./ProjectsManagementPage";
import * as OPFSProjectsListingService from "./opfs-projects-listing-service";

describe("ProjectsManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders", async () => {
    jest
      .spyOn(OPFSProjectsListingService, "retrieveProjectsListing")
      .mockResolvedValue({
        items: [],
      });

    await act(async () => render(<ProjectsManagementPage />));

    expect(screen.getByText(/Start now/i)).toBeVisible();
  });

  it("lists projects", async () => {
    jest
      .spyOn(OPFSProjectsListingService, "retrieveProjectsListing")
      .mockResolvedValue({
        items: [
          { uuid: "111-111-111", name: "My first API" },
          { uuid: "222-222-222", name: "Just a second project" },
          { uuid: "333-333-333", name: "Some third thing" },
        ],
      });

    await act(async () => render(<ProjectsManagementPage />));

    expect(
      OPFSProjectsListingService.retrieveProjectsListing
    ).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/My first API/i)).toBeVisible();
    expect(screen.getByText(/Just a second project/i)).toBeVisible();
    expect(screen.getByText(/Some third thing/i)).toBeVisible();
  });

  it("can create new project", async () => {
    jest
      .spyOn(OPFSProjectsListingService, "retrieveProjectsListing")
      .mockResolvedValue({
        items: [],
      });

    jest.spyOn(OPFSProjectsListingService, "persistNewProjectListingItem");

    await act(async () => render(<ProjectsManagementPage />));

    const button = screen.getByRole("button", { name: /Create project/i });
    await act(async () => button.click());

    const input = screen.getByLabelText(/Name/i);
    await act(async () =>
      fireEvent.change(input, { target: { value: "My favorite API" } })
    );

    const submit = screen.getByRole("button", { name: /Create/i });
    await act(async () => submit.click());

    expect(
      OPFSProjectsListingService.persistNewProjectListingItem
    ).toHaveBeenCalledWith("My favorite API");
  });

  it("can remove a project", async () => {
    jest
      .spyOn(OPFSProjectsListingService, "retrieveProjectsListing")
      .mockResolvedValue({
        items: [{ uuid: "123-123-123", name: "Some random API" }],
      });

    jest.spyOn(OPFSProjectsListingService, "removeProjectListingItem");

    await act(async () => render(<ProjectsManagementPage />));

    const button = screen.getByRole("button", { name: /Remove/i });
    await act(async () => button.click());

    const submit = screen.getByRole("button", { name: /Remove/i });
    await act(async () => submit.click());

    expect(
      OPFSProjectsListingService.removeProjectListingItem
    ).toHaveBeenCalledWith({ uuid: "123-123-123", name: "Some random API" });
  });

  it("can update a project in a modal", async () => {
    jest
      .spyOn(OPFSProjectsListingService, "retrieveProjectsListing")
      .mockResolvedValue({
        items: [
          { uuid: "111-111-111", name: "My first API" },
          { uuid: "222-222-222", name: "Just a second project" },
          { uuid: "333-333-333", name: "Some third thing" },
        ],
      });

    jest.spyOn(OPFSProjectsListingService, "updateProjectListingItem");

    await act(async () => render(<ProjectsManagementPage />));

    const buttons = screen.getAllByRole("button", { name: /Rename/i });
    await act(async () => buttons.at(1)!.click());

    const input = screen.getByLabelText(/Name/);
    await act(async () =>
      fireEvent.change(input, {
        target: { value: "A very cool second project" },
      })
    );

    const submit = screen.getByRole("button", { name: /Update/i });
    await act(async () => submit.click());

    expect(
      OPFSProjectsListingService.updateProjectListingItem
    ).toHaveBeenCalledWith({
      uuid: "222-222-222",
      name: "A very cool second project",
    });
  });
});
