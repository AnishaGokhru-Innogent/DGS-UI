import { Input } from "antd";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as mammoth from "mammoth";
import { log } from "util";
import "../CSS/createTemplate.css";
// Register the custom placeholder blot
const Inline = Quill.import("blots/inline");
class PlaceholderBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-placeholder", value);
    node.setAttribute("contenteditable", "false"); // make it non-editable
    // if (value === "signature") {
    node.style.border = "1px dashed #000"; // add boundary for signature
    node.style.padding = "2px 4px";
    // }
    node.classList.add("placeholder-blot");
    node.innerHTML = `{{${value}}}`;
    return node;
  }
  static formats(node) {
    return node.getAttribute("data-placeholder");
  }
}
PlaceholderBlot.blotName = "placeholder";
PlaceholderBlot.tagName = "span";
PlaceholderBlot.className = "placeholder-blot";
Quill.register(PlaceholderBlot);
const CreateTemplate = () => {
  const [placeholders, setPlaceholders] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [placeholderName, setPlaceholderName] = useState("");
  const [placeholderType, setPlaceholderType] = useState("text");
  const [cursorPosition, setCursorPosition] = useState(null);
  const [template, setTemplate] = useState({});
  const [resTemplate, setResTemplate] = useState({});
  const [templateName, setTemplateName] = useState("");
  const [userId, setUserId] = useState(1);
  const quillRef = useRef(null);
  const bearerToken =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0dXNoYXJAaW5ub2dlbnQuaW4iLCJpYXQiOjE3MTcxNTk5NjUsImV4cCI6MTcxNzE3NDM2NX0.hJS5vL3BFcJrrzo8INcZ2vPyBqtrQVDSotqQltzk-sU";
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.focus();
    }
  }, []);
  useEffect(() => {
    if (Object.keys(template).length > 0) {
      saveTemplate();
    }
  }, [template]);
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const handleSelectionChange = () => {
      const selection = quill.getSelection();
      if (selection) {
        setCursorPosition(selection.index);
      }
    };
    quill.on("selection-change", handleSelectionChange);
    quill.on("text-change", () => {
      const selection = quill.getSelection();
      if (selection) {
        setCursorPosition(selection.index);
      }
    });
    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, []);
  async function saveTemplate() {
    console.log(template);
    await axios
      .post("http://localhost:8080/template/create", template, {
        // headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((res) => setResTemplate(res))
      .catch((error) => console.log(error));
  }
  const addPlaceholder = () => {
    if (!placeholderName) return;
    const existingPlaceholder = placeholders.find(
      (placeholder) =>
        placeholder.placeholderName === placeholderName &&
        placeholder.placeholderType === placeholderType
    );
    if (!existingPlaceholder) {
      const newPlaceholder = {
        placeholderName: placeholderName,
        placeholderType: placeholderType,
        index: cursorPosition === null ? editorContent.length : cursorPosition,
      };
      setPlaceholders([...placeholders, newPlaceholder]);
    }
    const quill = quillRef.current.getEditor();
    const cursorPos =
      cursorPosition === null ? quill.getLength() : cursorPosition;
    quill.insertEmbed(cursorPos, "placeholder", placeholderName, "user");
    quill.setSelection(cursorPos + placeholderName.length + 4);
    setPlaceholderName("");
    setPlaceholderType("text");
  };
  const deletePlaceholder = (name, type) => {
    setPlaceholders(
      placeholders.filter(
        (placeholder) =>
          !(
            placeholder.placeholderName === name &&
            placeholder.placeholderType === type
          )
      )
    );
    const quill = quillRef.current.getEditor();
    const content = quill.getContents();
    // Find and remove the placeholder blot
    const newOps = content.ops.filter((op) => {
      if (op.insert && typeof op.insert !== "string") {
        return op.insert.placeholder !== name;
      }
      if (op.insert && typeof op.insert === "string") {
        const regex = new RegExp(`{{${name}}}`, "g");
        op.insert = op.insert.replace(regex, "");
        return op.insert !== "";
      }
      return true;
    });
    quill.setContents(newOps);
    setEditorContent(quill.root.innerHTML);
  };
  function generateTemplateJSON() {
    const plainText = quillRef.current.getEditor().getText();
    const templateJSON = {
      templateName: templateName,
      templateFormat: "DOCX",
      templateBody: plainText,
      userId: userId,
      placeholderDTOS: placeholders.map(
        ({ placeholderName, placeholderType }) => ({
          placeholderName,
          placeholderType,
        })
      ),
    };
    setTemplate(templateJSON);
    // console.log(JSON.stringify(templateJSON, null, 2));
  }
  const handlerFileChange = async (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();
      reader.onload = async function () {
        const arrayBuffer = reader.result;
        mammoth
          .convertToHtml({ arrayBuffer })
          .then((result) => {
            const html = result.value;
            setEditorContent(html);
            quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(html);
          })
          .catch((error) => console.log(error));
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid Word document (.docx)");
    }
  };
  return (
    <div style={{ padding: "50px" }}>
      <h3>{resTemplate.templateId}</h3>
      <h1>Template Creator</h1>
      <Input
        placeholder="Enter Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <ReactQuill
        ref={quillRef}
        value={editorContent}
        onChange={setEditorContent}
        theme="snow"
      />
      <div style={{ margin: "30px" }}>
        <input type="file" accept=".docx" onChange={handlerFileChange} />
        <h3>Upload Word Document</h3>
      </div>
      <div>
        <h2>Add Placeholder</h2>
        <div>
          <input
            type="text"
            placeholder="Placeholder Name"
            value={placeholderName}
            onChange={(e) => setPlaceholderName(e.target.value)}
          />
          <select
            value={placeholderType}
            onChange={(e) => setPlaceholderType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="date">Date</option>
            <option value="number">Number</option>
            <option value="signature">signature</option>
          </select>
          <button onClick={addPlaceholder}>Add Placeholder</button>
        </div>
      </div>
      <div>
        <h2>Placeholders</h2>
        <ul>
          {placeholders.map((placeholder) => (
            <li
              key={`${placeholder.placeholderName}-${placeholder.placeholderType}`}
            >
              {placeholder.placeholderName} ({placeholder.placeholderType}){" "}
              <button
                onClick={() =>
                  deletePlaceholder(
                    placeholder.placeholderName,
                    placeholder.placeholderType
                  )
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Generated Template JSON</h2>
        <button onClick={generateTemplateJSON}>SAVE</button>
      </div>
    </div>
  );
};
export default CreateTemplate;