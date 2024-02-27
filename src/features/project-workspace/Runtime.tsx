import { ReactNode, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
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
import {
  HTTP_METHODS,
  getMethodExplanation,
  getStatusExplanation,
  getStatusText,
} from "../../entities/http-for-dummies";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const patchUrl = (url: string) =>
    patchUrlRef.current({ uuid: spec!.uuid, url });

  const handleUrlChange = (event: React.FormEvent) => {
    const url = (event.target as HTMLInputElement).value;
    patchUrl(url);
  };

  const patchMethod = (method: string) =>
    patch({ uuid: spec!.uuid, method: method as ProjectRequestSpec["method"] });

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
      </form>
      <div className="mt-5">
        {runtime.step === "running" && <RuntimeProgressBar />}

        {(runtime.step === "success" || runtime.step == "unsuccess") && (
          <ResponseContent result={runtime.step} response={runtime.response} />
        )}

        {runtime.step === "error" && (
          <div>
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
        <span>{isSuccess ? "HTTP success" : "HTTP bad status"}</span>{" "}
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
  headers: Array<{ key: string; value: string }>;
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
              <strong>we don't have servers intercepting</strong> your requests
              and responses, so your <strong>browser has rigid control</strong>{" "}
              over what the client is running. It implements arbitrary policies
              to <strong>inject/override</strong> headers into requests and{" "}
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
