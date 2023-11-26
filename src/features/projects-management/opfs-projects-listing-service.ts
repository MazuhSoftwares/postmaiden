import { v4 as uuidv4 } from "uuid";
import { Project } from "../../entities/management";
import {
  makeOpfsFileAdapter,
  makeOpfsMainDirAdapter,
} from "../../services/origin-private-file-system";
import {
  ProjectListing,
  ProjectListingItem,
} from "./projects-management-entities";

export async function retrieveProjectsListing(): Promise<ProjectListing> {
  const opfsDir = await makeOpfsMainDirAdapter({
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });
  const filenames = await opfsDir.retrieveFilenames();
  return {
    items: filenames.map((filename) => {
      const rFilename =
        /(?<uuid>[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})_(?<name>[A-Za-z ]+)\.json/;
      const match = filename.match(rFilename);
      if (!match || !match.groups) {
        throw new Error(
          `Invalid project filename (corrupted data?): ${filename}`
        );
      }

      return {
        uuid: match.groups.uuid,
        name: match.groups.name,
      };
    }),
  };
}

export async function persistNewProjectListingItem(
  name: string
): Promise<ProjectListingItem> {
  if (!name) {
    throw new Error("Project name cannot be empty.");
  }

  const item: ProjectListingItem = {
    uuid: uuidv4(),
    name: name.trim().replace(".json", ""),
  };

  const file = await makeOpfsFileAdapter<Project>({
    filename: `${item.uuid}_${item.name}.json`,
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });
  await file.persist({
    uuid: item.uuid,
    name: item.name,
    sections: [],
    requests: [],
  });

  return item;
}

export const PROJECTS_OPFS_SUBDIRECTORY = "projects";
