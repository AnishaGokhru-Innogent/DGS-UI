import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LayoutOutlined,
  PlusOutlined,
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  ContactsOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { Alltemplate } from "./AllTemplates";
import { log } from "util";
import { Alldocument } from "./AllDocument";
import CreateTemplate from "./CreateTemplate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
const { Header, Sider, Content } = Layout;

const Home = () => {
  const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    useEffect(()=>{
        userName();
    },[])
    const userName = async()=>{
        await axios.get(`http://localhost:8080/api/v1/users/getUser/${userId}`).then(
              (response)=>{
                  setUser(response.data);
                //   console.log(response.data);
              }
        ).catch((error)=>{
            console.log(error);
        })
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const [currentView, setCurrentView] = useState("home");
  const dispatch = useDispatch();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const bearerToken = localStorage.getItem("token");

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    userName();
  }, []); // Add an empty dependency array to avoid infinite loop

  const userName = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/users/getUser/${userId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  function logOut() {
    dispatch(logout());
    navigate("/login");
  }

  const renderContent = () => {
    switch (currentView) {
      case "Templates":
        return <Alltemplate />;
      case "My Documents":
        return <Alldocument />;
      case "New Tempalte":
        return <CreateTemplate />;
      case "LogOut":
        return logOut();
      default:
        return <div>Home Content</div>;
    }
  };

  console.log(currentView);

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          style={{ backgroundColor: "#589A65", height: "100vh" }}
          mode="inline"
          defaultSelectedKeys={["1"]}
          onClick={({ key }) => setCurrentView(key)}
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: `${user.firstName}`,
            },
            {
              key: "2",
              label: "DocMaster",
              style: { color: "white", fontSize: "21px" },
            },
            {
              key: "New Tempalte",
              icon: <PlusOutlined />,
              label: "New Template",
              style: { color: "white" },
            },
            {
              key: "4",
              icon: <HomeOutlined />,
              label: "Home",
              style: { color: "white" },
            },
            {
              key: "My Documents",
              icon: <BookOutlined />,
              label: "My Documents",
              style: { color: "white" },
            },
            {
              key: "Templates",
              icon: <LayoutOutlined />,
              label: "Templates",
              style: { color: "white" },
            },
            {
              key: "7",
              icon: <ContactsOutlined />,
              label: "Contact Us",
              style: { color: "white" },
            },
            {
              key: "LogOut",
              icon: <LogoutOutlined />,
              label: "LogOut",
              style: { color: "white" },
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
