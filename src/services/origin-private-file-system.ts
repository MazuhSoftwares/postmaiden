export interface OriginPrivateFileSystemAdapter<T> {
  retrieve: () => Promise<T | null>;
  persist: (data: T) => Promise<void>;
}

export async function makeOpfsAdapter<T>(
  filename: string
): Promise<OriginPrivateFileSystemAdapter<T>> {
  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(filename, {
    create: true,
  });

  const retrieve = async (): Promise<T | null> => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text ? JSON.parse(text) : null;
  };

  const persist = async (data: T) => {
    const writableFileStream = await fileHandle.createWritable();
    try {
      await writableFileStream.write(JSON.stringify(data));
    } finally {
      await writableFileStream.close();
    }
  };

  return {
    retrieve,
    persist,
  };
}
