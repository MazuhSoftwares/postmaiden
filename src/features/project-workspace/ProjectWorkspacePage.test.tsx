import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import * as wouter from "wouter";
import { ProjectWorkspacePage } from "./ProjectWorkspacePage";
import * as OPFSSharedInternalsService from "@/services/opfs-projects-shared-internals";

jest.mock("wouter", () => ({
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock("@/services/opfs-projects-shared-internals", () => ({
  retrieveProject: jest.fn(),
  persistProject: jest.fn(),
}));

describe("Projects workspace page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(wouter, "useParams").mockReturnValue({
      uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
    });

    jest
      .spyOn(OPFSSharedInternalsService, "retrieveProject")
      .mockResolvedValue({
        uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
        name: "Umbrella Corp API",
        sections: [],
        specs: [],
      });
  });

  it("displays the name of the retrieved project matching the url params, by retrieving the project from OFPS", async () => {
    await act(async () => render(<ProjectWorkspacePage />));

    expect(screen.getByText(/Umbrella Corp API/i)).toBeVisible();
  });

  it("shows error if theres an invalid uuid as url param", async () => {
    jest.spyOn(wouter, "useParams").mockReturnValue({
      uuid: "aaaa-bbbb-cccc-dddd-eeee",
    });

    await act(async () => render(<ProjectWorkspacePage />));

    expect(screen.getByText(/Invalid project URL/i)).toBeVisible();
  });

  it("lists the request specs of the retrieved project, by retrieving the project from OFPS", async () => {
    jest
      .spyOn(OPFSSharedInternalsService, "retrieveProject")
      .mockResolvedValue({
        uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
        name: "Umbrella Corp API",
        specs: [
          {
            uuid: "681d4cb2-2654-41b7-93b0-359703458299",
            method: "GET",
            url: "https://re.capcom.com/stars-members",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
                isEnabled: true,
              },
            ],
            body: "{}",
          },
        ],
        sections: [],
      });

    await act(async () => render(<ProjectWorkspacePage />));
    expect(screen.getByText(/stars-members/i)).toBeVisible();
  });

  it("can easily create new request spec with everything empty but some default headers, by updating the project stored in OFPS", async () => {
    jest
      .spyOn(OPFSSharedInternalsService, "retrieveProject")
      .mockResolvedValue({
        uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
        name: "Umbrella Corp API",
        specs: [
          {
            uuid: "681d4cb2-2654-41b7-93b0-359703458299",
            method: "GET",
            url: "https://re.capcom.com/stars-members",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
                isEnabled: true,
              },
            ],
            body: "{}",
          },
        ],
        sections: [],
      });

    jest.spyOn(OPFSSharedInternalsService, "persistProject");

    await act(async () => render(<ProjectWorkspacePage />));

    const button = screen.getByRole("button", { name: /Create request spec/i });
    await act(async () => button.click());

    expect(OPFSSharedInternalsService.persistProject).toHaveBeenCalledTimes(1);

    const [lastCallArg] = (
      OPFSSharedInternalsService.persistProject as jest.Mock
    ).mock.lastCall;
    expect(lastCallArg.uuid).toEqual("2372aa5e-9042-4c47-a7e5-a01d9d6005ea");
    expect(lastCallArg.name).toEqual("Umbrella Corp API");
    expect(lastCallArg.specs).toHaveLength(2);

    const recentlyInsertedSpec = lastCallArg.specs[1];
    expect(recentlyInsertedSpec.headers).toEqual([
      {
        key: "Content-Type",
        value: "application/json",
        isEnabled: false,
      },
      {
        key: "Accept",
        value: "application/json",
        isEnabled: true,
      },
    ]);
    expect(recentlyInsertedSpec.method).toEqual("GET");
    expect(recentlyInsertedSpec.url).toEqual("");
    expect(recentlyInsertedSpec.body).toEqual("");
  });

  it("can remove a existing spec, by updating the project stored in OFPS", async () => {
    jest
      .spyOn(OPFSSharedInternalsService, "retrieveProject")
      .mockResolvedValue({
        uuid: "2372aa5e-9042-4c47-a7e5-a01d9d6005ea",
        name: "Umbrella Corp API",
        specs: [
          {
            uuid: "681d4cb2-2654-41b7-93b0-359703458299",
            method: "GET",
            url: "https://re.capcom.com/stars-members",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
                isEnabled: true,
              },
            ],
            body: "{}",
          },
          {
            uuid: "6203a158-66ab-446a-8c73-e3578d4f5951",
            method: "GET",
            url: "https://re.capcom.com/bio-weapons",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
                isEnabled: true,
              },
            ],
            body: "{}",
          },
          {
            uuid: "a127b563-1c28-4d97-9e34-0617499b228b",
            method: "GET",
            url: "https://re.capcom.com/nest-labs",
            headers: [
              {
                key: "Content-Type",
                value: "application/json",
                isEnabled: true,
              },
            ],
            body: "{}",
          },
        ],
        sections: [],
      });

    jest.spyOn(OPFSSharedInternalsService, "persistProject");

    await act(async () => render(<ProjectWorkspacePage />));

    const removeBtns = screen.getAllByRole("button", { name: /Remove/i });
    const removeBtn = removeBtns.at(1); // "bio-weapons" spec, the one in the middle
    await act(async () => removeBtn!.click());

    const confirmBtn = screen.getByRole("button", {
      name: /Remove request spec/i,
    });
    await act(async () => confirmBtn.click());

    expect(OPFSSharedInternalsService.persistProject).toHaveBeenCalledTimes(1);

    const [lastCallArg] = (
      OPFSSharedInternalsService.persistProject as jest.Mock
    ).mock.lastCall;
    expect(lastCallArg.uuid).toEqual("2372aa5e-9042-4c47-a7e5-a01d9d6005ea");
    expect(lastCallArg.name).toEqual("Umbrella Corp API");
    expect(lastCallArg.specs).toEqual([
      {
        uuid: "681d4cb2-2654-41b7-93b0-359703458299",
        method: "GET",
        url: "https://re.capcom.com/stars-members",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
            isEnabled: true,
          },
        ],
        body: "{}",
      },
      {
        uuid: "a127b563-1c28-4d97-9e34-0617499b228b",
        method: "GET",
        url: "https://re.capcom.com/nest-labs",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
            isEnabled: true,
          },
        ],
        body: "{}",
      },
    ]);
  });
});
