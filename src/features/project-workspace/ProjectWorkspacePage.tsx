import { useState, useRef, SyntheticEvent, useEffect } from "react";
import debounce from "lodash/debounce";
import { useParams } from "wouter";
import { validate as validateUuid } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFileCode,
  faFolderOpen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";
import { Anchor, Title } from "@/components/ui/typography";
import { ProjectRequestSpec } from "@/entities/management";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestsSpecsContextProvider } from "./RequestsSpecsContextProvider";
import { useRequestsSpecs } from "./RequestsSpecsContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export function ProjectWorkspacePage() {
  const params = useParams();
  const projectUuid = validateUuid(params.uuid || "") ? params.uuid : "";

  if (!projectUuid) {
    return (
      <AppPageTemplate>
        <Title>Invalid project URL</Title>
        <p>If you copied and pasted from somewhare, maybe it was incomplete.</p>
        <p>
          <Anchor href="/">Click here to go to projects selection.</Anchor>
        </p>
      </AppPageTemplate>
    );
  }

  return (
    <RequestsSpecsContextProvider projectUuid={projectUuid}>
      <AppPageTemplate>
        <p>
          <Anchor href="/">
            <small>
              <FontAwesomeIcon icon={faArrowLeft} />{" "}
              <span>Back to Projects selection</span>
            </small>
          </Anchor>
        </p>
        <WorkspaceHeader />
        <WorkspaceBody />
      </AppPageTemplate>
    </RequestsSpecsContextProvider>
  );
}

function WorkspaceBody() {
  const [selectedSpec, setSelectedSpec] = useState<
    ProjectRequestSpec["uuid"] | null
  >(null);

  return (
    <WorkspaceContainer>
      <RequestsSpecsList
        selected={selectedSpec}
        setSelected={setSelectedSpec}
      />
      <RequestSpecEditor key={selectedSpec} specUuid={selectedSpec} />
    </WorkspaceContainer>
  );
}

function WorkspaceHeader() {
  const { projectName, specs } = useRequestsSpecs();

  if (!specs.length) {
    return null;
  }

  return (
    <Title>
      <FontAwesomeIcon icon={faFolderOpen} />
      <span className="pl-1">
        Project workspace: <code className="px-2">{projectName}</code>
        <CreateRequestSpecButton />
      </span>
    </Title>
  );
}

function WorkspaceContainer({ children }: { children: React.ReactNode }) {
  const { projectName, specs } = useRequestsSpecs();

  if (specs.length === 0) {
    return (
      <div className="w-fit m-auto flex flex-col text-center">
        <Title>✨ Created. ✨</Title>
        <p className="mb-2 w-full text-center">
          <em>{projectName}</em>
        </p>
        <br />
        <div className="w-full flex justify-center">
          <CreateRequestSpecButton />
        </div>
      </div>
    );
  }

  return <div className="flex flex-row w-100 h-full">{children}</div>;
}

