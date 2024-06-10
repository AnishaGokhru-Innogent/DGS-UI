import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import { render } from "@testing-library/react";
import { Button, Space, Table, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { log } from "util";
import moment from "moment";

export function Alltemplate() {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();
  const userid = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const [userId, setUserId] = useState(userid); //we will use this for getting user object from database

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message: message,
    });
  };
  async function getTemplate() {
    await axios
      .get(`${baseUrl}/template/all/${userId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }) //we have to extract userId
      .then((response) => response.data)
      .then((data) => setTemplates(data))
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    getTemplate();
  }, []);

  console.log(templates);

  async function DeleteTemplate(Id) {
    await axios
      .delete(`${baseUrl}/template/deleteTemplate/${Id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => {
        openNotificationWithIcon("success", `Template Deleted Successfully`);
      })
      .catch((error) => {
        openNotificationWithIcon("error", `Template Not Deleted`);
      });
    setTemplates(templates.filter((temp) => temp.templateId !== Id));
  }

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "Template Name",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      render: (text) => {
        if (text) {
          const formattedDate = moment(text.createdAt).format("YYYY-MM-DD");
          const formattedTime = moment(text.createdAt).format("hh:mm:ss");
          return (
            <span>
              {formattedDate}
              <br />
              {formattedTime}
            </span>
          );
        }
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
              navigate(`/create-document/${record.templateId}`);
            }}
          >
            Use
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
              DeleteTemplate(record.templateId);
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
      <h2>All Templates</h2>
      {contextHolder}
      <div className="mt-4" >
        <Table dataSource={templates} columns={columns} borderColor="black"
             scroll={{
              x: '100%',
              y: 330,  
            }}
            
        
        />
      </div>
    </div>
  );
}
