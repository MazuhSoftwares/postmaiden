import { validate as validateUuid } from "uuid";
import {
  OriginPrivateFileSystemAdapter,
  makeOpfsAdapter,
} from "./origin-private-file-system";

let opfs: OriginPrivateFileSystemAdapter<string>;
const getOpfsAdapter = async (): Promise<
  OriginPrivateFileSystemAdapter<string>
> => {
  if (!opfs) {
    opfs = await makeOpfsAdapter<string>("client-session.txt");
  }

  return opfs;
};

export async function retrieveClientSessionUuid(): Promise<string> {
  const opfs = await getOpfsAdapter();
  const uuid = await opfs.retrieve();
  return uuid && validateUuid(uuid) ? uuid : "";
}

export async function persistClientSessionUuid(uuid: string): Promise<void> {
  if (!uuid || !validateUuid(uuid)) {
    throw new Error("Invalid client session uuid.");
  }

  const opfs = await getOpfsAdapter();
  await opfs.persist(uuid);
}
