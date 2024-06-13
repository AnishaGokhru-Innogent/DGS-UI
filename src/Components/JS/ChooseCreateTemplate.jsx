import React, { useState } from "react";
import { Button, Col, Row, Upload, message } from "antd";
import { UploadOutlined, FileAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export function ChooseCreateTemplate({ setCurrentView, setUploadedFile }) {
  const buttonStyle = {
    padding: "20px",
    width: "300px",
    height: "150px",
    borderRadius: "8px",
    margin: "20px",
    border: "1px solid #d9d9d9",
    backgroundColor: "#fafafa",
    boxSizing: "border-box",
    fontSize: "18px",
    letterSpacing: "1px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s",
  };

  const handleFileChange = (file) => {
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setUploadedFile(file);
      setCurrentView("CreateTemplate");
    } else {
      message.error("Please upload a valid Word document (.docx)");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "60vh" }}
    >
      <Row gutter={[16, 16]} justify="center" align="middle">
        <Col>
          <Upload
            accept=".docx"
            showUploadList={false}
            customRequest={({ file }) => handleFileChange(file)}
          >
            <Button
              // type="primary"
              style={buttonStyle}
              className="d-flex justify-content-center align-items-center"
              icon={
                <UploadOutlined
                  style={{ fontSize: "24px", marginRight: "10px" }}
                />
              }
            >
              Upload Word File
            </Button>
          </Upload>
        </Col>
        <Col>
          <Button
            onClick={() => setCurrentView("CreateTemplate")}
            danger
            style={buttonStyle}
            className="d-flex justify-content-center align-items-center"
            icon={
              <FileAddOutlined
                style={{ fontSize: "24px", marginRight: "10px" }}
              />
            }
          >
            Create
          </Button>
        </Col>
      </Row>
    </div>
  );
}
