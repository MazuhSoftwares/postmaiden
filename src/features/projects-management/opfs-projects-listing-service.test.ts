import * as uuid from "uuid";
import {
  retrieveProjectsListing,
  persistNewProjectListingItem,
  removeProjectListingItem,
  updateProjectListingItem,
} from "./opfs-projects-listing-service";
import * as opfsAdapters from "../../services/origin-private-file-system";

jest.mock("uuid");

jest.mock("../../services/origin-private-file-system");

describe("OPFS project listing service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("must query only the specific directory of projects", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValueOnce({
      retrieveFilenames: jest.fn().mockResolvedValueOnce([]),
    });

    await retrieveProjectsListing();

    expect(opfsAdapters.makeOpfsMainDirAdapter).toHaveBeenCalledTimes(1);
    expect(opfsAdapters.makeOpfsMainDirAdapter).toHaveBeenCalledWith({
      subdir: "projects",
    });
  });

  it("can retrieve a list of projects based on stored jsons", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValueOnce({
      retrieveFilenames: jest
        .fn()
        .mockResolvedValue([
          "91599476-833d-4c3e-826b-8fe768fad0bf_My cool API.json",
          "82184240-6b29-4ae8-82f5-fbe7d1bb814a_MyAPI.json",
        ]),
    });

    const listing = await retrieveProjectsListing();

    expect(listing).toEqual({
      items: [
        { name: "My cool API", uuid: "91599476-833d-4c3e-826b-8fe768fad0bf" },
        { name: "MyAPI", uuid: "82184240-6b29-4ae8-82f5-fbe7d1bb814a" },
      ],
    });
  });

  it("can persist a new project, by generating an uuid for it and initial data", async () => {
    jest
      .spyOn(uuid, "v4")
      .mockReturnValueOnce("46b9450e-248f-4194-bc2c-f8973e96959a");

    const persistMock = jest.fn();
    (opfsAdapters.makeOpfsFileAdapter as jest.Mock).mockResolvedValueOnce({
      persist: persistMock,
    });

    const project = await persistNewProjectListingItem("Poke API");

    expect(project.uuid).toBe("46b9450e-248f-4194-bc2c-f8973e96959a");
    expect(project.name).toBe("Poke API");

    expect(persistMock).toHaveBeenCalledTimes(1);
    expect(persistMock).toHaveBeenCalledWith({
      uuid: "46b9450e-248f-4194-bc2c-f8973e96959a",
      name: "Poke API",
      sections: [],
      specs: [],
    });
  });

  it("can remove a project by quering the specific file within the directory", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValueOnce({
      retrieveFilenames: jest
        .fn()
        .mockResolvedValue([
          "82184240-6b29-4ae8-82f5-fbe7d1bb814a_Other random API.json",
          "73aa5920-55e6-4275-b193-a9a9ad5de15d_LoL API with other persisted name.json",
        ]),
    });

    const removeMock = jest.fn();
    (opfsAdapters.makeOpfsFileAdapter as jest.Mock).mockResolvedValueOnce({
      remove: removeMock,
    });

    const result = await removeProjectListingItem({
      uuid: "73aa5920-55e6-4275-b193-a9a9ad5de15d",
      name: "LoL API",
    });
    expect(result).toEqual({ uuid: "73aa5920-55e6-4275-b193-a9a9ad5de15d" });

    expect(opfsAdapters.makeOpfsFileAdapter).toHaveBeenCalledWith({
      filename:
        "73aa5920-55e6-4275-b193-a9a9ad5de15d_LoL API with other persisted name.json",
      subdir: "projects",
    });
    expect(removeMock).toHaveBeenCalledTimes(1);
  });

  it("can rename an existing project by keeping its uuid but detecting the different name", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValue({
      retrieveFilenames: jest
        .fn()
        .mockResolvedValue([
          "96278da0-cca4-415d-b475-b02b1b0b3b73_Maine Project.json",
          "4db20d2a-542e-4c01-95bf-df49fb6dcbd8_Dorio API.json",
        ]),
    });

    const removeMock = jest.fn();
    const persistMock = jest.fn();
    (opfsAdapters.makeOpfsFileAdapter as jest.Mock).mockResolvedValue({
      persist: persistMock,
      remove: removeMock,
    });

    const updatedProject = await updateProjectListingItem({
      uuid: "4db20d2a-542e-4c01-95bf-df49fb6dcbd8",
      name: "Rebecca API",
    });
    expect(updatedProject.uuid).toBe("4db20d2a-542e-4c01-95bf-df49fb6dcbd8");
    expect(updatedProject.name).toBe("Rebecca API");

    expect(persistMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
  });

  it("throws error if retrieved filenames are corrupted with invalid patterns", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValueOnce({
      retrieveFilenames: jest
        .fn()
        .mockResolvedValueOnce([
          "82184240-6b29-4ae8-82f5-fbe7d1bb814a_MyAPI.json",
          "91599476-833d-invaliduuid-826b-8fe768fad0bf_My cool API.json",
        ]),
    });

    await expect(() => retrieveProjectsListing()).rejects.toEqual(
      new Error(
        "Invalid project filename (corrupted data?): 91599476-833d-invaliduuid-826b-8fe768fad0bf_My cool API.json"
      )
    );
  });
});
