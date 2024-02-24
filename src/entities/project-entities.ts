/** Each project is like a "folder" to store multiple specs of requests. */
export interface Project {
  readonly uuid: string;
  readonly name: string;
  readonly sections: ProjectSection[];
  readonly specs: ProjectRequestSpec[];
}

/** TODO: to organize requests as "subfolders" in a project. */
export interface ProjectSection {
  readonly uuid: string;
  readonly name: string;
}

/** User specification of how its request looks like. */
export interface ProjectRequestSpec {
  readonly uuid: string;
  readonly url: string;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly headers: ProjectRequestSpecHeader[];
  readonly body: string;
}

/** Data structure of HTTP headers specified in a `ProjectRequestSpec`, can be toggled. */
export interface ProjectRequestSpecHeader {
  readonly key: string;
  readonly value: string;
  readonly isEnabled: boolean;
}
