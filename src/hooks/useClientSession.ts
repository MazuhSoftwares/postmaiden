import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

interface UseClientSessionResult {
  isActive: boolean;
  doActiveThisSession: () => void;
}

export default function useClientSession(): UseClientSessionResult {
  const [isActive, setActive] = useState(true);
  const thisUuidRef = useRef("");

  const doActiveThisSession = useCallback(() => {
    const thisUuid = thisUuidRef.current || uuidv4();
    thisUuidRef.current = thisUuid;
    persistClientSessionUuid(thisUuid);
    setActive(true);
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const checkClientSession = async () => {
      const retrieved = await retrieveClientSessionUuid();
      if (retrieved !== thisUuidRef.current) {
        setActive(false);
      }

      listenerTimer = scheduleChecker();
    };
    const scheduleChecker = () => setTimeout(checkClientSession, 1000);

    let listenerTimer = scheduleChecker();
    return () => clearTimeout(listenerTimer);
  }, [isActive]);

  return {
    isActive,
    doActiveThisSession,
  };
}

async function retrieveClientSessionUuid(): Promise<string> {
  const opfsRoot = await navigator.storage.getDirectory();

  const fileHandle = await opfsRoot.getFileHandle("client-session.txt", {
    create: true,
  });
  const file = await fileHandle.getFile();
  const text = (await file.text()) || "";
  return text.length && validateUuid(text) ? text : "";
}

async function persistClientSessionUuid(uuid: string): Promise<void> {
  if (!uuid || !validateUuid(uuid)) {
    throw new Error("Invalid client session uuid.");
  }

  const opfsRoot = await navigator.storage.getDirectory();

  const fileHandle = await opfsRoot.getFileHandle("client-session.txt", {
    create: true,
  });
  const writableFileStream = await fileHandle.createWritable();
  await writableFileStream.write(uuid);

  await writableFileStream.close();
}
