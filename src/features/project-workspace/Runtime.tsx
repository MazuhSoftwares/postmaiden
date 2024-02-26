import { useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { ProjectRequestSpec } from "@/entities/project-entities";
import {
  RequestSnapshot,
  ResponseSnapshot,
  RuntimeState,
} from "@/entities/runtime-entities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { useRequestsSpecs } from "./RequestsSpecsContext";

export interface RuntimeProps {
  specUuid: ProjectRequestSpec["uuid"];
}

export function Runtime(props: RuntimeProps) {
  const { specs, patch } = useRequestsSpecs();
  const spec = specs.find((s) => s.uuid === props.specUuid) || null;

  const patchUrlUnsafelly = (patching: { uuid: string; url: string }) => {
    patch(patching);
  };

  const patchUrlRef = useRef<typeof patchUrlUnsafelly>(
    debounce(patchUrlUnsafelly, 500)
  );
  const patchUrl = patchUrlRef.current;

  const handleUrlValueChange = (event: React.FormEvent) => {
    const url = (event.target as HTMLInputElement).value;
    patchUrl({ uuid: spec!.uuid, url });
  };

  const [runtime, setRuntime] = useState<RuntimeState>({
    step: "idle",
    request: {
      url: "",
      method: "",
      body: "",
      headers: [],
    },
    response: {
      status: 0,
      body: "",
      headers: [],
    },
    errorMessage: "",
    startedAt: 0,
    finishedAt: 0,
  });

  const begin = (request: RequestSnapshot) =>
    setRuntime({
      step: "running",
      request,
      response: {
        status: 0,
        body: "",
        headers: [],
      },
      errorMessage: "",
      startedAt: Date.now(),
      finishedAt: 0,
    });

  const success = (response: ResponseSnapshot) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "success",
      response,
      finishedAt: Date.now(),
    }));

  const unsuccess = (response: ResponseSnapshot) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "unsuccess",
      response,
      finishedAt: Date.now(),
    }));

  const error = (errorMessage: string) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "error",
      errorMessage,
      finishedAt: Date.now(),
    }));

  const runSpec = async (running: { method: string; url: string }) => {
    const requestInfo: RequestSnapshot = {
      url: running.url,
      method: running.method,
      body: "",
      headers: spec!.headers.length
        ? spec!.headers.filter((h) => h.isEnabled)
        : [],
    };

    begin(requestInfo);
    try {
      const response = await fetch(running.url, {
        method: requestInfo.method,
        headers: requestInfo.headers.reduce(
          (headers, header) => ({ ...headers, [header.key]: header.value }),
          {}
        ),
      });
      const responseInfo: ResponseSnapshot = {
        status: response.status,
        body: await response.text(),
        headers: Array.from(response.headers).map(([key, value]) => ({
          key,
          value,
        })),
      };
      if (response.ok) {
        success(responseInfo);
      } else {
        unsuccess(responseInfo);
      }
    } catch (exception) {
      error((exception as Error).message);
    }
  };

  if (spec === null) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const method = (
      event.currentTarget.elements.namedItem("method") as HTMLInputElement
    ).value;
    const url = (
      event.currentTarget.elements.namedItem("url") as HTMLInputElement
    ).value;
    runSpec({ method, url });
  };

  return (
    <section className="flex flex-col flex-grow px-5 py-3 border-2 h-full">
      <form className="flex" onSubmit={handleSubmit}>
        <Select defaultValue={spec.method} name="method" required>
          <SelectTrigger aria-label="Method" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((method) => (
              <SelectItem
                key={method}
                value={method}
                disabled={method !== "GET"}
              >
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="url"
          aria-label="URL"
          name="url"
          placeholder="Enter URL here..."
          autoComplete="off"
          spellCheck={false}
          maxLength={2083}
          className="mx-3 w-full"
          defaultValue={spec.url || ""}
          onChange={handleUrlValueChange}
          required
        />
        <Button type="submit" className="px-10">
          Run
        </Button>
      </form>
      <div className="mt-5">
        {runtime.step === "running" && <RuntimeProgressBar />}

        {runtime.step === "success" && (
          <>
            <h3 className="text-green-400 mb-3">
              HTTP success: <code>{runtime.response.status}</code>
            </h3>
            {runtime.response.body ? (
              <p>
                <code>{runtime.response.body}</code>
              </p>
            ) : (
              <p>
                But <strong>empty</strong> body.
              </p>
            )}
          </>
        )}

        {runtime.step === "unsuccess" && (
          <>
            <h3 className="text-red-400 mb-3">
              HTTP bad status: <code>{runtime.response.status}</code>
            </h3>
            {runtime.response.body ? (
              <p>
                <code>{runtime.response.body}</code>
              </p>
            ) : (
              <p>
                For <strong>unknown</strong> reasons.
              </p>
            )}
          </>
        )}

        {runtime.step === "error" && (
          <>
            <h3 className="text-red-400 mb-3">Error</h3>
            {runtime.errorMessage ? (
              <p>
                <strong>Browser reason:</strong>{" "}
                <code>{runtime.errorMessage}</code>
              </p>
            ) : (
              <p>
                For <strong>unknown</strong> reasons.
              </p>
            )}
            <p>
              This error was thrown by the browser, not the server.
              <br />
              Open your browser console, run the request again and check if
              there are more evidences.
            </p>
          </>
        )}

        {runtime.finishedAt > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            {runtime.step.toUpperCase()} in{" "}
            {runtime.finishedAt - runtime.startedAt}ms. Started at{" "}
            {new Date(runtime.startedAt).toLocaleTimeString("en-US")}.
          </p>
        )}

        {(runtime.step === "success" ||
          runtime.step === "unsuccess" ||
          runtime.step === "error") && (
          <CollapsibleHeadersList
            heading={`Request headers (${runtime.request.headers.length})`}
            headers={runtime.request.headers}
            emptyMessage="No headers (but double check in your console network inspector if your browser injected any)."
          />
        )}

        {(runtime.step === "success" || runtime.step === "unsuccess") && (
          <CollapsibleHeadersList
            heading={`Response headers (${runtime.response.headers.length})`}
            headers={runtime.response.headers}
            emptyMessage="No response headers (but your browser may have omitted a few, double check in your console network inspector)."
          />
        )}
      </div>
    </section>
  );
}

function RuntimeProgressBar() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timers = [
      setTimeout(() => setProgress(42), 200),
      setTimeout(() => setProgress(66), 500),
      setTimeout(() => setProgress(80), 2000),
      setTimeout(() => setProgress(85), 3000),
      setTimeout(() => setProgress(90), 4000),
      setTimeout(() => setProgress(95), 5000),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return <Progress value={progress} className="w-[60%] m-auto" />;
}

function CollapsibleHeadersList(props: {
  heading: string;
  headers: Array<{ key: string; value: string }>;
  emptyMessage: string;
}) {
  return (
    <Collapsible className="mt-5">
      <CollapsibleTrigger className="collapsible-trigger w-full text-left hover:bg-accent">
        <h3>
          <FontAwesomeIcon
            icon={faCaretRight}
            className="collapsible-trigger__icon-to-open"
          />
          <FontAwesomeIcon
            icon={faCaretDown}
            className="collapsible-trigger__icon-to-close"
          />{" "}
          {props.heading}
        </h3>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {props.headers.length ? (
          <ul>
            {props.headers.map((header) => (
              <li key={header.key}>
                <code>
                  {header.key}: {header.value}
                </code>
              </li>
            ))}
          </ul>
        ) : (
          <p>{props.emptyMessage}</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

const HTTP_METHODS: Array<ProjectRequestSpec["method"]> = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];
