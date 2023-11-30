import { useEffect } from "react";
import { Switch, Router, Route } from "wouter";
import useClientSession from "./hooks/useClientSession";
import { ProjectsManagementPage } from "./features/projects-management/ProjectsManagementPage";
import { Button } from "./components/ui/button";
import { ErrorPageTemplate } from "./components/template/ErrorPage";

export default function App() {
  const { isActive, doActiveThisSession, isOfflineModeSupported } =
    useClientSession();

  useEffect(() => {
    doActiveThisSession();
  }, [doActiveThisSession]);

  if (!isOfflineModeSupported) {
    return (
      <ErrorPageTemplate>
        Offline mode is not supported by this browser.
      </ErrorPageTemplate>
    );
  }

  if (!isActive) {
    return (
      <ErrorPageTemplate>
        <span className="block mb-2">
          The app was opened in another tab or window. In offline mode you can
          use it only one at a time.
        </span>
        <Button type="button" onClick={doActiveThisSession}>
          Keep using it here
        </Button>
      </ErrorPageTemplate>
    );
  }

  return (
    <>
      <Router>
        <Switch>
          <Route path="/" component={ProjectsManagementPage} />
          <Route>
            <ErrorPageTemplate>Page not found.</ErrorPageTemplate>
          </Route>
        </Switch>
      </Router>
    </>
  );
}
