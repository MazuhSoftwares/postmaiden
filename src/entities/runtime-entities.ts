/**
 * Representation of each spec being put to exectution,
 * become concrete and not only a spec.
 */
export interface RuntimeState {
  /**
   * `"idle"` is waiting runtime didn't start yet.
   * `"running"` is request being performed right now.
   * `"success"` is request finished, responded with ok status.
   * `"unsuccess"` is request finished, responded with not ok status.
   * `"error"` for when the request didn't even reach the server.
   */
  readonly step: "idle" | "running" | "success" | "unsuccess" | "error";
  /** Observability of the actual performed request. With blank values while `step="idle"`. */
  readonly request: RequestSnapshot;
  /** Observability of the response. With blank values if there wasn't a server response yet. */
  readonly response: ResponseSnapshot;
  /** Any exception unrelated to the direct 1:1 request-response relation (see `step="error"`). */
  readonly errorMessage: string;
  /** Useful metadata for performance visibility. */
  readonly startedAt: number;
  /** Useful metadata for performance visibility. */
  readonly finishedAt: number;
}

/**
 * Applied final data used to make a real request run.
 *
 * However, due to browser policies, the actual request headers for example are not
 * fully acessible. There's no API available to preview what the browser itself intercepted.
 */
export interface RequestSnapshot {
  readonly url: string;
  readonly method: string;
  readonly body: string | null;
  readonly headers: { key: string; value: string }[];
}

/**
 * Response received by the server after a request.
 */
export interface ResponseSnapshot {
  readonly status: number;
  readonly body: string;
  readonly headers: { key: string; value: string }[];
}
