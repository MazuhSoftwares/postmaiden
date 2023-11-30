import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProjectsManagement } from "./ProjectsManagementContext";
import { ProjectsManagementContextProvider } from "./ProjectsManagementContextProvider";
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
import { PageTitle } from "@/components/ui/typography";
import { AppPageTemplate } from "@/components/template/AppPageTemplate";

export function ProjectsManagementPage() {
  return (
    <ProjectsManagementContextProvider>
      <AppPageTemplate>
        <PageTitle>
          <span className="pr-4">My projects</span>
          <ProjectsCreationButton />
        </PageTitle>
        <ProjectsList />
      </AppPageTemplate>
    </ProjectsManagementContextProvider>
  );
}

function ProjectsList() {
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
        <p className="mb-2 w-full">You don't have any projects yet.</p>
        <div className="w-full flex justify-center">
          <ProjectsCreationButton />
        </div>
      </div>
    );
  }

  return (
    <ul className="pl-3">
      {projects.map((project) => (
        <li key={project.uuid}>{project.name}</li>
      ))}
    </ul>
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
    create(values.name).then(close);
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
