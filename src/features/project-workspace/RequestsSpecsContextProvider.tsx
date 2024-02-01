/**
 * Manages the project specs.
 *
 * HOC to build and inject stateful functions into components through Context.
 */
import { ReactNode, useCallback, useEffect, useState } from "react";
import tap from "lodash/tap";
import { ProjectRequestSpec } from "@/entities/management";
import {
  retrieveProject,
  createRequestSpec,
  patchRequestSpec,
  removeRequestSpec,
} from "./opfs-project-service";
import {
  RequestsSpecsContext,
  RequestsSpecsContextValue,
} from "./RequestsSpecsContext";

export function RequestsSpecsContextProvider({
  children,
  projectUuid,
}: {
  children: ReactNode;
  projectUuid: string;
}) {
  const [projectName, setProjectName] = useState<string>("");
  const [specs, setSpecs] = useState<ProjectRequestSpec[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setError] = useState<Error | null>(null);

  const loadProject = useCallback(async () => {
    setError(null);
    retrieveProject(projectUuid)
      .then((project) => tap(project, (p) => setProjectName(p.name)))
      .then((project) => tap(project, (p) => setSpecs(p.specs)))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [projectUuid]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const create: RequestsSpecsContextValue["create"] = useCallback(async () => {
    setError(null);
    return createRequestSpec({ projectUuid })
      .then((created) => tap(created, () => loadProject()))
      .catch((error) => tap(null, () => setError(error)));
  }, [projectUuid, loadProject]);

  const patch: RequestsSpecsContextValue["patch"] = useCallback(
    async (patching) => {
      setError(null);
      return patchRequestSpec({ projectUuid, patching })
        .then(() => tap(null, () => loadProject()))
        .catch((error) => tap(null, () => setError(error)));
    },
    [projectUuid, loadProject]
  );

  const remove: RequestsSpecsContextValue["remove"] = useCallback(
    async (removing) => {
      setError(null);
      setIsLoading(true);
      return removeRequestSpec({ projectUuid, removing: removing.uuid })
        .then(() => tap(null, () => loadProject()))
        .catch((error) => tap(null, () => setError(error)));
    },
    [projectUuid, loadProject]
  );

  return (
    <RequestsSpecsContext.Provider
      value={{
        projectUuid,
        projectName,
        specs,
        create,
        patch,
        remove,
        isLoading,
        isError,
      }}
    >
      {children}
    </RequestsSpecsContext.Provider>
  );
}
