import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import {
  Button,
  Space,
  Table,
  notification,
  Popconfirm,
  message,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons";

export function AllTemplate() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");

  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, msg) => {
    api[type]({
      message: msg,
    });
  };

  const getTemplate = async () => {
    try {
      const response = await axios.get(`${baseUrl}/template/all/${userId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
      openNotificationWithIcon("error", "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTemplate();
  }, []);

  const deleteTemplate = async (id) => {
    try {
      await axios.delete(`${baseUrl}/template/deleteTemplate/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      message.success("Template deleted successfully");
      setTemplates((prevTemplates) =>
        prevTemplates.filter((temp) => temp.templateId !== id)
      );
    } catch (error) {
      message.error("Template not deleted");
    }
  };

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
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
            icon={<FileImageOutlined />}
            style={{ backgroundColor: "#01606F", color: "white" }}
            onClick={() => navigate(`/create-document/${record.templateId}`)}
          >
            Use
          </Button>
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
            onConfirm={() => deleteTemplate(record.templateId)}
            onCancel={() => message.error("Click on No")}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Templates</h2>
      {contextHolder}
      <Spin spinning={loading}>
        <div
          className="mt-4"
          style={{
            marginTop: "20px",
          }}
        >
          <Table
            dataSource={templates}
            columns={columns}
            rowKey="templateId"
            bordered
            scroll={{
              x: "100%",
              y: 330,
            }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Spin>
    </div>
  );
}
