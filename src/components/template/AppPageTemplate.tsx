import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import MazuhSoftwaresLogo from "@/assets/mazuhsoftwares.jpeg";
import { cn } from "@/lib/utils";

export function AppPageTemplate({
  children,
  container,
}: {
  children: React.ReactNode;
  container?: boolean;
}) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="px-4 py-3 shrink-0 border-b-2 w-full flex items-center">
        <h1 className="tracking-tight text-2xl cursor-default bg-primary w-fit px-6 py-1 rounded-br-lg font-extralight">
          <a href="/">Postmaiden</a>
        </h1>
        <div className="ml-auto">
          <p>Hello, developer.</p>
        </div>
      </header>
      <main
        className={cn(
          "px-4 py-6 grow overflow-y-auto overflow-x-hidden flex flex-col",
          container ? "container" : "mx-10"
        )}
      >
        {children}
      </main>
      <footer className="shrink-0 w-full p-2 pb-3 border-t">
        <p className="flex justify-center">
          <a
            href="https://postmaiden.com.br/"
            target="_blank"
            className="flex transition-colors hover:text-foreground/80 text-foreground/60"
            aria-label="Official Postmaiden website"
            title="Official Postmaiden website" rel="noreferrer"
          >
            <FontAwesomeIcon
              icon={faGlobe}
              className="w-6 h-6 mr-2 select-none text-white"
            />
          </a>
          <a
            href="https://mazuhsoftwares.com/"
            target="_blank"
            className="flex transition-colors hover:text-foreground/80 text-foreground/60"
            aria-label="Made by Mazuh Softwares"
            title="Made by Mazuh Softwares"
            rel="noopener noreferrer"
          >
            <img
              src={MazuhSoftwaresLogo}
              alt="All rights reserved."
              className="w-6 h-6 mr-2 rounded-full select-none"
            />
          </a>
          <a
            href="https://github.com/MazuhSoftwares/postmaiden"
            target="_blank"
            className="flex transition-colors hover:text-foreground/80 text-foreground/60"
            aria-label="Free source under MIT License, available on GitHub"
            title="Free source under MIT License, available on GitHub"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon
              icon={faGithub}
              className="w-6 h-6 mr-2 select-none text-white"
            />
          </a>
        </p>
      </footer>
    </div>
  );
}
