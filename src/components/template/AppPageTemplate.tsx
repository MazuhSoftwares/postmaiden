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
            href="https://mazuhsoftwares.com/"
            target="_blank"
            className="flex transition-colors hover:text-foreground/80 text-foreground/60"
          >
            <img
              src="https://mazuhsoftwares.files.wordpress.com/2022/10/cropped-mediumsquarelogo.jpg"
              alt="All rights reserved."
              className="w-6 h-6 mr-2 rounded-full select-none"
            />
            <span>Made by Mazuh Softwares</span>
          </a>
        </p>
      </footer>
    </div>
  );
}
