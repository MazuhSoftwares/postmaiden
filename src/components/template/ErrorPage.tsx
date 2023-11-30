import { AppPageTemplate } from "./AppPageTemplate";

export function ErrorPageTemplate({ children }: { children: React.ReactNode }) {
  return (
    <AppPageTemplate>
      <p>
        <strong>Error!</strong>
        <br />
        {children}
      </p>
    </AppPageTemplate>
  );
}
