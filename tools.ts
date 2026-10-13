export const whiteboardToolDeclarations = [
  {
    name: "drawBoardText",
    description: "Write text, grammar explanations, vocabulary, or notes on the interactive whiteboard canvas.",
    parameters: {
      type: "OBJECT",
      properties: {
        x: {
          type: "NUMBER",
          description: "Horizontal coordinate on the canvas (between 50 and 800)"
        },
        y: {
          type: "NUMBER",
          description: "Vertical coordinate on the canvas (between 50 and 600)"
        },
        content: {
          type: "STRING",
          description: "Text or notes to display on the board"
        },
        fontSize: {
          type: "STRING",
          enum: ["s", "m", "l", "xl"],
          description: "Text size"
        },
        color: {
          type: "STRING",
          enum: ["black", "blue", "green", "red"],
          description: "Color of the rendered text"
        }
      },
      required: ["x", "y", "content"]
    }
  },
  {
    name: "highlightError",
    description: "Draw an error-correction card on the whiteboard showing the mistake, correction, and explanation.",
    parameters: {
      type: "OBJECT",
      properties: {
        incorrectSnippet: {
          type: "STRING",
          description: "The phrase or grammar mistake the student said"
        },
        correctedSnippet: {
          type: "STRING",
          description: "The correct English phrase"
        },
        explanation: {
          type: "STRING",
          description: "Brief reasoning for the correction"
        }
      },
      required: ["incorrectSnippet", "correctedSnippet"]
    }
  },
  {
    name: "clearBoard",
    description: "Wipe clean all current drawings and notes from the whiteboard.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  }
];