function RequestsSpecsList(props: {
  selected: string | null;
  setSelected: (uuid: string | null) => void;
}) {
  const { specs } = useRequestsSpecs();

  const [hovered, setHovered] = useState<string | null>(null);

  const handleSpecClickFn = (spec: ProjectRequestSpec) => () => {
    if (props.selected === spec.uuid) {
      props.setSelected(null);
    } else {
      props.setSelected(spec.uuid);
    }
  };

  return (
    <div className="w-[280px] flex-shrink-0 pr-3">
      <ul className="list-disc mt-2">
        {specs.map((spec) => (
          <li
            key={spec.uuid}
            title={spec.url}
            onMouseEnter={() => setHovered(spec.uuid)}
            onMouseLeave={() => setHovered(null)}
            onClick={handleSpecClickFn(spec)}
            className={cn(
              "cursor-pointer flex justify-between items-center px-3",
              "hover:bg-accent",
              props.selected === spec.uuid ? "bg-accent" : ""
            )}
          >
            <RequestSpecText
              spec={spec}
              className="py-4 text-xs"
              maxUrlLength={20}
            />
            <span
              className={cn(hovered === spec.uuid ? "visible" : "invisible")}
            >
              <RequestSpecRemovalButton spec={spec} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequestSpecEditor(props: {
  specUuid: ProjectRequestSpec["uuid"] | null;
}) {
  const { specs, patch } = useRequestsSpecs();
  const spec = specs.find((s) => s.uuid === props.specUuid) || null;

  const patchUrlUnsafelly = (patching: { uuid: string; url: string }) => {
    patch(patching);
  };

  const patchUrlRef = useRef<typeof patchUrlUnsafelly>(
    debounce(patchUrlUnsafelly, 500)
  );
  const patchUrl = patchUrlRef.current;

  const [runtime, setRuntime] = useState<{
    step: "idle" | "running" | "success" | "unsuccess" | "error";
    text: string;
    status: number;
    startedAt: number;
    finishedAt: number;
  }>({
    step: "idle",
    text: "",
    status: 0,
    startedAt: 0,
    finishedAt: 0,
  });

  const begin = () =>
    setRuntime({
      step: "running",
      text: "",
      status: 0,
      startedAt: Date.now(),
      finishedAt: 0,
    });

  const success = (text: string, status: number) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "success",
      status,
      text,
      finishedAt: Date.now(),
    }));

  const unsuccess = (text: string, status: number) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "unsuccess",
      text,
      status,
      finishedAt: Date.now(),
    }));

  const error = (text: string) =>
    setRuntime((updatingRuntime) => ({
      ...updatingRuntime,
      step: "error",
      text,
      finishedAt: Date.now(),
    }));

  const runSpec = async (running: { method: string; url: string }) => {
    begin();
    try {
      const response = await fetch(running.url, {
        method: running.method,
      });
      const text = await response.text();
      if (response.ok) {
        success(text, response.status);
      } else {
        unsuccess(text, response.status);
      }
    } catch (exception) {
      error((exception as Error).message);
    }
  };

  if (spec === null) {
    return null;
  }

  const handleUrlValueChange = (event: React.FormEvent<HTMLInputElement>) => {
    const url = event.currentTarget.value;
    patchUrl({ uuid: spec.uuid, url });
  };

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
    <div className="flex flex-col flex-grow px-5 py-3 border-2 h-full">
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
        <Button type="submit">Run</Button>
      </form>
      <div className="mt-5">
        {runtime.step === "running" && <RuntimeProgressBar />}
        {runtime.step === "success" && (
          <>
            <p className="text-green-400 mb-3">
              <strong>HTTP success:</strong> <code>{runtime.status}</code>
            </p>
            {runtime.text ? (
              <p>
                <code>{runtime.text}</code>
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
            <p className="text-red-400 mb-3">
              <strong>HTTP bad code:</strong> <code>{runtime.status}</code>
            </p>
            {runtime.text ? (
              <p>
                <code>{runtime.text}</code>
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
            <p className="text-red-400 mb-3">Error.</p>
            {runtime.text ? (
              <p>
                <strong>Browser reason:</strong> <code>{runtime.text}</code>
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
      </div>
    </div>
  );
}

export function RuntimeProgressBar() {
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

const HTTP_METHODS: Array<ProjectRequestSpec["method"]> = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

function CreateRequestSpecButton() {
  const { create } = useRequestsSpecs();

  const handleClick = () => create();

  return (
    <Button onClick={handleClick}>
      <FontAwesomeIcon icon={faFileCode} />
      <span className="pl-1">Create request spec</span>
    </Button>
  );
}

function RequestSpecRemovalButton(props: { spec: ProjectRequestSpec }) {
  const { remove } = useRequestsSpecs();

  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    remove(props.spec).then(close);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline-destructive" onClick={open} title="Remove">
        <FontAwesomeIcon icon={faTrash} aria-label="Remove" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request spec removal</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <RequestSpecText spec={props.spec} />?
          </DialogDescription>
          <DialogFooter className="pt-4">
            <form onSubmit={handleSubmit}>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Remove request spec
              </Button>
            </form>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function RequestSpecText(props: {
  spec: ProjectRequestSpec;
  className?: string;
  maxUrlLength?: number;
}) {
  const getUrlVisibleText = (): string => {
    const url = props.spec.url.trim();

    if (!url) {
      return "?";
    }

    if (!props.maxUrlLength) {
      return props.spec.url;
    }

    if (url.length <= props.maxUrlLength + "...".length) {
      return props.spec.url;
    }

    return "..." + url.slice(url.length - props.maxUrlLength);
  };

  return (
    <span
      className={cn(
        "text-clip overflow-hidden whitespace-nowrap",
        props.className
      )}
    >
      <code className="font-bold">{props.spec.method}</code>{" "}
      <code>{getUrlVisibleText()}</code>
    </span>
  );
}
