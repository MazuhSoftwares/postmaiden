export interface RequestInfo {
  url: string;
  method: string;
  body: string;
  headers: { [key: string]: string };
}

export interface ResponseInfo {
  status: number;
  body: string;
  headers: { [key: string]: string };
}
