export interface RequestInfo {
  readonly url: string;
  readonly method: string;
  readonly body: string;
  readonly headers: { [key: string]: string };
}

export interface ResponseInfo {
  readonly status: number;
  readonly body: string;
  readonly headers: { [key: string]: string };
}
