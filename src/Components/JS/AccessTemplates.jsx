import { Button, Popconfirm, Space, Table, message } from "antd";
import axios from "axios";
import baseUrl from "../../BootApi";
import { useEffect, useState } from "react";
import { log } from "util";
import moment from "moment";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons";

export function AccessTemplates() {
  const [templates, setTemplates] = useState([]);
  const [access, setAccess] = useState([]);
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");

  async function getAccessAndTemplates() {
    try {
      const [templatesResponse, accessResponse] = await Promise.all([
        axios.get(`${baseUrl}/accessControl/access-template/${userId}`, {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }),
        axios.get(`${baseUrl}/accessControl/access/${userId}`, {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }),
      ]);
      setTemplates(templatesResponse.data);
      setAccess(accessResponse.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAccessAndTemplates();
  }, []);

  const mergedData = templates.map((template) => {
    const accessDetails =
      access.find((a) => a.template === template.templateId) || {};
    return { ...template, ...accessDetails };
  });

  console.log(mergedData);

  const checkEditAccess = (access) => {
    return access !== "ALL" && access !== "EDIT";
  };

  const checkUseAccess = (access) => {
    return access !== "ALL";
  };

  const checkAccessAccess = (access) => {
    return access !== "ALL" && access !== "SHARE";
  };

  const handleEditClick = (templateId) => {
    // const encryptedTemplateId = encryptTemplateId(templateId);
    // navigate(`/edit-template/${encryptedTemplateId}`);
    // setTemplateId(templateId);
    // setCurrentView("EditTemplate");
  };

  const handleUseClick = (templateId) => {
    // const encryptedTemplateId = encryptTemplateId(templateId);
    // navigate(`/create-document/${encryptedTemplateId}`);
  };

  function handleAccessClick(templateId) {
    // setVisible(true);
    // setAccessTemplateId(templateId);
    // getAllUserForAccess();
  }
  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
      width: "80px",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Created By",
      dataIndex: "ownerName",
      key: "templateName",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      render: (text) => {
        if (text) {
          const formattedDate = moment(text.createdAt).format("YYYY-MM-DD");
          const formattedTime = moment(text.createdAt).format("hh:mm A");
          return (
            <span>
              {formattedDate}
              <br />
              {formattedTime}
            </span>
          );
        }
        return null;
      },
      sorter: (a, b) => moment(b.createdAt).diff(moment(a.createdAt)),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            style={{ backgroundColor: "#01606F", color: "white" }}
            disabled={checkEditAccess(record.templateAccess)}
            onClick={() => handleEditClick(record.templateId)}
          >
            Edit
          </Button>
          <Button
            icon={<FileImageOutlined />}
            style={{ backgroundColor: "#01606F", color: "white" }}
            disabled={checkUseAccess(record.templateAccess)}
            onClick={() => handleUseClick(record.templateId)}
          >
            Use
          </Button>
          <Button
            disabled={checkAccessAccess(record.templateAccess)}
            onClick={() => handleAccessClick(record.templateId)}
          >
            Access
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h1>Access Templates</h1>
      <div>
        <Table dataSource={mergedData} columns={columns} />
      </div>
    </div>
  );
}
