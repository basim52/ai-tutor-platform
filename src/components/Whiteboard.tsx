import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Tldraw, Editor, createShapeId, exportToBlob } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export interface WhiteboardRef {
  getCanvasSnapshot: () => Promise<string | null>;
  getEditor: () => Editor | null;
}

export interface WhiteboardProps {
  socket: WebSocket | null;
}

export const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ socket }, ref) => {
  const editorRef = useRef<Editor | null>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current,
    getCanvasSnapshot: async () => {
      const editor = editorRef.current;
      if (!editor) return null;
      try {
        const shapeIds = Array.from(editor.getCurrentPageShapeIds());
        if (shapeIds.length === 0) return null;
        const blob = await exportToBlob({
          editor,
          ids: shapeIds,
          format: "png",
          opts: { background: true, padding: 32 },
        });
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to capture snapshot:", err);
        return null;
      }
    },
  }));

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "WHITEBOARD_ACTION" || !editorRef.current) return;

        const editor = editorRef.current;
        const { tool, payload } = data;

        if (tool === "drawBoardText") {
          editor.createShape({
            id: createShapeId(),
            type: "text",
            x: payload.x || 100,
            y: payload.y || 100,
            props: {
              text: payload.content,
              size: payload.fontSize || "m",
              color: payload.color || "black",
            },
          });
        } else if (tool === "highlightError") {
          const cardId = createShapeId();
          const textId = createShapeId();

          editor.createShape({
            id: cardId,
            type: "geo",
            x: 80,
            y: 80,
            props: {
              geo: "rectangle",
              w: 420,
              h: 130,
              color: "red",
              fill: "semi",
            },
          });

          editor.createShape({
            id: textId,
            type: "text",
            x: 95,
            y: 95,
            props: {
              text: `❌ ${payload.incorrectSnippet}\n✅ ${payload.correctedSnippet}\n💡 ${payload.explanation || ""}`,
              size: "s",
              color: "black",
            },
          });
        } else if (tool === "clearBoard") {
          editor.selectAll();
          editor.deleteShapes(editor.getSelectedShapeIds());
        }
      } catch (err) {
        console.error("Failed to parse whiteboard message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Tldraw onMount={(editor) => { editorRef.current = editor; }} />
    </div>
  );
});

Whiteboard.displayName = "Whiteboard";
