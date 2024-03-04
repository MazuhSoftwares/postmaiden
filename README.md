# Postmaiden

Postmaiden is an application for testing and documenting HTTP APIs,
with straightforward usability, made for developers.

## Setting up locally

Having Node 20 installed and in use:

```
npm install
```

Then the development instance:

```
npm run dev
```

Now open the application in your browser following the output URL.

And that's it. There's really no server, by default nobody is intercepting your requests here.

For core development, there are some useful testing scripts:

- `npm t` to run all tests, including a full report of coverage and test names.
- `npm run test:watch -- src/example/thing.test.tsx` to run only a specific test file,
  and keep running again after each file change.
- `npm run test:debug -- src/example/thing.test.tsx` to run only a specific test file,
  but displaying more `console.log` stuff and almost unlimited RTL `screen.debug()`.

## Non-functional Requirements

- Offline-first for free plan features,
  powered by [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).
- Mainly desktop interface, widths greater than 900px.
- Chrome and Firefox support.
- Tech stack is [React 18](https://react.dev/reference/react)
  with TypeScript and [Testing Library](https://testing-library.com/docs/react-testing-library/cheatsheet),
  bundled with [Vite](https://vitejs.dev/guide/why.html).
- Components bootstrapped by [Shadcn UI](https://ui.shadcn.com/docs).
- CSS tool is [Tailwind](https://tailwindcss.com/docs/).
- Icons by [Font Awesome](https://fontawesome.com/search?o=r&m=free),
  but specifically free and React individual imports.
- Serverless cloud infrastructure.
- Reasonable test coverage on each feature.

## Sharing knowledge

For each "big feature", I'll write something about it in Portuguese (BR):

- Introduction to OPFS: https://mazuhsoftwares.com/2024/03/04/manipulando-arquivos-no-frontend-com-origin-private-file-system-opfs-nativamente/

## License

Released under [MIT License](https://github.com/MazuhSoftwares/postmaiden/blob/main/LICENSE)
by ["Mazuh Softwares"](https://mazuhsoftwares.com),
maintained by [Marcell G. C. da Silva](https://github.com/mazuh).
