import { FormEvent, useCallback, useState } from "react";
import { useProjectsManagement } from "./ProjectsManagementContext";
import { ProjectsManagementContextProvider } from "./ProjectsManagementContextProvider";

export function ProjectsManagementPage() {
  return (
    <ProjectsManagementContextProvider>
      <main>
        <ProjectForm />
        <ProjectsList />
      </main>
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

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.uuid}>{project.name}</li>
      ))}
    </ul>
  );
}

function ProjectForm() {
  const { create } = useProjectsManagement();

  const [name, setName] = useState("");

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      create(name);
    },
    [create, name]
  );

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Project name</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="off"
        maxLength={50}
        spellCheck={false}
        required
      />
      <button type="submit">Create</button>
    </form>
  );
}
