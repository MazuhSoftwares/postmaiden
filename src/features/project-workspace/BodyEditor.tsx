import { Editor, EditorProps } from "@monaco-editor/react";
import { useCallback, useId } from "react";

export interface BodyEditorProps extends Omit<EditorProps, "onMount"> {
  name: string;
}

export function BodyEditor(props: BodyEditorProps) {
  const id = useId();

  const { name, wrapperProps, ...restOfProps } = props;
  const overridingWrapperProps = { ...wrapperProps, id };

  const handleOnMount = useCallback(() => {
    const wrapperEl = document.getElementById(id);
    if (!wrapperEl) {
      throw new Error("Unexpected missing wrapper during `BodyEditor` mount.");
    }

    const [textareaEl] = wrapperEl.getElementsByTagName("textarea");
    if (!textareaEl) {
      throw new Error(
        "Unexpected missing `textarea` during `BodyEditor` mount."
      );
    }

    textareaEl.setAttribute("name", name);
  }, [id, name]);

  return (
    <Editor
      language="json"
      theme="vs-dark"
      {...restOfProps}
      wrapperProps={overridingWrapperProps}
      onMount={handleOnMount}
    />
  );
}
