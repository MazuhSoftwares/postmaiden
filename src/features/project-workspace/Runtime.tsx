import { ReactNode, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretRight,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { ProjectRequestSpec } from "@/entities/project-entities";
import {
  RequestSnapshot,
  ResponseSnapshot,
  RuntimeState,
} from "@/entities/runtime-entities";
import { cn } from "@/lib/utils";
import { Anchor } from "@/components/ui/typography";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HTTP_METHODS,
  canMethodHaveBody,
  getMethodExplanation,
  getStatusExplanation,
  getStatusText,
  isRequestingToLocalhost,
} from "../../entities/http-for-dummies";
import { useRequestsSpecs } from "./RequestsSpecsContext";
import { BodyEditor, BodyEditorProps } from "./BodyEditor";

export interface RuntimeProps {
  specUuid: ProjectRequestSpec["uuid"];
}

export function Runtime(props: RuntimeProps) {
  const { specs, patch } = useRequestsSpecs();
  const spec = specs.find((s) => s.uuid === props.specUuid) ?? null;

  // method

  const patchMethod = (method: string) => {
    if (!spec) {
      throw new Error("Unexpected missing spec.");
    }

    patch({
      uuid: spec.uuid,
      method: method as ProjectRequestSpec["method"],
    }).catch(console.error);
  };

  // url

  const patchUrlUnsafelly = (patching: { uuid: string; url: string }) => {
    patch(patching).catch(console.error);
  };

  const patchUrlRef = useRef<typeof patchUrlUnsafelly>(
    debounce(patchUrlUnsafelly, 500)
  );
  const patchUrl = (url: string) =>
    spec ? patchUrlRef.current({ uuid: spec.uuid, url }) : null;

  const handleUrlChange = (event: React.FormEvent) => {
    const url = (event.target as HTMLInputElement).value;
    patchUrl(url);
  };

  // body

  const patchBodyUnsafelly = (patching: { uuid: string; body: string }) => {
    patch(patching).catch(console.error);
  };

  const patchBodyRef = useRef<typeof patchBodyUnsafelly>(
    debounce(patchBodyUnsafelly, 1000)
  );

  const patchBody = (body: string) =>
    spec ? patchBodyRef.current({ uuid: spec.uuid, body }) : null;

  const handleBodyChange: BodyEditorProps["onChange"] = (value) => {
    patchBody(value ?? "");
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

  const runSpec = async (running: {
    method: string;
    url: string;
    body: string;
  }) => {
    if (!spec) {
      throw new Error("Unexpected missing spec.");
    }

    const requestInfo: RequestSnapshot = {
      url: running.url,
      method: running.method,
      body: canMethodHaveBody(running.method)
        ? running.body
        : running.body || null,
      headers: spec.headers.length
        ? spec.headers.filter((h) => h.isEnabled)
        : [],
    };

    const logId = uuidv4();

    console.log(`[${logId}] Running request...`);
    begin(requestInfo);
    try {
      const response = await fetch(running.url, {
        method: requestInfo.method,
        body: requestInfo.body,
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
      console.log(`[${logId}] Got response.`);
      if (response.ok) {
        console.log("Success.");
        success(responseInfo);
      } else {
        unsuccess(responseInfo);
      }
    } catch (exception) {
      console.log(`[${logId}] Excepcional error.`);
      error((exception as Error).message);
    }
  };

  if (spec === null) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // basic, hence requireds
    const method = (
      event.currentTarget.elements.namedItem("method") as HTMLInputElement
    ).value;
    const url = (
      event.currentTarget.elements.namedItem("url") as HTMLInputElement
    ).value;

    // not so basic, hence optional
    const body = (
      event.currentTarget.elements.namedItem("body") as HTMLTextAreaElement
    ).value;

    // aw yeah
    runSpec({ method, url, body }).catch(console.error);
  };

  return (
    <section className="flex flex-col flex-grow px-5 py-3 border-2 h-full">
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <Select
            defaultValue={spec.method}
            name="method"
            onValueChange={patchMethod}
            required
          >
            <SelectTrigger aria-label="Method" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((method) => (
                <SelectItem
                  key={method}
                  value={method}
                  title={getMethodExplanation(method)}
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
            onChange={handleUrlChange}
            required
          />
          <Button type="submit" className="px-10">
            Run
          </Button>
        </div>

        <div className="mt-5 h-3/4">
          <BodyEditor
            name="body"
            defaultValue={spec.body}
            onChange={handleBodyChange}
          />
        </div>
      </form>

      <div className="mt-5 overflow-y-auto">
        {runtime.step === "running" && <RuntimeProgressBar />}

        {(runtime.step === "success" || runtime.step == "unsuccess") && (
          <ResponseContent result={runtime.step} response={runtime.response} />
        )}

        {runtime.step === "error" && (
          <div>
            <h3 className="text-red-400 mb-3">Error</h3>
            {runtime.errorMessage ? (
              <p className="mb-5">
                <strong>Browser reason:</strong>{" "}
                <code>{runtime.errorMessage}</code>
              </p>
            ) : (
              <p>
                For <strong>unknown</strong> reasons.
              </p>
            )}
            {isRequestingToLocalhost(runtime.request) && (
              <p className="mb-5">
                <span role="img" aria-label="Idea">
                  💡
                </span>
                You&apos;re requesting <code>localhost</code>, it can be a
                classic{" "}
                <Anchor
                  href="https://stackoverflow.com/a/46505542"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CORS policy
                </Anchor>{" "}
                issue.
              </p>
            )}
            <p className="mb-5">
              This specific error was thrown by your own browser, not exactly
              the server.
              <br />
              Open your browser console, run the request again and check if
              there are more evidences.
            </p>
          </div>
        )}

        {runtime.finishedAt > 0 && (
          <DiscreteParagraph>
            Method: <strong>{runtime.request.method.toUpperCase()}</strong>.
            Result: {runtime.step.toUpperCase()} in{" "}
            {runtime.finishedAt - runtime.startedAt}ms. Started at{" "}
            {new Date(runtime.startedAt).toLocaleTimeString("en-US")}.
          </DiscreteParagraph>
        )}

        {(runtime.step === "success" ||
          runtime.step === "unsuccess" ||
          runtime.step === "error") && (
          <CollapsibleHeadersList
            heading={`Request headers (${runtime.request.headers.length})`}
            headers={runtime.request.headers}
          />
        )}

        {(runtime.step === "success" || runtime.step === "unsuccess") && (
          <CollapsibleHeadersList
            heading={`Response headers (${runtime.response.headers.length})`}
            headers={runtime.response.headers}
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

function ResponseContent(props: {
  result: "success" | "unsuccess";
  response: ResponseSnapshot;
}) {
  const isSuccess = props.result === "success";

  const [isStatusExplanationOpen, setIsStatusExplanationOpen] = useState(false);
  const openStatusExplanation = () => setIsStatusExplanationOpen(true);

  return (
    <div>
      <h3 className={cn("mb-3", isSuccess ? "text-green-400" : "text-red-400")}>
        <span>{isSuccess ? "HTTP success" : "HTTP bad status"}</span>:{" "}
        <code>{props.response.status}</code>{" "}
        <Dialog
          open={isStatusExplanationOpen}
          onOpenChange={setIsStatusExplanationOpen}
        >
          <span
            className="cursor-help"
            role="button"
            onClick={openStatusExplanation}
          >
            ({getStatusText(props.response.status) || "Unknown"})
          </span>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <FontAwesomeIcon icon={faCircleQuestion} />
                <span className="pl-2">
                  {getStatusText(props.response.status) || "Unknown"}
                </span>
              </DialogTitle>
            </DialogHeader>
            <p>{getStatusExplanation(props.response.status)} 🧑‍💻</p>
          </DialogContent>
        </Dialog>
      </h3>
      {props.response.body ? (
        <p>
          <code>{props.response.body}</code>
        </p>
      ) : (
        <p>
          But <strong>empty</strong> body.
        </p>
      )}
    </div>
  );
}

function CollapsibleHeadersList(props: {
  heading: string;
  headers: { key: string; value: string }[];
}) {
  const thereAreItems = props.headers.length > 0;

  const [isMissingExplanationOpen, setIsMissingExplanationOpen] =
    useState(false);
  const openMissingExplanation = () => setIsMissingExplanationOpen(true);

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
        {thereAreItems && (
          <ul>
            {props.headers.map((header) => (
              <li key={header.key}>
                <code>
                  {header.key}: {header.value}
                </code>
              </li>
            ))}
          </ul>
        )}

        <Dialog
          open={isMissingExplanationOpen}
          onOpenChange={setIsMissingExplanationOpen}
        >
          <div
            className="cursor-help"
            role="button"
            onClick={openMissingExplanation}
          >
            <DiscreteParagraph>
              {thereAreItems
                ? "... and probably more."
                : "But your browser might be hidding them."}
            </DiscreteParagraph>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <FontAwesomeIcon icon={faCircleQuestion} />
                <span className="pl-2">Missing headers?</span>
              </DialogTitle>
            </DialogHeader>
            <p>
              Yes, a few headers might be missing. 🤔 Because{" "}
              <strong>we don&apos;t have servers intercepting</strong> your
              requests and responses, so your{" "}
              <strong>browser has rigid control</strong> over what the client is
              running. It implements arbitrary policies to{" "}
              <strong>inject/override</strong> headers into requests and{" "}
              <strong>omit</strong> headers from responses.
            </p>
            <p>
              But rejoice! You can still view them all. Open your{" "}
              <strong>browser inspector</strong>, select the{" "}
              <strong>network</strong> tab, run the request again and check
              these detailed headers. 🔍
            </p>
          </DialogContent>
        </Dialog>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DiscreteParagraph(props: { children: ReactNode }) {
  return <p className="mt-3 text-xs text-gray-300">{props.children}</p>;
}
