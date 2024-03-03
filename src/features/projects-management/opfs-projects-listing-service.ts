/**
 * Implements project listing service using the Origin Private File System.
 *
 * For managing the content of each project internal data,
 * see `src/features/project-workspace/opfs-project-service.ts`.
 *
 * And to prevent circular dependencies, there's also a kernel module,
 * see: `src/services/opfs-projects-shared-internals.ts`
 */
import { v4 as uuidv4 } from "uuid";
import { makeOpfsMainDirAdapter } from "../../services/origin-private-file-system";
import {
  ProjectListing,
  ProjectListingItem,
} from "./projects-management-entities";
import {
  persistProject,
  getListingItemFromFilename,
  removeProject,
  retrieveProject,
  makeDefaultRequestSpec,
} from "@/services/opfs-projects-shared-internals";

/**
 * Based on stored filenames in the projects private directory,
 * generates a list of specs.
 *
 * Each entry, because of such shallow approach, is more like a "pointer",
 * the full data regarding the project is inside the file and must be handled
 * by a different service.
 */
export async function retrieveProjectsListing(): Promise<ProjectListing> {
  const opfsDir = await makeOpfsMainDirAdapter({
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });
  const filenames = await opfsDir.retrieveFilenames();
  return {
    items: filenames
      .reduce(
        (acc, filename) => [...acc, getListingItemFromFilename(filename)],
        [] as (ProjectListingItem | null)[]
      )
      .filter((it) => it !== null) as ProjectListingItem[],
  };
}

/**
 * Insert a new file in the projects private directory.
 */
export async function persistNewProjectListingItem(
  name: string
): Promise<ProjectListingItem> {
  if (!name) {
    throw new Error("Project name cannot be empty.");
  }

  const item: ProjectListingItem = {
    uuid: uuidv4(),
    name: name,
  };

  await persistProject({
    uuid: item.uuid,
    name: item.name,
    sections: [],
    specs: [makeDefaultRequestSpec()],
  });

  return item;
}

/**
 * Remove a file from the projects private directory, thus
 * destroying permanently the project.
 */
export async function removeProjectListingItem(
  project: ProjectListingItem
): Promise<{ uuid: string }> {
  return removeProject(project);
}

/**
 * Given an `updating` project, based on its uuid, creates a copy of it
 * and then destroys the original.
 *
 * Any data is also overridden, so this
 * is not simply a "patch" but indeed a replacement.
 */
export async function updateProjectListingItem(
  updating: ProjectListingItem
): Promise<ProjectListingItem> {
  if (!updating.uuid) {
    throw new Error("Project uuid cannot be empty for update.");
  }

  if (!updating.name) {
    throw new Error("Project name cannot be empty.");
  }

  const existing = await retrieveProject(updating.uuid);
  if (!existing) {
    throw new Error("Project being updated might be stale.");
  }

  const updated = {
    ...existing,
    ...updating,
  };
  await persistProject(updated);

  await removeProjectListingItem(existing);

  return updated;
}

export const PROJECTS_OPFS_SUBDIRECTORY = "projects";
