import "./App.css";
import { useEffect } from "react";
import useClientSession from "./hooks/useClientSession";
import { ProjectsManagementPage } from "./features/projects-management/ProjectsManagementPage";

export default function App() {
  const { isActive, doActiveThisSession, isOfflineModeSupported } =
    useClientSession();

  useEffect(() => {
    doActiveThisSession();
  }, [doActiveThisSession]);

  if (!isOfflineModeSupported) {
    return (
      <main>
        <MainTitle />
        <strong>Error.</strong> Offline mode is not supported by this browser.
      </main>
    );
  }

  if (!isActive) {
    return (
      <main>
        <MainTitle />
        <em>
          The app was opened in another tab or window. In offline mode you can
          use it only one at a time.
        </em>
        <button type="button" onClick={doActiveThisSession}>
          Keep using Postmaiden here
        </button>
      </main>
    );
  }

  return (
    <div>
      <MainTitle />
      <ProjectsManagementPage />
    </div>
  );
}

function MainTitle() {
  return (
    <h1 className="scroll-m-20 tracking-tight text-2xl lg:text-3xl">
      Postmaiden
    </h1>
  );
}
