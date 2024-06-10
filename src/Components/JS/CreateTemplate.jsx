import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  List,
  Typography,
  Row,
  Col,
  notification,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as mammoth from "mammoth";
import "../CSS/createTemplate.css";

// Register the custom placeholder blot
const Inline = Quill.import("blots/inline");

class PlaceholderBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-placeholder", value);
    node.setAttribute("contenteditable", "false"); // make it non-editable
    node.style.backgroundColor = "#bae7ff";
    node.style.border = "1px solid black"; // add boundary for signature
    node.style.padding = "2px 5px"; // reduced padding
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

  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message: message,
    });
  };

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
    quill.insertText(cursorPos + placeholderName.length + 4, " ");
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
    if (templateName === "") {
      openNotificationWithIcon("error", "Template Name Should not be empty");
    } else {
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
      openNotificationWithIcon("success", "Template Created");

      setTemplate(templateJSON);
    }
  }

  const handlerFileChange = async (file) => {
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

  return (
    <div style={{ padding: "50px", backgroundColor: "#f0f0f0" }}>
      {contextHolder}
      <Row gutter={24}>
        <Col span={16}>
          <Title>Template Creator</Title>
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
          <div
            style={{
              border: "1px solid #d9d9d9",
              // width: "790.7px",
              height: "auto",
              margin: "0 auto",
              backgroundColor: "#fff",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <ReactQuill
              ref={quillRef}
              value={editorContent}
              onChange={setEditorContent}
              theme="snow"
              style={{
                height: "auto", // Allow some padding for toolbars
                width: "90%",
              }}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Title level={4}>Upload Word Document</Title>
            <Upload
              accept=".docx"
              showUploadList={false}
              customRequest={({ file }) => handlerFileChange(file)}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
        </Col>
        <Col span={8}>
          <Title level={5}>Add Placeholder</Title>
          <div>
            <Input
              type="text"
              placeholder="Placeholder Name"
              value={placeholderName}
              onChange={(e) => setPlaceholderName(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Select
              value={placeholderType}
              defaultValue="text"
              style={{ width: 120, marginBottom: 10 }}
              onChange={setPlaceholderType}
              options={[
                { value: "text", label: "Text" },
                { value: "date", label: "Date" },
                { value: "number", label: "Number" },
                { value: "email", label: "Email" },
                { value: "signature", label: "Signature" },
              ]}
            />
            <Button type="primary" onClick={addPlaceholder}>
              Add Placeholder
            </Button>
          </div>
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
            }}
          >
            <Title level={5}>Placeholders</Title>
            <List
              bordered
              dataSource={placeholders}
              renderItem={(placeholder) => (
                <List.Item
                  style={{ padding: "5px 10px" }} // compact list item
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() =>
                        deletePlaceholder(
                          placeholder.placeholderName,
                          placeholder.placeholderType
                        )
                      }
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <Text style={{ fontSize: "14px" }}>
                    {placeholder.placeholderName} ({placeholder.placeholderType}
                    )
                  </Text>
                </List.Item>
              )}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Button type="primary" onClick={generateTemplateJSON}>
              Save
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreateTemplate;
