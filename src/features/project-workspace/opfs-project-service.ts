/**
 * Implements management of each single project using the Origin Private File System.
 */
import { v4 as uuidv4 } from "uuid";
import type {
  Project,
  ProjectRequestSpec,
  ProjectRequestSpecHeader,
} from "@/entities/management";
import { retrieveProject } from "./opfs-project-service";
import { persistProject } from "@/services/opfs-projects-shared-internals";
import debounce from "lodash.debounce";

export { retrieveProject } from "@/services/opfs-projects-shared-internals";

/** Params for `createRequestSpec` */
export interface CreateRequestSpecParams {
  projectUuid: Project["uuid"];
}

/**
 * Persist a new spec in the project.
 */
export async function createRequestSpec(
  params: CreateRequestSpecParams
): Promise<ProjectRequestSpec> {
  const creating: ProjectRequestSpec = {
    uuid: uuidv4(),
    url: "",
    method: "GET",
    headers: [...DEFAULT_REQUEST_SPEC_HEADERS],
    body: "",
  };

  const project = await retrieveProject(params.projectUuid);
  const updatedProject: Project = {
    ...project,
    specs: [...project.specs, creating],
  };
  await persistProject(updatedProject);

  return creating;
}

/** Params for `removeRequestSpec` */
export interface RemoveRequestSpecParams {
  projectUuid: Project["uuid"];
  removing: ProjectRequestSpec["uuid"];
}

/**
 * Remove a spec from the project.
 */
export async function removeRequestSpec(
  params: RemoveRequestSpecParams
): Promise<{ specUuid: ProjectRequestSpec["uuid"] }> {
  const project = await retrieveProject(params.projectUuid);
  const updatedProject: Project = {
    ...project,
    specs: project.specs.filter((spec) => spec.uuid !== params.removing),
  };
  await persistProject(updatedProject);

  return { specUuid: params.removing };
}

/** Params for `patchRequestSpec` */
export interface PatchRequestSpecParams {
  projectUuid: Project["uuid"];
  patching: Partial<ProjectRequestSpec>;
}

/**
 * Update a spec in the project.
 *
 * Debounced.
 */
export const patchRequestSpec = debounce(doPatchRequestSpec, 300);

async function doPatchRequestSpec(
  params: PatchRequestSpecParams
): Promise<ProjectRequestSpec> {
  const project = await retrieveProject(params.projectUuid);
  const updatedProject: Project = {
    ...project,
    specs: project.specs.map((existing) =>
      existing.uuid === params.patching.uuid
        ? { ...existing, ...params.patching }
        : existing
    ),
  };
  await persistProject(updatedProject);

  return params.patching as ProjectRequestSpec;
}

const DEFAULT_REQUEST_SPEC_HEADERS: readonly ProjectRequestSpecHeader[] = [
  { key: "Content-Type", value: "application/json", isEnabled: false },
  { key: "Accept", value: "application/json", isEnabled: true },
];
