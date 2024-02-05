import { retrieveProject } from "./opfs-project-service";
import * as opfsAdapters from "../../services/origin-private-file-system";

jest.mock("../../services/origin-private-file-system");

describe("OPFS project service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("project retrieval is integrated with the most primitive OPFS service module", async () => {
    (opfsAdapters.makeOpfsMainDirAdapter as jest.Mock).mockResolvedValueOnce({
      retrieveFilenames: jest
        .fn()
        .mockResolvedValue([
          "82184240-6b29-4ae8-82f5-fbe7d1bb814a_MyAPI.json",
          "e5ae94f4-2c32-4129-a2b1-cdf2c4c770dc_Biohazard API.json",
        ]),
    });

    (opfsAdapters.makeOpfsFileAdapter as jest.Mock).mockImplementationOnce(
      (options: { filename: string }) => {
        if (
          !options.filename.startsWith("e5ae94f4-2c32-4129-a2b1-cdf2c4c770dc")
        ) {
          throw new Error("Unexpected test case.");
        }

        return {
          retrieve: jest.fn().mockImplementation(async () => {
            return {
              uuid: "e5ae94f4-2c32-4129-a2b1-cdf2c4c770dc",
              name: "Biohazard API",
              mocked: "content",
            };
          }),
        };
      }
    );

    const content = await retrieveProject(
      "e5ae94f4-2c32-4129-a2b1-cdf2c4c770dc"
    );
    expect(content).toEqual({
      uuid: "e5ae94f4-2c32-4129-a2b1-cdf2c4c770dc",
      name: "Biohazard API",
      mocked: "content",
    });
  });
});
