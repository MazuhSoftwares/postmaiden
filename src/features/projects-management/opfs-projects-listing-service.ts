/**
 * Implements project listing service using the Origin Private File System.
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
    items: filenames.map((filename) => getListingItemFromFilename(filename)),
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
    specs: [],
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
  return removeProject(project.uuid);
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

  const item: ProjectListingItem = {
    uuid: updating.uuid,
    name: updating.name,
  };

  const listing = await retrieveProjectsListing();
  const found = listing.items.find((i) => i.uuid === item.uuid);
  if (!found) {
    throw new Error("Project being updated is stale.");
  }

  await persistProject({
    ...found,
    ...item,
    // TODO: this is erasing previous sections and requests.
    sections: [],
    specs: [],
  });

  await removeProjectListingItem(found);

  return item;
}

export const PROJECTS_OPFS_SUBDIRECTORY = "projects";
