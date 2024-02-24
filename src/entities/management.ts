export interface Project {
  readonly uuid: string;
  readonly name: string;
  readonly sections: ProjectSection[];
  readonly specs: ProjectRequestSpec[];
}

export interface ProjectSection {
  readonly uuid: string;
  readonly name: string;
}

export interface ProjectRequestSpec {
  readonly uuid: string;
  readonly url: string;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly headers: ProjectRequestSpecHeader[];
  readonly body: string;
}

export interface ProjectRequestSpecHeader {
  readonly key: string;
  readonly value: string;
  readonly isEnabled: boolean;
}
