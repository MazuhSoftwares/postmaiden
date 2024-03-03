import React from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme/ThemeProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="postmaiden-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

if (import.meta.env.PROD) {
  const firebaseConfig = {
    apiKey: "AIzaSyCvk30vFQMc8LgonvQgEdif_2XvQ_jsEmU",
    authDomain: "postmaiden.firebaseapp.com",
    projectId: "postmaiden",
    storageBucket: "postmaiden.appspot.com",
    messagingSenderId: "949749540150",
    appId: "1:949749540150:web:ba75fbb4380fdf60a2bf97",
    measurementId: "G-3H0D6YRC39",
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  logEvent(analytics, "page_view");
}
