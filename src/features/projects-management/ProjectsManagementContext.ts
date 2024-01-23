/**
 * Basic definitions for `ProjectsManagementContextProvider` and its access hook.
 */
import { createContext, useContext } from "react";
import { ProjectListingItem } from "./projects-management-entities";

export interface ProjectsManagementContextValue {
  items: ProjectListingItem[];
  create: (creating: Pick<ProjectListingItem, "name">) => Promise<void>;
  update: (updating: ProjectListingItem) => Promise<void>;
  remove: (removing: ProjectListingItem) => Promise<void>;
  isLoading: boolean;
  isError: Error | null;
}

export const ProjectsManagementContext =
  createContext<ProjectsManagementContextValue | null>(null);

export function useProjectsManagement(): ProjectsManagementContextValue {
  const contextValue = useContext(ProjectsManagementContext);
  if (contextValue === null) {
    throw new Error("Hook used outside its context.");
  }

  return contextValue;
}
