export interface Project {
  uuid: string;
  name: string;
  sections: ProjectSection[];
  requests: ProjectRequest[];
}

export interface ProjectSection {
  uuid: string;
  name: string;
}

export interface ProjectRequest {
  uuid: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: ProjectRequestHeader[];
  body: string;
}

export interface ProjectRequestHeader {
  key: string;
  value: string;
  isEnabled: boolean;
}
