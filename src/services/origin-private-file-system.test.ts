import { getOriginPrivateDirectory } from "native-file-system-adapter";
import { makeOpfsAdapter } from "./origin-private-file-system";

jest.mock("native-file-system-adapter", () => ({
  getOriginPrivateDirectory: jest.fn(),
}));

describe("Origin private file system (OPFS) adapter", () => {
  beforeAll(() => {
    const getDirectoryMock = jest.fn().mockImplementation(() => ({
      getFileHandle: jest.fn().mockImplementation(() => ({
        getFile: jest.fn().mockResolvedValue({
          text: jest
            .fn()
            .mockResolvedValue('{ "taste": "pepsicola", "surprise": false }'),
        }),
        createWritable: jest.fn().mockResolvedValue({
          write: jest.fn(),
          close: jest.fn(),
        }),
      })),
    }));

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: getDirectoryMock,
      },
      writable: true,
    });

    // if the polyfill gets removed, this line below must be removed too and that's it.
    (getOriginPrivateDirectory as jest.Mock).mockImplementation(() =>
      global.navigator.storage.getDirectory()
    );
  });

  it("Integrates with real OPFS to retrieve parsed JSON content", async () => {
    const getFileHandleMock = jest.fn().mockImplementation(() => ({
      getFile: jest.fn().mockResolvedValue({
        text: jest
          .fn()
          .mockResolvedValue('{ "taste": "pepsicola", "surprise": false }'),
      }),
    }));

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockImplementation(() => ({
          getFileHandle: getFileHandleMock,
        })),
      },
      writable: true,
    });

    const opfs = await makeOpfsAdapter<{ taste: string; surprise: boolean }>(
      "lana.json"
    );
    const retrieved = await opfs.retrieve();
    expect(retrieved).toEqual({ taste: "pepsicola", surprise: false });

    expect(getFileHandleMock).toHaveBeenCalledWith("lana.json", {
      create: true,
    });
  });

  it("Integrates with real OPFS to persist JSON content", async () => {
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    const getFileHandleMock = jest.fn().mockImplementation(() => ({
      createWritable: jest.fn().mockResolvedValue({
        write: writeMock,
        close: closeMock,
      }),
    }));

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockImplementation(() => ({
          getFileHandle: getFileHandleMock,
        })),
      },
      writable: true,
    });

    const opfs = await makeOpfsAdapter<{ handsOn: string; nameOn: string }>(
      "lana.json"
    );
    await opfs.persist({ handsOn: "hips", nameOn: "lips" });

    expect(getFileHandleMock).toHaveBeenCalledWith("lana.json", {
      create: true,
    });
    expect(writeMock).toHaveBeenCalledWith(
      '{"handsOn":"hips","nameOn":"lips"}'
    );
    expect(closeMock).toHaveBeenCalled();
  });
});
