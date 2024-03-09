import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  persistClientSessionUuid,
  retrieveClientSessionUuid,
} from "../services/opfs-client-session";
import { isPersistenceSupported } from "../services/origin-private-file-system";

interface UseClientSessionResult {
  isActive: boolean;
  doActiveThisSession: () => void;
  isOfflineModeSupported: boolean;
}

/**
 * Manage client session, assuring that only one per tab is active,
 * so it doesn't have to handle conflicts for Private File System access.
 */
export function useClientSession(): UseClientSessionResult {
  const isOfflineModeSupported = isPersistenceSupported();

  const [isActive, setActive] = useState(isOfflineModeSupported);
  const thisUuidRef = useRef("");

  const doActiveThisSession = useCallback(() => {
    const thisUuid = thisUuidRef.current || uuidv4();
    thisUuidRef.current = thisUuid;
    persistClientSessionUuid(thisUuid).catch(console.error);
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
    isOfflineModeSupported,
  };
}
