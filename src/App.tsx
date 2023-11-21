import "./App.css";
import { useEffect } from "react";
import useClientSession from "./hooks/useClientSession";

export default function App() {
  const { isActive, doActiveThisSession } = useClientSession();

  useEffect(() => {
    doActiveThisSession();
  }, [doActiveThisSession]);

  if (!isActive) {
    return (
      <div>
        <h1>Postmaiden</h1>
        <em>Snake? Snake? Snaaaaaake!</em>
        <button type="button" onClick={doActiveThisSession}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Postmaiden</h1>
      <em>Snake? Do you think love can bloom even on the battlefield?</em>
    </div>
  );
}
