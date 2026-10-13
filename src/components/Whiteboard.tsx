import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Tldraw, Editor, createShapeId, exportToBlob } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export interface TemplateSection {
  title: string;
  content: string;
  color?: "blue" | "green" | "red" | "yellow" | "violet" | "black";
}

export interface WhiteboardRef {
  getCanvasSnapshot: () => Promise<string | null>;
  getEditor: () => Editor | null;
  addNote: (content: string, color?: "yellow" | "blue" | "green" | "red" | "violet", x?: number, y?: number) => void;
  drawText: (content: string, x?: number, y?: number, color?: "black" | "blue" | "green" | "red") => void;
  insertTemplate: (templateTitle: string, sections: TemplateSection[]) => void;
  downloadSnapshot: (filename?: string) => Promise<boolean>;
  clear: () => void;
}

export interface WhiteboardProps {
  socket: WebSocket | null;
  onActionReceived?: (tool: string, payload: any) => void;
}

export const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ socket, onActionReceived }, ref) => {
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
    addNote: (content: string, color = "yellow", customX, customY) => {
      const editor = editorRef.current;
      if (!editor) return;
      const noteId = createShapeId();
      editor.createShape({
        id: noteId,
        type: "note",
        x: customX !== undefined ? customX : 160 + Math.random() * 80,
        y: customY !== undefined ? customY : 160 + Math.random() * 80,
        props: {
          text: content,
          color: (color === "violet" ? "violet" : color) as any,
          size: "m",
        },
      });
    },
    drawText: (content: string, x = 120, y = 140, color = "blue") => {
      const editor = editorRef.current;
      if (!editor) return;
      const textId = createShapeId();
      editor.createShape({
        id: textId,
        type: "text",
        x,
        y,
        props: {
          text: content,
          size: "m",
          color: color as any,
        },
      });
    },
    insertTemplate: (templateTitle: string, sections: TemplateSection[]) => {
      const editor = editorRef.current;
      if (!editor) return;

      // 1. Title Banner
      const titleId = createShapeId();
      editor.createShape({
        id: titleId,
        type: "geo",
        x: 80,
        y: 60,
        props: {
          geo: "rectangle",
          w: 580,
          h: 56,
          color: "blue",
          fill: "semi",
        },
      });

      const titleTextId = createShapeId();
      editor.createShape({
        id: titleTextId,
        type: "text",
        x: 96,
        y: 72,
        props: {
          text: `📋 ${templateTitle}`,
          size: "m",
          color: "black",
        },
      });

      // 2. Sections as structured notes/cards
      let currentY = 135;
      sections.forEach((sec, idx) => {
        const secCardId = createShapeId();
        const secTextId = createShapeId();

        editor.createShape({
          id: secCardId,
          type: "geo",
          x: 80,
          y: currentY,
          props: {
            geo: "rectangle",
            w: 580,
            h: 90,
            color: sec.color || (idx % 2 === 0 ? "violet" : "green"),
            fill: "semi",
          },
        });

        editor.createShape({
          id: secTextId,
          type: "text",
          x: 96,
          y: currentY + 12,
          props: {
            text: `🔹 ${sec.title}\n${sec.content}`,
            size: "s",
            color: "black",
          },
        });

        currentY += 105;
      });
    },
    downloadSnapshot: async (filename = "magic-whiteboard-session.png") => {
      const editor = editorRef.current;
      if (!editor) return false;
      try {
        const shapeIds = Array.from(editor.getCurrentPageShapeIds());
        if (shapeIds.length === 0) return false;
        const blob = await exportToBlob({
          editor,
          ids: shapeIds,
          format: "png",
          opts: { background: true, padding: 32 },
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      } catch (err) {
        console.error("Failed to download canvas snapshot:", err);
        return false;
      }
    },
    clear: () => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapeIds());
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

        if (onActionReceived) {
          onActionReceived(tool, payload);
        }

        if (tool === "drawBoardText") {
          editor.createShape({
            id: createShapeId(),
            type: "text",
            x: payload.x || 120,
            y: payload.y || 120,
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
              w: 440,
              h: 140,
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
  }, [socket, onActionReceived]);

  return (
    <div className="magic-whiteboard-inner" style={{ width: "100%", height: "100%", position: "relative" }}>
      <Tldraw onMount={(editor) => { editorRef.current = editor; }} />
    </div>
  );
});

Whiteboard.displayName = "Whiteboard";
