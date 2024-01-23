export interface Project {
  uuid: string;
  name: string;
  sections: ProjectSection[];
  specs: ProjectRequestSpec[];
}

export interface ProjectSection {
  uuid: string;
  name: string;
}

export interface ProjectRequestSpec {
  uuid: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: ProjectRequestSpecHeader[];
  body: string;
}

export interface ProjectRequestSpecHeader {
  key: string;
  value: string;
  isEnabled: boolean;
}
