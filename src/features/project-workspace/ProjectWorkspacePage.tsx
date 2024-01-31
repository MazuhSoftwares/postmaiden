import { SyntheticEvent, useEffect, useState } from "react";
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
import { Project, ProjectRequestSpec } from "@/entities/management";
import {
  createRequestSpec,
  removeRequestSpec,
  retrieveProject,
} from "./opfs-project-service";
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

export function ProjectWorkspacePage() {
  const params = useParams();
  const projectUUID = validateUuid(params.uuid || "") ? params.uuid : "";

  const [project, setProject] = useState<Project>();

  useEffect(() => {
    if (!projectUUID) {
      return;
    }

    const runProjectRetrieval = () => {
      retrieveProject(projectUUID)
        .then((retrieved) => setProject(retrieved))
        .catch((error) => console.error("Error retrieving project.", error));
    };

    runProjectRetrieval();

    const worker = setInterval(() => runProjectRetrieval(), 500);
    return () => clearInterval(worker);
  }, [projectUUID]);

  if (!projectUUID) {
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

  if (!project) {
    return null;
  }

  return (
    <AppPageTemplate>
      <p>
        <Anchor href="/">
          <small>
            <FontAwesomeIcon icon={faArrowLeft} />{" "}
            <span>Back to Projects selection</span>
          </small>
        </Anchor>
      </p>
      <WorkspaceHeader project={project} />
      <RequestsSpecsList project={project} />
    </AppPageTemplate>
  );
}

function WorkspaceHeader(props: { project: Project }) {
  if (!props.project.specs.length) {
    return null;
  }

  return (
    <Title>
      <FontAwesomeIcon icon={faFolderOpen} />
      <span className="pl-1">
        Project workspace:{" "}
        <code className="px-2" title={props.project.uuid}>
          {props.project.name}
        </code>
        <CreateRequestSpecButton projectUuid={props.project.uuid} />
      </span>
    </Title>
  );
}

function RequestsSpecsList(props: { project: Project }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (props.project.specs.length === 0) {
    return (
      <div className="w-fit m-auto flex flex-col text-center">
        <Title>✨ Created. ✨</Title>
        <p className="mb-2 w-full text-center">
          <em>{props.project.name}</em>
        </p>
        <br />
        <div className="w-full flex justify-center">
          <CreateRequestSpecButton projectUuid={props.project.uuid} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ul className="list-disc pl-4 mt-2">
        {props.project.specs.map((spec) => (
          <li
            key={spec.uuid}
            onMouseEnter={() => setHovered(spec.uuid)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="py-4">
              <RequestSpecText spec={spec} />
            </span>
            <span
              className={cn(
                "ml-5",
                hovered === spec.uuid ? "visible" : "invisible"
              )}
            >
              <RequestSpecRemovalButton
                projectUuid={props.project.uuid}
                spec={spec}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateRequestSpecButton(props: { projectUuid: string }) {
  const handleClick = () =>
    createRequestSpec({ projectUuid: props.projectUuid });

  return (
    <Button onClick={handleClick}>
      <FontAwesomeIcon icon={faFileCode} />
      <span className="pl-1">Create request spec</span>
    </Button>
  );
}

function RequestSpecRemovalButton(props: {
  projectUuid: string;
  spec: ProjectRequestSpec;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    removeRequestSpec({
      projectUuid: props.projectUuid,
      removing: props.spec.uuid,
    }).then(close);
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

function RequestSpecText(props: { spec: ProjectRequestSpec }) {
  return (
    <span>
      <code>{props.spec.method}</code> <code>{props.spec.url || "..."}</code>
    </span>
  );
}
