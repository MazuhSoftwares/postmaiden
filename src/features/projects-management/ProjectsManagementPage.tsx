import { SyntheticEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Anchor, Title } from "@/components/ui/typography";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";
import { ProjectListingItem } from "./projects-management-entities";
import { cn } from "@/lib/utils";
import { useProjectsManagement } from "./ProjectsManagementContext";
import { ProjectsManagementContextProvider } from "./ProjectsManagementContextProvider";

export function ProjectsManagementPage() {
  return (
    <ProjectsManagementContextProvider>
      <AppPageTemplate>
        <ProjectsManagementHeader />
        <ProjectsList />
      </AppPageTemplate>
    </ProjectsManagementContextProvider>
  );
}

function ProjectsManagementHeader() {
  const { items: projects } = useProjectsManagement();

  if (!projects.length) {
    return null;
  }

  return (
    <Title>
      <span className="pr-4">List of projects</span>
      <ProjectsCreationButton />
    </Title>
  );
}

function ProjectsList() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const { items: projects, isLoading, isError } = useProjectsManagement();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {isError.message}</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="w-fit m-auto flex flex-col">
        <Title>Start now by creating a project.</Title>
        <p className="mb-2 w-full">No complex forms, don't worry. 😉</p>
        <br />
        <div className="w-full flex justify-center">
          <ProjectsCreationButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p>Click on a project to open it:</p>
      <ul className="list-disc pl-4 mt-2">
        {projects.map((project) => (
          <li
            key={project.uuid}
            onMouseEnter={() => setHoveredProject(project.uuid)}
            onMouseLeave={() => setHoveredProject(null)}
          >
            <Anchor href={`/project/${project.uuid}`} className="py-4">
              {project.name}
            </Anchor>
            <span
              className={cn(
                "ml-5",
                hoveredProject === project.uuid ? "visible" : "invisible"
              )}
            >
              <ProjectRemovalButton project={project} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .transform((name) => name.trim())
    .refine(
      (name) => name.length >= 3,
      "Name is too short after removing whitespace from both ends"
    ),
});

function ProjectsCreationButton() {
  const { create } = useProjectsManagement();

  const [isOpen, setIsOpen] = useState(false);
  const open = () => {
    setIsOpen(true);
    form.reset();
  };
  const close = () => {
    setIsOpen(false);
    form.reset();
  };

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof projectFormSchema>) => {
    create(values).then(close);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={open}>Create project</Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project</DialogTitle>
          <DialogDescription>
            A project is a context to store your HTTP requests.
          </DialogDescription>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g.: My Favorite API"
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ProjectRemovalButton({ project }: { project: ProjectListingItem }) {
  const { remove } = useProjectsManagement();

  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    remove(project).then(close);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary" onClick={open}>
        Remove
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project removal</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{project.name}</strong>?
          </DialogDescription>
          <DialogFooter className="pt-4">
            <form onSubmit={handleSubmit}>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Remove project forever
              </Button>
            </form>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
