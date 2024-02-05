import {
  isPersistenceSupported,
  makeOpfsFileAdapterSingleton,
  makeOpfsMainDirAdapter,
} from "./origin-private-file-system";

describe("Origin private file system (OPFS) adapter", () => {
  beforeAll(() => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: jest.fn().mockResolvedValue({
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
            }),
            entries: jest.fn().mockReturnValue([]),
            removeEntry: jest.fn(),
          }),
        }),
      },
      writable: true,
    });
  });

  it("can generate specific singletons (for more pragmatic usage)", async () => {
    const getOpfsAdapter = makeOpfsFileAdapterSingleton<string>({
      filename: "something-in-the-way.txt",
    });
    const opfs1 = await getOpfsAdapter();
    const opfs2 = await getOpfsAdapter();
    expect(opfs1).toBe(opfs2);
  });

  it("necessarily means that two different specific singletons are indeed different references", async () => {
    const getOpfsAdapter1 = makeOpfsFileAdapterSingleton<string>({
      filename: "the-man-who-sold-the-world.txt",
    });
    const opfs1 = await getOpfsAdapter1();

    const getOpfsAdapter2 = makeOpfsFileAdapterSingleton<string>({
      filename: "i-never-lost-control.txt",
    });
    const opfs2 = await getOpfsAdapter2();

    expect(opfs1).not.toBe(opfs2);
  });

  it("integrates with real OPFS to retrieve parsed JSON content", async () => {
    const getFileHandleMock = jest.fn().mockResolvedValue({
      getFile: jest.fn().mockResolvedValue({
        text: jest
          .fn()
          .mockResolvedValue('{ "taste": "pepsicola", "surprise": false }'),
      }),
    });

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: getFileHandleMock,
          }),
        }),
      },
      writable: true,
    });

    const getOpfsAdapter = makeOpfsFileAdapterSingleton<{
      taste: string;
      surprise: boolean;
    }>({ filename: "lana.json" });
    const opfs = await getOpfsAdapter();
    const retrieved = await opfs.retrieve();
    expect(retrieved).toEqual({ taste: "pepsicola", surprise: false });

    expect(getFileHandleMock).toHaveBeenCalledWith("lana.json", {
      create: true,
    });
  });

  it("retrieves null if there is no content on a given file", async () => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: jest.fn().mockResolvedValue({
              getFile: jest.fn().mockResolvedValue({
                text: jest.fn().mockResolvedValue(""),
              }),
            }),
          }),
        }),
      },
      writable: true,
    });

    const getOpfsAdapter = makeOpfsFileAdapterSingleton<{
      taste: string;
      surprise: boolean;
    }>({ filename: "lana_banana.json" });
    const opfs = await getOpfsAdapter();
    const retrieved = await opfs.retrieve();
    expect(retrieved).toEqual(null);
  });

  it("integrates with real OPFS to persist JSON content", async () => {
    const writeMock = jest.fn();
    const closeMock = jest.fn();
    const getFileHandleMock = jest.fn().mockResolvedValue({
      createWritable: jest.fn().mockResolvedValue({
        write: writeMock,
        close: closeMock,
      }),
    });

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: getFileHandleMock,
          }),
        }),
      },
      writable: true,
    });

    const getOpfsAdapter = makeOpfsFileAdapterSingleton<{
      handsOn: string;
      nameOn: string;
    }>({ filename: "delrey.json" });
    const opfs = await getOpfsAdapter();
    await opfs.persist({ handsOn: "hips", nameOn: "lips" });

    expect(getFileHandleMock).toHaveBeenCalledWith("delrey.json", {
      create: true,
    });
    expect(writeMock).toHaveBeenCalledWith(
      '{"handsOn":"hips","nameOn":"lips"}'
    );
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("closes the writable even if an error is throwed in the writing side effect", async () => {
    const writeMock = jest.fn().mockRejectedValue(new Error("Writing error!"));
    const closeMock = jest.fn();
    const getFileHandleMock = jest.fn().mockResolvedValue({
      createWritable: jest.fn().mockResolvedValue({
        write: writeMock,
        close: closeMock,
      }),
    });

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: getFileHandleMock,
          }),
        }),
      },
      writable: true,
    });

    const getOpfsAdapter = makeOpfsFileAdapterSingleton<{
      handsOn: string;
      nameOn: string;
    }>({ filename: "delrey.json" });
    const opfs = await getOpfsAdapter();

    await expect(() =>
      opfs.persist({ handsOn: "hips", nameOn: "lips" })
    ).rejects.toEqual(new Error("Writing error!"));

    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("integrates with real OPFS to remove the file", async () => {
    const removeEntryMock = jest.fn().mockResolvedValue(null);

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            getFileHandle: jest.fn().mockResolvedValue({}),
            removeEntry: removeEntryMock,
          }),
        }),
      },
      writable: true,
    });

    const getOpfsAdapter = makeOpfsFileAdapterSingleton<never>({
      filename: "Chemtrails Over The Country Club.json",
    });
    const opfs = await getOpfsAdapter();
    await opfs.remove();

    expect(removeEntryMock).toHaveBeenCalledTimes(1);
    expect(removeEntryMock).toHaveBeenCalledWith(
      "Chemtrails Over The Country Club.json"
    );
  });

  it("integrates with real OPFS to retrieve filenames from a sub diretory", async () => {
    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            entries: jest.fn().mockReturnValue([
              [
                "ef9edef0-93c1-4097-97d7-450efb8929d3_Carmen.json",
                { mocked: "handler", wadda: "wadda" },
              ],
              [
                "ef9edef0-93c1-4097-97d7-450efb8929d3_Let me love you like a woman.json",
                { mocked: "handler", wadda: "wadda" },
              ],
            ]),
          }),
        }),
      },
      writable: true,
    });

    const opfsDir = await makeOpfsMainDirAdapter({ subdir: "songs" });
    const filenames = await opfsDir.retrieveFilenames();
    expect(filenames).toEqual([
      "ef9edef0-93c1-4097-97d7-450efb8929d3_Carmen.json",
      "ef9edef0-93c1-4097-97d7-450efb8929d3_Let me love you like a woman.json",
    ]);
  });

  it("integrates with real OPFS to remove entry of filenames", async () => {
    const removeEntryMock = jest.fn().mockResolvedValue(null);

    Object.defineProperty(global.navigator, "storage", {
      value: {
        getDirectory: jest.fn().mockResolvedValue({
          getDirectoryHandle: jest.fn().mockResolvedValue({
            entries: jest.fn().mockReturnValue([]),
            removeEntry: removeEntryMock,
          }),
        }),
      },
      writable: true,
    });

    const opfsDir = await makeOpfsMainDirAdapter({ subdir: "songs" });
    await opfsDir.removeByFilename(
      "ef9edef0-93c1-4097-97d7-450efb8929d3_Carmen.json"
    );

    expect(removeEntryMock).toHaveBeenCalledTimes(1);
    expect(removeEntryMock).toHaveBeenCalledWith(
      "ef9edef0-93c1-4097-97d7-450efb8929d3_Carmen.json"
    );
  });

  it("can confirm full support for the offline persistence", () => {
    Object.defineProperty(window, "FileSystemFileHandle", {
      value: {
        prototype: {
          createWritable: () => {},
        },
      },
      writable: true,
    });

    expect(isPersistenceSupported()).toBe(true);
  });

  it("can detect lack of full support for the offline persistence: writable async", () => {
    Object.defineProperty(window, "FileSystemFileHandle", {
      value: {
        prototype: {},
      },
      writable: true,
    });

    expect(isPersistenceSupported()).toBe(false);
  });
});
