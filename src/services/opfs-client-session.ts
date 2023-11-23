import { validate as validateUuid } from "uuid";
import { makeOpfsAdapterSingleton } from "./origin-private-file-system";

const getOpfsAdapter = makeOpfsAdapterSingleton<string>("client-session.txt");

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
