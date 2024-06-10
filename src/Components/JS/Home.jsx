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
import Register from "./Register";
import AllUser from "./AllUser";
const { Header, Sider, Content } = Layout;
const Home = () => {
  const navigate = useNavigate();
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
  }, []);

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
  const renderContentUser = () => {
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

  const renderContentAdmin = () => {
    switch (currentView) {
      case "Home":
        return <Register />;
      case "AllUser":
        return <AllUser />;
      case "LogOut":
        return logOut();
      default:
        return <Register />;
    }
  };

  // console.log(user);
  const userMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: `${user.firstName}`,
      style: { color: "white", fontSize: "18px" },
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
  ];

  const adminMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: `${user.firstName}`,
      style: { color: "white", fontSize: "18px" },
    },
    {
      key: "2",
      label: "DocMaster",
      style: { color: "white", fontSize: "21px" },
    },
    {
      key: "Home",
      icon: <HomeOutlined />,
      label: "Home",
      style: { color: "white" },
    },
    {
      key: "AllUser",
      icon: <UserOutlined />,
      label: "All User",
      style: { color: "white" },
    },
    {
      key: "LogOut",
      icon: <LogoutOutlined />,
      label: "LogOut",
      style: { color: "white" },
    },
  ];

  //  console.log(user);
  const menuItems = user.role === "ADMIN" ? adminMenuItems : userMenuItems;
  const renderContent =
    user.role === "ADMIN" ? renderContentAdmin : renderContentUser;
  return (
    <Layout style={{ height: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          style={{ backgroundColor: "#01606F", height: "100vh" }}
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[currentView]}
          onClick={({ key }) => setCurrentView(key)}
          items={menuItems}
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
