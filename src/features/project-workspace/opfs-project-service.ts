/**
 * Implements management of each single project using the Origin Private File System.
 *
 * For managing the listing and names of projects,
 * see `src/features/projects-management/opfs-projects-listing-service.ts`.
 *
 * And to prevent circular dependencies, there's also a kernel module,
 * see: `src/services/opfs-projects-shared-internals.ts`
 */
import type { Project, ProjectRequestSpec } from "@/entities/project-entities";
import {
  makeDefaultRequestSpec,
  persistProject,
} from "@/services/opfs-projects-shared-internals";
import { retrieveProject } from "./opfs-project-service";

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
  const creating: ProjectRequestSpec = makeDefaultRequestSpec();

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
 * Patchs a spec in the project. Omitted keys will
 * be preserve its original value.
 */
export async function patchRequestSpec(
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

  const updatedSpec = updatedProject.specs.find(
    (spec) => spec.uuid === params.patching.uuid
  );
  if (!updatedSpec) {
    throw new Error("Request spec not found when patching.");
  }

  return updatedSpec;
}
