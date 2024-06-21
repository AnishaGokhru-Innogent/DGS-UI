import React, { useState } from "react";
import "../CSS/Login.css";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { Input, Button, Form, message } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import img from "../Images/docuImage.jpg";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [size, setSize] = useState("large");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginData = {
    email: email,
    password: password,
  };
  const navigate = useNavigate();

  const handleLogin = async () => {
    await axios
      .post("http://localhost:8080/api/v1/auth/login", loginData)
      .then((response) => {
        var token = response.data.token;
        var userId = response.data.user;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId);
          message.success("Login Success");
          navigate("/home");
          dispatch(login(token));
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Login Failed");
      });
  };
  return (
    <div className="main d-flex align-items-center justify-content-center">
      <div className="loginBox d-flex">
        <div className="leftSection d-flex flex-column align-items-center">
          <Form onFinish={handleLogin} style={{ marginTop: "40px" }}>
            <h1
              className="text-center"
              style={{
                fontFamily: "Karben 205",
                fontWeight: "700",
                fontSize: "54px",
              }}
            >
              Welcome
            </h1>
            <p className="text-center">We are glad to see you back with us</p>
            <div
              className="d-flex flex-column justify-content-center mt-4"
              style={{ width: "280px" }}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    pattern:"[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$",
                    message: "Enter a valid email address",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Email"
                  prefix={<MailOutlined />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "270px" }}
                />
              </Form.Item>
              <Form.Item
                // name="password"
                rules={[
                  // {
                  //   min: 8,
                  //   message: "Password must be at least 8 character",
                  // },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Password"
                  prefix={<LockOutlined />}
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "270px" }}
                />
              </Form.Item>
              <Form.Item style={{ margin: "0" }}>
                <p style={{ margin: "0", padding: "0", marginTop: "-21px" }}>
                  Forgot Password ?
                </p>
              </Form.Item>
              <Form.Item className="text-center" style={{ margin: "0" }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<LockOutlined />}
                  size={size}
                  style={{ width: "280px", backgroundColor: "#01606F" }}
                >
                  Login
                </Button>
              </Form.Item>
              {/* <Form.Item className="text-center">
                <p className="mt-3">
                  Don't Have an Account ?{" "}
                  <span style={{ color: "#589A65", fontWeight: "700" }}>
                    SignUp
                  </span>
                </p>
              </Form.Item> */}
            </div>
          </Form>
        </div>
        <div className="rightSection d-flex align-items-center">
          <div className="image"></div>
        </div>
      </div>
    </div>
  );
};
export default Login;
