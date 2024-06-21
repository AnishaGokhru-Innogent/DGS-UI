import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
// import baseUrl from "../../Components/JS/BootApi"
const { Option } = Select;
const Register = () => {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [form] = Form.useForm();
  const bearerToken = localStorage.getItem("token");

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    form.resetFields();
    resetState();
  };
  const resetState = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setDepartmentName("");
    setDesignationName("");
  };
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/department/getAll",
        { headers: { Authorization: `Bearer ${bearerToken}` } }
      );
      setDepartments(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
  const fetchDesignations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/designation/getAll",
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDesignations(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };
  const getDepartmentIdByName = async (name) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/department/getByName/${name}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      return response.data.departmentId;
    } catch (error) {
      console.error("Error fetching department by name:", error);
      toast.error("Department Not Found");
      return null;
    }
  };

  const getDesignationByName = async (name) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/designation/getByName/${name}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      return response.data.designationId;
    } catch (error) {
      console.error("Error fetching designation by name:", error);
      toast.error("Designation Not Found");
      return null;
    }
  };
  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const handleRegister = async () => {
    const departmentId = await getDepartmentIdByName(departmentName);
    const designationId = await getDesignationByName(designationName);
    // if (!departmentId || !designationId) {
    //     toast.error("Invalid department or designation");
    //     return;
    // }
    console.log(designationId);
    console.log(departmentId);
    const registerData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      departmentId: departmentId,
      designationId: designationId,
    };
    console.log("Register data:", registerData);
    try {
      await axios.post(
        "http://localhost:8080/api/v1/auth/register",
        registerData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Register Success");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Register Failed");
    }
  };
  return (
    <>
      <Button
        type="primary"
        onClick={showDrawer}
        icon={<PlusOutlined />}
        style={{ backgroundColor: "#01606F" }}
      >
        Create New User
      </Button>
      <Drawer
        title="Create a new account"
        width={600}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              style={{ backgroundColor: "#01606F", color: "white" }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstname"
                label="First Name"
                rules={[
                  {
                    required: true,
                    message: "Please Enter First name",
                  },
                ]}
              >
                <Input
                  placeholder="Please Enter First Name"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                label="Last Name"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Last name",
                  },
                ]}
              >
                <Input
                  placeholder="Please Enter Last name"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[
                  {
                    required: true,
                    message: "Please select an department",
                  },
                ]}
              >
                <Select
                  placeholder="Please select an department"
                  onChange={(value) => setDepartmentName(value)}
                >
                  {departments.map((dep) => (
                    <Option key={dep.departmentName} value={dep.departmentName}>
                      {dep.departmentName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[
                  {
                    required: true,
                    message: "Please choose the designation",
                  },
                ]}
              >
                <Select
                  placeholder="Please choose the designation"
                  onChange={(value) => setDesignationName(value)}
                >
                  {designations.map((des) => (
                    <Option
                      key={des.designationName}
                      value={des.designationName}
                    >
                      {des.designationName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Email",
                  },
                ]}
              >
                <Input
                  placeholder="Please Enter Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Password",
                  },
                ]}
              >
                <Input
                  placeholder="Please Enter Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="role"
                label="Role"
                rules={[
                  {
                    required: true,
                    message: "Please select an role",
                  },
                ]}
              >
                <Select placeholder="Please select an role">
                  <Option value="admin">ADMIN</Option>
                  <Option value="user">USER</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default Register;
