export interface Project {
  uuid: string;
  name: string;
  sections: ProjectSection[];
  requests: RequestEntry[];
}

export interface ProjectSection {
  uuid: string;
  name: string;
}

export interface RequestEntry {
  uuid: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: HeaderEntry[];
  body: string;
}

export interface HeaderEntry {
  key: string;
  value: string;
  isEnabled: boolean;
}
