export interface RuntimeState {
  readonly step: "idle" | "running" | "success" | "unsuccess" | "error";
  readonly text: string;
  readonly status: number;
  readonly startedAt: number;
  readonly finishedAt: number;
}

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
