import { useParams } from "wouter";
import { validate as validateUuid } from "uuid";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";
import { Anchor, Title } from "@/components/ui/typography";
import { useEffect } from "react";

export function ProjectWorkspacePage() {
  const params = useParams();
  const projectUUID = validateUuid(params.uuid || "") ? params.uuid : "";

  useEffect(() => {
    if (!projectUUID) {
      return;
    }

    console.warn("TODO", projectUUID);
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

  return (
    <AppPageTemplate container>
      <p>
        <Anchor href="/">
          <small>Back to Projects selection</small>
        </Anchor>
      </p>
      <Title>Project workspace</Title>
      <p>Wadda wadda.</p>
    </AppPageTemplate>
  );
}
