import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  List,
  Typography,
  Row,
  Col,
  Tooltip,
} from "antd";
import { SaveOutlined, BookOutlined } from "@ant-design/icons";
import axios from "axios";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import mammoth from "mammoth";
import "../CSS/createTemplate.css";
import { log } from "util";

// Register the custom placeholder blot
const Inline = Quill.import("blots/inline");
class PlaceholderBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-placeholder", value);
    node.setAttribute("contenteditable", "false");
    node.style.backgroundColor = "#e6f3ff";
    // node.style.border = "1px solid black";
    node.style.borderRadius = "2px";
    node.style.padding = "1px 1px";
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

const { Title, Text } = Typography;

const CreateTemplate = ({ uploadedFile }) => {
  const [placeholders, setPlaceholders] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [placeholderName, setPlaceholderName] = useState("");
  const [placeholderType, setPlaceholderType] = useState("text");
  const [cursorPosition, setCursorPosition] = useState(null);
  const [template, setTemplate] = useState({});
  const [resTemplate, setResTemplate] = useState({});
  const [templateName, setTemplateName] = useState(null);
  const quillRef = useRef(null);
  const userid = localStorage.getItem("userId");
  const [userId, setUserId] = useState(userid);
  const bearerToken = localStorage.getItem("token");

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.focus();
      const editor = quillRef.current.getEditor();
      const editorElement = editor.container.firstChild;
      editorElement.style.minHeight = "50vh";
    }
  }, []);

  useEffect(() => {
    if (Object.keys(template).length > 0) {
      saveTemplate();
    }
  }, [template]);

  useEffect(() => {
    handleChange();
  }, []);

  useEffect(() => {
    if (uploadedFile) {
      handleFileChange(uploadedFile);
    }
  }, [uploadedFile]);

  const handleChange = () => {
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
  };

  const handleKeyDown = (event) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (!range) return;

    const [leaf] = quill.getLeaf(range.index - 1);

    if (event.key === "Enter") {
      if (
        leaf &&
        leaf.domNode &&
        leaf.domNode.classList &&
        leaf.domNode.classList.contains("placeholder-blot")
      ) {
        event.preventDefault();
        quill.insertText(range.index, "\n");
        quill.setSelection(range.index + 1);
      } else {
        quill.insertText(range.index, "\n");
        quill.setSelection(range.index + 1);
      }
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      if (
        leaf &&
        leaf.domNode &&
        leaf.domNode.classList &&
        leaf.domNode.classList.contains("placeholder-blot")
      ) {
        const placeholderName = leaf.domNode.getAttribute("data-placeholder");
        setPlaceholders((prevPlaceholders) =>
          prevPlaceholders.filter(
            (placeholder) => placeholder.placeholderName !== placeholderName
          )
        );
        quill.deleteText(
          range.index - placeholderName.length - 4,
          placeholderName.length + 4
        );
        event.preventDefault();
      }
    }
  };

  async function saveTemplate() {
    await axios
      .post("http://localhost:8080/template/create", template, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data, message.success("Template Saved"))
      .then((res) => setResTemplate(res))
      .catch(
        (error) => console.log(error)
        // message.error("Error Occured In Saving Tempalte")
      );
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

  const handleFileChange = async (file) => {
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
      message.error("Please upload a valid Word document (.docx)");
    }
  };

  function generateTemplateJSON() {
    if(templateName===null){
      message.warning("Please input valid Template Name");
      return;
    }
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
  }

  return (
    <div style={{ margin: "20px" }}>
      <Row gutter={24}>
        <Col span={16}>
          <div
            style={{
              backgroundColor: "#01606F",
              color: "white",
              textAlign: "center",
              borderRadius: "10px",
              padding: "1px",
            }}
          >
            <h4 className="mt-1">Create a New Template</h4>
          </div>
          <div style={{ marginTop: "20px" }}>
            <Form.Item
              label="Template Name"
              name="Template Name"
              rules={[{ required: true, message: "Please input!" }]}
            >
              <Input
                placeholder="Enter Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ width: "590px" }}
              />
            </Form.Item>
          </div>
          <div
            style={{
              backgroundColor: "white",
              height: "calc(90vh - 200px)",
              overflow: "auto",
            }}
          >
            <ReactQuill
              ref={quillRef}
              value={editorContent}
              onChange={setEditorContent}
              theme="snow"
              style={{
                height: "auto",
                width: "100%",
                minHeight: "50vh",
                overflow: "auto",
              }}
              modules={{
                toolbar: {
                  container: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ size: [] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [
                      { list: "ordered" },
                      { list: "bullet" },
                      { indent: "-1" },
                      { indent: "+1" },
                    ],
                    ["link", "image", "video"],
                    ["code-block"],
                    ["clean"],
                  ],
                },
                clipboard: {
                  matchVisual: false,
                },
              }}
            />
          </div>
        </Col>
        <Col span={7}>
          <Tooltip title="Create an template and place the placeholders by inputing their name and selecting in placeholder type. In order to delete an placeholder just click behind the placeholder and press backspace">
            <Typography.Link href="#API">How to use this? </Typography.Link>
          </Tooltip>
          <Title level={5}>Add Placeholder</Title>
          <div style={{ marginTop: "12px" }}>
            <Input
              type="text"
              placeholder="Placeholder Name"
              value={placeholderName}
              onChange={(e) => setPlaceholderName(e.target.value)}
              style={{ marginBottom: 10, width: "180px" }}
            />
            <Select
              value={placeholderType}
              defaultValue="text"
              style={{ width: 100, marginBottom: 10 }}
              onChange={setPlaceholderType}
              options={[
                { value: "text", label: "Text" },
                { value: "date", label: "Date" },
                { value: "number", label: "Number" },
                { value: "email", label: "Email" },
                { value: "signature", label: "Signature" },
              ]}
            />
            <Button
              style={{
                backgroundColor: "#01606F",
                color: "white",
                marginTop: "10px",
              }}
              onClick={addPlaceholder}
              icon={<BookOutlined />}
            >
              Add Placeholder
            </Button>
          </div>
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #D9D9D9",
              borderRadius: "4px",
            }}
          >
            <Title level={5}>Placeholders</Title>
            <List
              bordered
              dataSource={placeholders}
              renderItem={(placeholder) => (
                <List.Item style={{ padding: "5px 10px" }}>
                  <Text style={{ fontSize: "14px" }}>
                    {placeholder.placeholderName} ({placeholder.placeholderType}
                    )
                  </Text>
                </List.Item>
              )}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Button
              style={{ backgroundColor: "#01606F", color: "white" }}
              onClick={generateTemplateJSON}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreateTemplate;
