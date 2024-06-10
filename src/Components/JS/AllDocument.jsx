import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import { Button, Space, Table, Tag, notification } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { render } from "@testing-library/react";

export function Alldocument() {
  const [documents, setDocuments] = useState();

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  async function getDocumentsOfUser(Id) {
    await axios
      .get(`${baseUrl}/document/get-documents/${Id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setDocuments(data))
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    getDocumentsOfUser(userId);
  }, []);
  // console.log(documents);
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message: message,
    });
  };
  async function DeleteDocument(id) {
    await axios
      .delete(`${baseUrl}/document/delete-doc/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => {
        openNotificationWithIcon("success", `Document Deleted Successfully`);
      })
      .catch((error) => {
        openNotificationWithIcon("error", `Error Occured in Deletion`);
      });
    setDocuments(documents.filter((doc) => doc.documentId !== id));
  }
  console.log(documents);

  async function DeleteDocument(id) {
    await axios
      .delete(`${baseUrl}/document/delete-doc/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => {
        openNotificationWithIcon("success", `Document Deleted Successfully`);
      })
      .catch((error) => {
        openNotificationWithIcon("error", `Error Occured in Deletion`);
      });
    setDocuments(documents.filter((doc) => doc.documentId !== id));
  }

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "Document Name",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      render: (text) => {
        if (text.createdAt) {
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
    },
    {
      title: "Status",
      // dataIndex: "status",
      key: "Status",
      render: (_, record) => {
        let color = "magenta";
        if (record.status === "SIGNED") {
          color = "geekblue";
        }
        return (
          <Tag color={color} style={{ fontSize: "20px" }}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "use",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              navigate(`/document/${record.documentId}`);
            }}
          >
            See
          </Button>
        </Space>
      ),
    },
    {
      title: "",
      key: "use",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            onClick={() => {
              DeleteDocument(record.documentId);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h2>All Document</h2>
      {contextHolder}
      <div className="mt-4">
        <Table
          dataSource={documents}
          columns={columns}
          borderColor="black"
          scroll={{
            x: "100%",
            y: 330,
          }}
        />
      </div>
    </div>
  );
}
