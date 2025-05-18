import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import axios from "axios";

export default function PythonEditor() {
  const [code, setCode] = useState(`# Write your Python code here\nname = input("Enter your name: ")\nprint("Hello, " + name)`);
  const [output, setOutput] = useState("");

  const handleRun = async () => {
    try {
      // Match all input(...) calls in the code
      let transformedCode = code;
      const inputRegex = /input\((.*?)\)/g;

      let match;
      while ((match = inputRegex.exec(code)) !== null) {
        // Get the prompt text if any
        let promptText = "";
        try {
          promptText = eval(match[1]); // e.g., "Enter your name:"
        } catch {
          promptText = "Enter a value:";
        }

        // Show JS prompt to user
        const userValue = window.prompt(promptText);
        const safeValue = JSON.stringify(userValue || ""); // safely quoted

        // Replace this input(...) with the user's response
        transformedCode = transformedCode.replace(match[0], safeValue);
      }

      setOutput("Running...");

      // Send the transformed code to backend
      const response = await axios.post("http://localhost:5000/api/run", {
        code: transformedCode,
      });

      setOutput(response.data.output || "No output returned.");
    } catch (err) {
      setOutput("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center font-mono">
      <h1 className="text-2xl mb-4">Python Code Editor & Terminal</h1>

      <div className="w-full max-w-4xl space-y-4">
        <CodeMirror
          value={code}
          height="300px"
          extensions={[python()]}
          theme="dark"
          onChange={(value) => setCode(value)}
        />

        <button
          onClick={handleRun}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Run Code
        </button>

        <div className="bg-black text-green-400 p-4 rounded h-48 overflow-auto">
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}
