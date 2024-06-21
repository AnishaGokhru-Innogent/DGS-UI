import React, { useState } from "react";
import "../CSS/chooseCreateTemplate.css";
import { Button, Col, Row, Tooltip, Typography, Upload, message } from "antd";
import { UploadOutlined, FileAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import image from "../Images/mainImage3.jpg";

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
    <div>
      <h1 className="d-flex justify-content-center mt-2">Create Template</h1>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Row gutter={[16, 16]} justify="center" align="middle">
          <Col>
            <Row>
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
            </Row>
            <Row className="d-flex justify-content-center">
              <Tooltip title="Upload Word Document and insert the placeholder">
                <Typography.Link href="#API">Need Help? </Typography.Link>
              </Tooltip>
            </Row>
          </Col>
          <Col>
            <Row>
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
            </Row>
            <Row className="d-flex justify-content-center">
              <Tooltip title="Create Document Template from the scratch">
                <Typography.Link href="#API">Need Help? </Typography.Link>
              </Tooltip>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}
