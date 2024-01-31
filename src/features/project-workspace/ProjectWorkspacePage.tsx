import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { validate as validateUuid } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";
import { Anchor, Title } from "@/components/ui/typography";
import { Project } from "@/entities/management";
import { retrieveProject } from "./opfs-project-service";

export function ProjectWorkspacePage() {
  const params = useParams();
  const projectUUID = validateUuid(params.uuid || "") ? params.uuid : "";

  const [project, setProject] = useState<Project>();

  useEffect(() => {
    if (!projectUUID) {
      return;
    }

    retrieveProject(projectUUID)
      .then((retrieved) => setProject(retrieved))
      .catch((error) => console.error("Error retrieving project.", error));
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
      <Title>
        <FontAwesomeIcon icon={faFolderOpen} />
        <span className="pl-1">
          Project workspace:{" "}
          <code className="pl-2" title={project.uuid}>
            {project.name}
          </code>
        </span>
      </Title>
      <p>Wadda wadda.</p>
    </AppPageTemplate>
  );
}
