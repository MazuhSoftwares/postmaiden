import { makeOpfsAdapter } from "./origin-private-file-system";

describe("Origin private file system (OPFS) adapter", () => {
  beforeAll(() => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockImplementation(() => ({
          getFileHandle: jest.fn().mockImplementation(() => ({
            getFile: jest.fn().mockResolvedValue({
              text: jest
                .fn()
                .mockResolvedValue(
                  '{ "taste": "pepsicola", "surprise": false }'
                ),
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
