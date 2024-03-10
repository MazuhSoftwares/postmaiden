import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as OPFSSharedInternalsService from "@/services/opfs-projects-shared-internals";
import { RequestsSpecsContextProvider } from "./RequestsSpecsContextProvider";
import { Runtime } from "./Runtime";

jest.mock("wouter", () => ({
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock("@/services/opfs-projects-shared-internals", () => ({
  retrieveProject: jest.fn(),
  persistProject: jest.fn(),
}));

jest.mock("./BodyEditor.tsx", () => ({
  BodyEditor: jest
    .fn()
    .mockImplementation(({ name, defaultValue, onChange }) => (
      <div id="mocked-body-editor">
        <textarea
          name={name}
          defaultValue={defaultValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )),
}));

interface MockedGlobalWithFetch {
  fetch: (
    url: string,
    options: { body: string; method: string }
  ) => Promise<MockedResponse>;
}

interface MockedResponse {
  text: () => Promise<string>;
  status: number;
  ok: boolean;
  headers: [string, string][];
}

describe("Runtime component, given a selected specification", () => {
  beforeAll(() => {
    (global as unknown as MockedGlobalWithFetch).fetch = async () => ({
      text: async () => "",
      status: -1,
      ok: false,
      headers: [],
    });
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    jest
      .spyOn(OPFSSharedInternalsService, "retrieveProject")
      .mockResolvedValue({
        uuid: "7fde4f8e-b6ac-4218-ae20-1b866e61ec56",
        name: "Zippopotamus",
        sections: [],
        specs: [
          {
            uuid: "0b761507-a24c-4a81-8391-9cee4a6e7c34",
            url: "https://api.zippopotam.us/us/33162",
            method: "GET",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: "",
          },
          {
            uuid: "f62f869f-cb12-4997-b679-ceec1096040b",
            url: "https://api.zippopotam.us/br/70150904",
            method: "GET",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: "",
          },
          {
            uuid: "304f0780-33a3-45e4-b9ea-e099f4306832",
            url: "https://api.zippopotam.us/blabla",
            method: "GET",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: "",
          },
          {
            uuid: "a78ee247-4bf2-4393-bec0-57a1b0a8a23d",
            url: "https://catfact.ninja/non-existing",
            method: "GET",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: "",
          },
          {
            uuid: "f4eb2eec-3527-4d96-b34a-cc0e9914231c",
            url: "https://echo.zuplo.io/",
            method: "POST",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: JSON.stringify({ "this is": "an echo test" }),
          },
          {
            uuid: "894f6e21-8002-4111-938b-dbebaaa44966",
            url: "https://echo.zuplo.io/",
            method: "GET",
            headers: [
              { key: "Accept", value: "application/json", isEnabled: true },
            ],
            body: JSON.stringify({ "this is": "an echo test" }),
          },
        ],
      });

    jest
      .spyOn(OPFSSharedInternalsService, "persistProject")
      .mockResolvedValue();

    jest
      .spyOn(global as unknown as MockedGlobalWithFetch, "fetch")
      .mockImplementation(async (url, { body, method }) => {
        if ((method === "GET" || method === "HEAD") && body !== null) {
          // same behavior as Chrome
          throw new Error(
            "Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body."
          );
        }

        switch (url) {
          case "https://api.zippopotam.us/us/33162":
            return {
              text: async () =>
                JSON.stringify({
                  "post code": "33162",
                  country: "United States",
                  "country abbreviation": "US",
                  places: [
                    {
                      "place name": "Miami",
                      longitude: "-80.183",
                      state: "Florida",
                      "state abbreviation": "FL",
                      latitude: "25.9286",
                    },
                  ],
                }),
              status: 200,
              ok: true,
              headers: [
                ["content-type", "application/json"],
                ["x-custom-header", "my-custom-h-value"],
              ],
            };

          case "https://api.zippopotam.us/br/70150904":
            return {
              text: async () => JSON.stringify({}),
              status: 400,
              ok: false,
              headers: [["content-type", "application/json"]],
            };

          case "https://api.zippopotam.us/blabla":
            return {
              text: async () => `
              <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
              <html>
              <head>
              <title>Error: 404 Not Found</title>
              <style type="text/css">
              html {background-color: #eee; font-family: sans;} body {background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 15px;} pre {background-color: #eee; border: 1px solid #ddd; padding: 5px;}
              </style>
              </head>
              <body>
              <h1>Error: 404 Not Found</h1> <p>Sorry, the requested URL <tt>&#039;http://api.zippopotam.us/blabla&#039;</tt> caused an error:</p> <pre>Not found: &#039;/blabla&#039;</pre>
              </body>
              </html>
              `,
              status: 404,
              ok: false,
              headers: [["content-type", "text/html; charset=UTF-8"]],
            };

          case "https://catfact.ninja/non-existing":
            throw new Error("CORS Error (mocked).");

          case "https://echo.zuplo.io/":
            // this is similar but not exactly the same behavior as this Echo API
            return {
              text: async () => body,
              status: 200,
              ok: true,
              headers: [["content-type", "application/json"]],
            };

          default:
            throw new Error(
              "Unexpected `fetch` call during test scenario. Unmocked URL."
            );
        }
      });
  });

  it("displays such selected spec, with already editable url", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="0b761507-a24c-4a81-8391-9cee4a6e7c34" />
        </RequestsSpecsContextProvider>
      )
    );

    const url = screen.getByLabelText(/URL/i);
    expect(url).toHaveValue("https://api.zippopotam.us/us/33162");
  });

  it("can edit only (and really only) its URL while typing", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="0b761507-a24c-4a81-8391-9cee4a6e7c34" />
        </RequestsSpecsContextProvider>
      )
    );

    const url = screen.getByLabelText(/URL/i);
    await act(async () =>
      fireEvent.change(url, {
        target: { value: "https://api-completetly-different" },
      })
    );

    // (waiting a little bit, cause patch calls are debounced)
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(OPFSSharedInternalsService.persistProject).toHaveBeenCalledTimes(1);
    expect(OPFSSharedInternalsService.persistProject).toHaveBeenCalledWith({
      uuid: "7fde4f8e-b6ac-4218-ae20-1b866e61ec56",
      name: "Zippopotamus",
      sections: [],
      specs: [
        {
          uuid: "0b761507-a24c-4a81-8391-9cee4a6e7c34",
          url: "https://api-completetly-different",
          method: "GET",
          headers: [
            { key: "Accept", value: "application/json", isEnabled: true },
          ],
          body: "",
        },
        {
          uuid: "f62f869f-cb12-4997-b679-ceec1096040b",
          url: "https://api.zippopotam.us/br/70150904",
          method: "GET",
          headers: [
            { key: "Accept", value: "application/json", isEnabled: true },
          ],
          body: "",
        },
        {
          uuid: "304f0780-33a3-45e4-b9ea-e099f4306832",
          url: "https://api.zippopotam.us/blabla",
          method: "GET",
          headers: [
            { key: "Accept", value: "application/json", isEnabled: true },
          ],
          body: "",
        },
        {
          uuid: "a78ee247-4bf2-4393-bec0-57a1b0a8a23d",
          url: "https://catfact.ninja/non-existing",
          method: "GET",
          headers: [
            { key: "Accept", value: "application/json", isEnabled: true },
          ],
          body: "",
        },
        {
          body: '{"this is":"an echo test"}',
          headers: [
            {
              isEnabled: true,
              key: "Accept",
              value: "application/json",
            },
          ],
          method: "POST",
          url: "https://echo.zuplo.io/",
          uuid: "f4eb2eec-3527-4d96-b34a-cc0e9914231c",
        },
        {
          body: '{"this is":"an echo test"}',
          headers: [
            {
              isEnabled: true,
              key: "Accept",
              value: "application/json",
            },
          ],
          method: "GET",
          url: "https://echo.zuplo.io/",
          uuid: "894f6e21-8002-4111-938b-dbebaaa44966",
        },
      ],
    });
  });

  it("can perform and display a http 200 with json response", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="0b761507-a24c-4a81-8391-9cee4a6e7c34" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.getByText(/HTTP success/i)).toBeVisible();
    expect(screen.getByText("200")).toBeVisible();
    expect(
      screen.getByText(
        JSON.stringify({
          "post code": "33162",
          country: "United States",
          "country abbreviation": "US",
          places: [
            {
              "place name": "Miami",
              longitude: "-80.183",
              state: "Florida",
              "state abbreviation": "FL",
              latitude: "25.9286",
            },
          ],
        })
      )
    ).toBeVisible();
  });

  it("can show detailed request headers", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="0b761507-a24c-4a81-8391-9cee4a6e7c34" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    const requestHeadersBtn = screen.getByRole("button", {
      name: "Request headers (1)",
    });
    await act(async () => fireEvent.click(requestHeadersBtn));

    expect(screen.getByText(/Accept.*:.*application\/json/i)).toBeVisible();
  });

  it("can show detailed response headers", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="0b761507-a24c-4a81-8391-9cee4a6e7c34" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    const requestHeadersBtn = screen.getByRole("button", {
      name: "Response headers (2)",
    });
    await act(async () => fireEvent.click(requestHeadersBtn));

    expect(
      screen.getByText(/content-type.*:.*application\/json/i)
    ).toBeVisible();
    expect(
      screen.getByText(/x-custom-header.*:.*my-custom-h-value/i)
    ).toBeVisible();
  });

  it("can perform and display a http 400 with json response instead of regular success", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="f62f869f-cb12-4997-b679-ceec1096040b" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.queryByText(/HTTP success/i)).toBe(null);
    expect(screen.queryByText("200")).toBe(null);

    expect(screen.getByText(/HTTP bad status/i)).toBeVisible();
    expect(screen.getByText("400")).toBeVisible();
    expect(screen.getByText(JSON.stringify({}))).toBeVisible();
  });

  it("can perform and display a http 404 with any response instead of regular success", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="304f0780-33a3-45e4-b9ea-e099f4306832" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.queryByText(/HTTP success/i)).toBe(null);
    expect(screen.queryByText("200")).toBe(null);

    expect(screen.getByText(/HTTP bad status/i)).toBeVisible();
    expect(screen.getByText("404")).toBeVisible();
    expect(
      screen.getByText(/Sorry, the requested URL .* caused an error/im)
    ).toBeVisible();
  });

  it("can display unknown exceptions/errors differently than http-related errors", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="a78ee247-4bf2-4393-bec0-57a1b0a8a23d" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.queryByText(/HTTP success/i)).toBe(null);
    expect(screen.queryByText("200")).toBe(null);
    expect(screen.queryByText(/HTTP bad status/i)).toBe(null);

    expect(screen.getByText("Error")).toBeVisible();
    expect(screen.getByText(/CORS Error/im)).toBeVisible();
  });

  it("can perform a POST using a body", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="f4eb2eec-3527-4d96-b34a-cc0e9914231c" />
        </RequestsSpecsContextProvider>
      )
    );

    const input = screen.getByText(/an echo test/, { selector: "textarea" });
    expect(input).toBeVisible();

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.getByText(/HTTP success/i)).toBeVisible();
    expect(screen.getByText("200")).toBeVisible();

    const output = screen.getByText(/an echo test/, { selector: "code" });
    expect(output).toBeVisible();

    expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
      "https://echo.zuplo.io/",
      {
        body: '{"this is":"an echo test"}',
        headers: { Accept: "application/json" },
        method: "POST",
      }
    );
  });

  it("can perform a GET using a body, even if it throws an error", async () => {
    await act(async () =>
      render(
        <RequestsSpecsContextProvider projectUuid="7fde4f8e-b6ac-4218-ae20-1b866e61ec56">
          <Runtime specUuid="894f6e21-8002-4111-938b-dbebaaa44966" />
        </RequestsSpecsContextProvider>
      )
    );

    const run = screen.getByRole("button", { name: /Run/i });
    await act(async () => fireEvent.click(run));

    expect(screen.queryByText(/HTTP success/i)).toBe(null);
    expect(screen.queryByText("200")).toBe(null);

    expect(screen.getByText("Error")).toBeVisible();

    expect(global.fetch as jest.Mock).toHaveBeenCalledWith(
      "https://echo.zuplo.io/",
      {
        body: '{"this is":"an echo test"}',
        headers: { Accept: "application/json" },
        method: "GET",
      }
    );
  });
});
