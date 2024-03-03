import { useState, SyntheticEvent } from "react";
import { useParams } from "wouter";
import { validate as validateUuid } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFolderOpen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";
import { Anchor, Title } from "@/components/ui/typography";
import { ProjectRequestSpec } from "@/entities/project-entities";
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
import { Runtime } from "./Runtime";

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
      {!!selectedSpec && <Runtime key={selectedSpec} specUuid={selectedSpec} />}
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
        <Title>✨ Your project is ready for use. ✨</Title>
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
              "cursor-pointer flex justify-between items-center px-3 select-none",
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

function CreateRequestSpecButton() {
  const { create } = useRequestsSpecs();

  const handleClick = () => create();

  return (
    <Button variant="secondary" onClick={handleClick}>
      <FontAwesomeIcon icon={faPlus} />
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
