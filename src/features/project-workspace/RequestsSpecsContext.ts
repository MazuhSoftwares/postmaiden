/**
 * Basic definitions for `RequestsSpecsContextProvider` and its access hook.
 */
import { ProjectRequestSpec } from "@/entities/project-entities";
import { createContext, useContext } from "react";

export interface RequestsSpecsContextValue {
  projectName: string;
  projectUuid: string;
  specs: ProjectRequestSpec[];
  create: () => Promise<ProjectRequestSpec | null>;
  patch: (
    patching: Partial<ProjectRequestSpec>
  ) => Promise<ProjectRequestSpec | null>;
  remove: (
    removing: ProjectRequestSpec
  ) => Promise<{ uuid: ProjectRequestSpec["uuid"] } | null>;
  isLoading: boolean;
  isError: Error | null;
}

export const RequestsSpecsContext =
  createContext<RequestsSpecsContextValue | null>(null);

export function useRequestsSpecs(): RequestsSpecsContextValue {
  const contextValue = useContext(RequestsSpecsContext);
  if (contextValue === null) {
    throw new Error("Hook used outside its context.");
  }

  return contextValue;
}
