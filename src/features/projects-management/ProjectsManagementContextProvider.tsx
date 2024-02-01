/**
 * Manages the project listing.
 *
 * HOC to build and inject stateful functions into components through Context.
 */
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  persistNewProjectListingItem,
  removeProjectListingItem,
  retrieveProjectsListing,
  updateProjectListingItem,
} from "./opfs-projects-listing-service";
import { ProjectListingItem } from "./projects-management-entities";
import {
  ProjectsManagementContext,
  ProjectsManagementContextValue,
} from "./ProjectsManagementContext";

export function ProjectsManagementContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setProjects] = useState<ProjectListingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setError] = useState<Error | null>(null);

  const loadProjectsListing = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    retrieveProjectsListing()
      .then((projects) => setProjects(projects.items))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadProjectsListing();
  }, [loadProjectsListing]);

  const create: ProjectsManagementContextValue["create"] = useCallback(
    async ({ name }) => {
      setError(null);
      setIsLoading(true);
      return persistNewProjectListingItem(name)
        .then((created: ProjectListingItem) => {
          loadProjectsListing();
          return created;
        })
        .catch((error) => {
          setError(error);
          return null;
        })
        .finally(() => setIsLoading(false));
    },
    [loadProjectsListing]
  );

  const remove: ProjectsManagementContextValue["remove"] = useCallback(
    async (removing: ProjectListingItem) => {
      setError(null);
      setIsLoading(true);
      removeProjectListingItem(removing)
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false))
        .then(() => loadProjectsListing());
    },
    [loadProjectsListing]
  );

  const update: ProjectsManagementContextValue["update"] = useCallback(
    async (updating: ProjectListingItem) => {
      setError(null);
      setIsLoading(true);
      updateProjectListingItem(updating)
        .catch((error) => setError(error))
        .finally(() => setIsLoading(false))
        .then(() => loadProjectsListing());
    },
    [loadProjectsListing]
  );

  return (
    <ProjectsManagementContext.Provider
      value={{ items, isLoading, isError, create, update, remove }}
    >
      {children}
    </ProjectsManagementContext.Provider>
  );
}
