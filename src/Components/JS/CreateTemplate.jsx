import { Form, Input, Select } from "antd";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as mammoth from "mammoth";
import "../CSS/createTemplate.css";
import { log } from "util";

// Register the custom placeholder blot
const Inline = Quill.import("blots/inline");

class PlaceholderBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-placeholder", value);
    node.setAttribute("contenteditable", "false"); // make it non-editable
    node.style.backgroundColor = "#bae7ff";
    node.style.border = "1px solid black"; // add boundary for signature
    node.style.padding = "5px";
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

  const quillRef = useRef(null);
  const userid = localStorage.getItem("userId");
  const [userId, setUserId] = useState(userid);
  const bearerToken = localStorage.getItem("token");
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

    const handleTextChange = () => {
      const selection = quill.getSelection();
      if (selection) {
        setCursorPosition(selection.index);
      }
      // Check for removed placeholders
      const editorText = quill.root.innerHTML;
      setPlaceholders((prevPlaceholders) =>
        prevPlaceholders.filter((placeholder) =>
          editorText.includes(`{{${placeholder.placeholderName}}}`)
        )
      );
    };

    quill.on("selection-change", handleSelectionChange);
    quill.on("text-change", handleTextChange);

    quill.root.addEventListener("keydown", handleKeyDown, true);

    return () => {
      quill.off("selection-change", handleSelectionChange);
      quill.off("text-change", handleTextChange);
      quill.root.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  const handleKeyDown = (event) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (event.key === "Enter") {
      const [leaf] = quill.getLeaf(range.index - 1);
      if (
        leaf &&
        leaf.domNode &&
        leaf.domNode.classList &&
        leaf.domNode.classList.contains("placeholder-blot")
      ) {
        event.preventDefault();
      }
    }
  };

  async function saveTemplate() {
    console.log(template);
    await axios
      .post("http://localhost:8080/template/create", template, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((res) => setResTemplate(res))
      .catch((error) => console.log(error));
  }

  const addPlaceholder = () => {
    if (!placeholderName) return;

    const quill = quillRef.current.getEditor();
    const cursorPos =
      cursorPosition === null ? quill.getLength() : cursorPosition;

    // Check if the cursor is immediately after an existing placeholder
    const [leaf] = quill.getLeaf(cursorPos - 1);
    if (
      leaf &&
      leaf.domNode &&
      leaf.domNode.classList &&
      leaf.domNode.classList.contains("placeholder-blot")
    ) {
      return; // Do not add another placeholder
    }

    const existingPlaceholder = placeholders.find(
      (placeholder) =>
        placeholder.placeholderName === placeholderName &&
        placeholder.placeholderType === placeholderType
    );

    if (!existingPlaceholder) {
      const newPlaceholder = {
        placeholderName: placeholderName,
        placeholderType: placeholderType,
        index: cursorPos,
      };
      setPlaceholders([...placeholders, newPlaceholder]);
    }

    quill.insertEmbed(cursorPos, "placeholder", placeholderName, "user");
    quill.insertText(cursorPos + placeholderName.length + 4, "");
    quill.setSelection(cursorPos + placeholderName.length + 5, " ");
    quill.focus();
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
    <div
      style={{ padding: "50px", backgroundColor: "#f0f0f0", height: "cover" }}
    >
      <div className="container-fluid row">
        <div className="col-8">
          <h3>{resTemplate.templateId}</h3>
          <h1>Template Creator</h1>
          <Form.Item
            label="Document Name"
            name="Document Name"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              placeholder="Enter Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              style={{ marginBottom: 20, width: "400px" }}
            />
          </Form.Item>
          <ReactQuill
            ref={quillRef}
            value={editorContent}
            onChange={setEditorContent}
            theme="snow"
            style={{ minHeight: "200px", maxHeight: "none" }}
          />
          <div style={{ marginTop: "100px" }}>
            <h4>Upload Word Document</h4>
            <input type="file" accept=".docx" onChange={handlerFileChange} />
          </div>
        </div>
        <div className="col-3">
          <div>
            <h5>Add Placeholder</h5>
            <div>
              <Input
                type="text"
                placeholder="Placeholder Name"
                value={placeholderName}
                onChange={(e) => setPlaceholderName(e.target.value)}
              />
              {/* <select
                value={placeholderType}
                onChange={(e) => setPlaceholderType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
                <option value="signature">Signature</option>
              </select> */}
              <Select
                value={placeholderType}
                defaultValue="text"
                style={{ width: 120 }}
                onChange={setPlaceholderType}
                options={[
                  { value: "text", label: "Text" },
                  { value: "date", label: "Date" },
                  { value: "number", label: "Number" },
                  { value: "signature", label: "Signature" },
                ]}
              />
              <button onClick={addPlaceholder}>Add Placeholder</button>
            </div>
          </div>
          <div
            style={{
              marginTop: "50px",
              margin: "10px",
              border: "2px solid black",
              height: "200px",
              width: "auto",
              borderRadius: "2px",
            }}
          >
            <h5>Placeholders</h5>
            <hr style={{ color: "black", height: "2px" }} />
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
      </div>
    </div>
  );
};

export default CreateTemplate;
