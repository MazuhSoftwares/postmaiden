export function AppPageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="px-4 py-2 shrink-0 border-b-2 w-full flex items-center">
        <h1 className="tracking-tight text-2xl cursor-default bg-primary w-fit px-6 py-1 rounded-br-lg font-extralight">
          Postmaiden
        </h1>
        <p className="ml-3">Hello, world! 😉</p>
      </header>
      <main className="px-4 py-6 grow overflow-y-auto overflow-x-hidden flex flex-col">
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
