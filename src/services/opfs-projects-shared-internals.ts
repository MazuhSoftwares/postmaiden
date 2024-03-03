/**
 * A shared kernel serving as dependency for two or more OPFS services
 * from difference project features.
 *
 * Avoid using this directly on UI, prefer contextual service adapters.
 */
import { v4 as uuidv4 } from "uuid";
import {
  makeOpfsFileAdapter,
  makeOpfsMainDirAdapter,
} from "./origin-private-file-system";
import {
  Project,
  ProjectRequestSpec,
  ProjectRequestSpecHeader,
} from "@/entities/project-entities";

/**
 * Retrieve a project from the private file system based on its UUID.
 */
export async function retrieveProject(uuid: Project["uuid"]): Promise<Project> {
  const filename = await retrieveProjectFilenameByUuid(uuid);

  const file = await makeOpfsFileAdapter<Project>({
    filename,
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });

  const content = await file.retrieve();
  if (!content) {
    throw new Error(`Project file content not found: ${uuid}`);
  }

  return content;
}

/**
 * Persist a file in the projects private directory,
 * its filename will be created/found based on the combination
 * of its UUID and name.
 */
export async function persistProject(project: Project): Promise<void> {
  const file = await makeOpfsFileAdapter<Project>({
    filename: getProjectFilename(project),
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });

  await file.persist(project);
}

/**
 * Remove a file from the projects private directory, thus
 * destroying permanently the project, based only
 * on its UUID.
 *
 * PS: the filename to be deleted is a combination of the UUID and name,
 * to prevent any possible collision (sometimes, during renaming, there
 * might be two files having the same UUID).
 */
export async function removeProject(
  item: Pick<Project, "uuid" | "name">
): Promise<{ uuid: string }> {
  const file = await makeOpfsFileAdapter<never>({
    filename: getProjectFilename(item),
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });

  await file.remove();

  return { uuid: item.uuid };
}

/**
 * Retrieve all raw filenames from the projects private directory.
 */
export async function retrieveProjectsFilenames(): Promise<string[]> {
  const opfsDir = await makeOpfsMainDirAdapter({
    subdir: PROJECTS_OPFS_SUBDIRECTORY,
  });
  const filenames = await opfsDir.retrieveFilenames();
  return filenames;
}

/**
 * Return what should be the current filename of a project.
 *
 * No side effects here, there's no query on file system.
 */
export function getProjectFilename(
  item: Pick<Project, "uuid" | "name">
): string {
  return `${item.uuid}_${hygienizeProjectName(item.name)}.json`;
}

/**
 * Build a project listing item based only on the filename.
 * Each project filename is actually the whole listing item.
 *
 * No side effects here, there's no query on file system.
 */
export function getListingItemFromFilename(
  filename: string
): Pick<Project, "uuid" | "name"> | null {
  const rFilename =
    /^(?<uuid>[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})_(?<name>.*)\.json$/;
  const match = filename.match(rFilename);
  if (!match || !match.groups) {
    console.error(`Invalid project filename (corrupted data?): ${filename}`);
    return null;
  }

  return {
    uuid: match.groups.uuid,
    name: match.groups.name,
  };
}

/**
 * The private subdirectory where all projects are stored.
 */
export const PROJECTS_OPFS_SUBDIRECTORY = "projects";

/** In memory instance of a new request spec. */
export function makeDefaultRequestSpec(): ProjectRequestSpec {
  return {
    uuid: uuidv4(),
    url: "",
    method: "GET",
    headers: [...DEFAULT_REQUEST_SPEC_HEADERS],
    body: "",
  };
}

const DEFAULT_REQUEST_SPEC_HEADERS: readonly ProjectRequestSpecHeader[] = [
  { key: "Content-Type", value: "application/json", isEnabled: false },
  { key: "Accept", value: "application/json", isEnabled: true },
];

function hygienizeProjectName(name: string): string {
  return (
    name
      // just avoiding confusing/ugly trailing spaces:
      .trim()
      // possibly offends our regex of listing retrieval:
      .replaceAll(/.json$/gi, "")
      // possibly offends our regex of listing retrieval:
      .replaceAll('"', "")
      // throws error on OPFS:
      .replaceAll("/", " ")
  );
}

async function retrieveProjectFilenameByUuid(uuid: string): Promise<string> {
  const allFilenames = await retrieveProjectsFilenames();
  const filename = allFilenames.find(
    (filename) => getListingItemFromFilename(filename)?.uuid === uuid
  );

  if (!filename) {
    throw new Error(`Project filename not found: ${uuid}`);
  }

  return filename;
}
