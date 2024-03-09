/**
 * Origin Private File System (OPFS) generic shim adapters.
 *
 * It's important for the rest of the application don't use OPFS directly,
 * because it's a very delicate API with limited compatibility and low
 * level details. So for all other components and services using
 * OPFS this must be the lowest level of abstraction.
 */

/** */
export interface OriginPrivateFileSystemFileAdapterOptions {
  filename: string;
  subdir?: string;
}

export interface OriginPrivateFileSystemFileAdapter<T> {
  retrieve: () => Promise<T | null>;
  persist: (data: T) => Promise<void>;
  remove: () => Promise<void>;
}

export function makeOpfsFileAdapterSingleton<T>(
  options: OriginPrivateFileSystemFileAdapterOptions
): () => Promise<OriginPrivateFileSystemFileAdapter<T>> {
  let opfsAdapter: OriginPrivateFileSystemFileAdapter<T>;

  return async () => {
    if (!opfsAdapter) {
      opfsAdapter = await makeOpfsFileAdapter<T>(options);
    }

    return opfsAdapter;
  };
}

export async function makeOpfsFileAdapter<T>({
  filename,
  subdir,
}: OriginPrivateFileSystemFileAdapterOptions): Promise<
  OriginPrivateFileSystemFileAdapter<T>
> {
  if (subdir && (subdir.includes("/") || subdir.includes("_"))) {
    throw new Error('Subdirectory cannot contain "/" or "_".');
  }

  const opfsRoot = await navigator.storage.getDirectory();

  const dirPath = subdir
    ? MAIN_OPFS_DIRECTORY + "__" + subdir
    : MAIN_OPFS_DIRECTORY;
  const directoryHandle = await opfsRoot.getDirectoryHandle(dirPath, {
    create: true,
  });
  const fileHandle = await directoryHandle.getFileHandle(filename, {
    create: true,
  });

  const retrieve = async (): Promise<T | null> => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text ? (JSON.parse(text) as T) : null;
  };

  const persist = async (data: T) => {
    const writableFileStream = await fileHandle.createWritable();
    try {
      await writableFileStream.write(JSON.stringify(data));
    } finally {
      await writableFileStream.close();
    }
  };

  const remove = async () => {
    return directoryHandle.removeEntry(filename);
  };

  return {
    retrieve,
    persist,
    remove,
  };
}

export interface OriginPrivateFileSystemDirAdapter {
  retrieveFilenames: () => Promise<string[]>;
  removeByFilename: (filename: string) => Promise<void>;
}

export interface OriginPrivateFileSystemDirAdapterOptions {
  subdir?: string;
}

export async function makeOpfsMainDirAdapter({
  subdir,
}: OriginPrivateFileSystemDirAdapterOptions): Promise<OriginPrivateFileSystemDirAdapter> {
  if (subdir && (subdir.includes("/") || subdir.includes("_"))) {
    throw new Error('Subdirectory cannot contain "/" or "_".');
  }

  const opfsRoot = await navigator.storage.getDirectory();

  const dirPath = subdir
    ? MAIN_OPFS_DIRECTORY + "__" + subdir
    : MAIN_OPFS_DIRECTORY;
  const directoryHandle = await opfsRoot.getDirectoryHandle(dirPath, {
    create: true,
  });

  const retrieveFilenames = async () => {
    // Typing workaround for: https://github.com/microsoft/TypeScript/issues/56360
    const dirEntriesIterator = (
      directoryHandle as unknown as {
        entries: () => AsyncIterableIterator<[string, FileSystemFileHandle]>;
      }
    ).entries();

    const filenames: string[] = [];
    for await (const [filename] of dirEntriesIterator) filenames.push(filename);
    return filenames;
  };

  const removeByFilename = async (filename: string) => {
    return directoryHandle.removeEntry(filename);
  };

  return {
    retrieveFilenames,
    removeByFilename,
  };
}

export function isPersistenceSupported(): boolean {
  return (
    typeof window.FileSystemFileHandle.prototype.createWritable === "function"
  );
}

export const MAIN_OPFS_DIRECTORY = "postmaiden.com";

if (["production", "development"].includes(process.env.NODE_ENV ?? "?")) {
  // expose internals, mostly just for fun.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (window as any).isPersistenceSupported = isPersistenceSupported;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (window as any).makeOpfsMainDirAdapter = makeOpfsMainDirAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (window as any).makeOpfsFileAdapter = makeOpfsFileAdapter;
}
