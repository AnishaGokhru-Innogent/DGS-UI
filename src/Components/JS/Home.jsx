import React, { useEffect, useState } from "react";
import axios from "axios";
import mainImage from "../Images/mainImage.jpg";
import viewImg from "../Images/emp.png";
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
  LockOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  message,
  FloatButton,
  Flex,
  Dropdown,
  Space,
  Modal,
  Form,
  Input,
  Checkbox,
} from "antd";
import { AllTemplate } from "./AllTemplates";
import { log } from "util";
import { Alldocument } from "./AllDocument";
import CreateTemplate from "./CreateTemplate";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import Register from "./Register";
import AllUser from "./AllUser";
import "../CSS/home.css";
import { ChooseCreateTemplate } from "./ChooseCreateTemplate";
import EditTemplate from "./EditTemplate";
import { SelectTempltes } from "./SelectTemplates";
import MyProfile from "./MyProfile";
import baseUrl from "../../BootApi";

const { Header, Sider, Content } = Layout;

const Home = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const [currentView, setCurrentView] = useState("home");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [templateId, setTemplateId] = useState();
  const [users, setUsers] = useState([]);
  const [department, setDepartment] = useState({});
  const [designation, setDesignation] = useState({});

  const dispatch = useDispatch();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const bearerToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [isModalOpenProfile, setIsModalOpenProfile] = useState(false);

  const showModalProfile = () => {
    setIsModalOpenProfile(true);
  };

  const handleOkProfile = () => {
    setIsModalOpenProfile(false);
  };

  const handleCancelProfile = () => {
    setIsModalOpenProfile(false);
  };
  const myProfile = () => {
    showModalProfile();
    // console.log(user);
    getDeptById();
    getDesById();
  };

  useEffect(() => {
    userName();
  }, []);

  const changePassword = () => {
    showModal();
  };

  const items = [
    {
      key: "1",
      label: (
        <a onClick={myProfile} style={{ textDecoration: "none" }}>
          <UserOutlined /> My Profile
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a style={{ textDecoration: "none" }} onClick={() => changePassword()}>
          <LockOutlined /> Change Password
        </a>
      ),
    },
  ];
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

  const getDeptById = async () => {
    const id = user.departmentId;
    const response = await axios.get(`${baseUrl}/department/getDept/${id}`);
    console.log(response.data);
    setDepartment(response.data);
  };
  const getDesById = async () => {
    const id = user.designationId;
    const response = await axios.get(`${baseUrl}/designation/getDes/${id}`);
    console.log(response.data);
    setDesignation(response.data);
  };
  const onFinish = async (values) => {
    console.log("Success:", values);
    updatePassword(values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const updatePassword = async (values) => {
    try {
      const email = user.email;
      // const email = "harsh@gmail.com";
      const response = await axios.post(
        `http://localhost:8080/api/v1/users/changePassword/${email}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data);
      message.success("Password Updated Successfully");
      handleCancel();
    } catch (error) {
      message.error("Password is not updated");
    }
  };
  function logOut() {
    dispatch(logout());
    navigate("/login");
  }
  const renderContentUser = () => {
    switch (currentView) {
      case "Templates":
        return (
          // <SelectTempltes />
          <AllTemplate
            setCurrentView={setCurrentView}
            setTemplateId={setTemplateId}
          />
        );
      case "Home":
        return (
          <div className="mainImg">
            {/* <img src={mainImage} alt="" className="img" /> */}
          </div>
        );
      case "My Documents":
        return <Alldocument />;
      case "New Tempalte":
        return (
          <ChooseCreateTemplate
            setCurrentView={setCurrentView}
            setUploadedFile={setUploadedFile}
          />
        );
      case "CreateTemplate":
        return <CreateTemplate uploadedFile={uploadedFile} />;
      case "EditTemplate":
        return <EditTemplate templateId={templateId} />;
      case "MyProfile":
        return <MyProfile />;
      case "LogOut":
        return logOut();
      default:
        return <div>{/* <img src={mainImage} alt="" /> */}</div>;
        return <div>Home Content</div>;
    }
  };
  console.log(currentView);

  const renderContentAdmin = () => {
    switch (currentView) {
      case "Home":
        return (
          <>
            <AllUser />
          </>
        );
      case "Templates":
        return (
          <AllTemplate
            setCurrentView={setCurrentView}
            setTemplateId={setTemplateId}
          />
        );
      case "My Documents":
        return <Alldocument />;
      case "New Tempalte":
        return (
          <ChooseCreateTemplate
            setCurrentView={setCurrentView}
            setUploadedFile={setUploadedFile}
          />
        );
      case "CreateTemplate":
        return <CreateTemplate uploadedFile={uploadedFile} />;
      case "EditTemplate":
        return <EditTemplate templateId={templateId} />;
      case "LogOut":
        return logOut();

      default:
        return (
          <>
            <AllUser />
          </>
        );
    }
  };

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
      key: "Home",
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
      key: "New Tempalte",
      icon: <PlusOutlined />,
      label: "New Template",
      style: { color: "white" },
    },
    {
      key: "Home",
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
      key: "LogOut",
      icon: <LogoutOutlined />,
      label: "LogOut",
      style: { color: "white" },
    },
  ];

  const menuItems = user.role === "ADMIN" ? adminMenuItems : userMenuItems;
  const renderContent =
    user.role === "ADMIN" ? renderContentAdmin : renderContentUser;
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject("Please input your password!");
    }
    if (value.length < 8) {
      return Promise.reject("Password must be at least 6 characters long!");
    }
    if (value.length > 12) {
      return Promise.reject("Password cannot exceed 12 characters!");
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one uppercase letter!"
      );
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one lowercase letter!"
      );
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject("Password must contain at least one digit!");
    }
    if (!/[!@#$%^&*]/.test(value)) {
      return Promise.reject(
        "Password must contain at least one special character!"
      );
    }
    return Promise.resolve();
  };
  return (
    <Layout style={{ height: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          className="slideBar"
          style={{ height: "100vh", backgroundColor: "#01606F" }}
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
            position: "relative",
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
          <div
            style={{
              float: "right",
              position: "relative",
              right: "50px",
            }}
          >
            <Dropdown
              menu={{
                items,
              }}
              placement="bottom"
              arrow={{
                pointAtCenter: true,
              }}
            >
              <Button
                icon={<UserOutlined />}
                style={{
                  borderRadius: "50%",
                  height: "40px",
                  width: "50px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              ></Button>
            </Dropdown>
          </div>
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
          <div>
            <Modal
              title="Change Password"
              open={isModalOpen}
              footer={null}
              // onOk={handleOk}
              onCancel={handleCancel}
            >
              <Form
                name="basic"
                labelCol={{
                  span: 8,
                }}
                wrapperCol={{
                  span: 16,
                }}
                style={{
                  maxWidth: 600,
                  maxHeight: 270,
                  // border:"2px solid black",
                  paddingTop: "20px",
                }}
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="Old Password"
                  name="oldPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please input old password!",
                    },
                    {
                      validator: validatePassword,
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please input new password!",
                    },
                    {
                      validator: validatePassword,
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Please input confirm password!",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  wrapperCol={{
                    offset: 8,
                    span: 16,
                  }}
                >
                  <div className="float-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        backgroundColor: "#01606F",
                        marginRight: "20px",
                      }}
                    >
                      Submit
                    </Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                  </div>
                </Form.Item>
              </Form>
            </Modal>
          </div>
          <div>
            <Modal
              title=""
              open={isModalOpenProfile}
              onOk={handleOkProfile}
              onCancel={handleCancelProfile}
              footer={null}
            >
              <div className="viewMoreBox">
                <div className="viewHeading bg-dark">
                  <h4 style={{ fontFamily: "auto" }}>My Profile</h4>
                </div>
                <div className="viewDetail">
                  <div className="viewImg">
                    <img src={viewImg}></img>
                  </div>
                  <div style={{ marginLeft: "50px", marginTop: "28px" }}>
                    <p>
                      <b>First Name</b> : {user.firstName}
                    </p>
                    <p>
                      <b>Last Name</b> : {user.lastName}
                    </p>
                    <p>
                      <b>Email</b> : {user.email}
                    </p>
                    <p>
                      <b>Manger</b> : {user.manager}
                    </p>
                    <p>
                      <b>Department</b> : {department.departmentName}
                    </p>
                    <p>
                      <b>Designation</b> : {designation.designationName}
                    </p>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default Home;
