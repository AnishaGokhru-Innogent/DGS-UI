import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import { Button, Space, Table, notification,Popconfirm,message } from "antd";
import moment from "moment";

export function Alldocument() {
  const [documents, setDocuments] = useState();

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
  console.log(documents);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message: message,
    });
  };
  const cancel = (e) => {
    console.log(e);
    message.error('Click on No');
  };
  async function DeleteDocument(id) {
    await axios
      .delete(`${baseUrl}/document/delete-doc/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => {
        message.success("Document Deleted Succesfully");
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "Status",
    },
    {
      title: "",
      key: "use",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              // navigate(`/create-document/${record.templateId}`);
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
        <Popconfirm
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={() => DeleteDocument(record.documentId)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
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
