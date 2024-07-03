import React, { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../../BootApi";
import { Avatar, Button, Descriptions } from "antd";
const ColorList = ["#f56a00", "#01606F", "#ffbf00", "#00a2ae"];
const MyProfile = () => {
  const [user, setUser] = useState({});
  const [department, setDepartment] = useState({});
  const [designation, setDesignation] = useState({});
  const [userLetter, setUserLetter] = useState("");
  useEffect(() => {
    const id = localStorage.getItem("userId");
    getUserById(id);
  }, []);
  useEffect(() => {
    if (user.departmentId) {
      getDeptById();
    }
    if (user.designationId) {
      getDesById();
    }
    if (user.firstName) {
      setUserLetter(user.firstName.charAt(0));
    }
  }, [user]);
  const bearerToken = localStorage.getItem("token");
  const getUserById = async (id) => {
    const response = await axios.get(`${baseUrl}/api/v1/users/getUser/${id}`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    setUser(response.data);
  };

  const getDeptById = async () => {
    const id = user.departmentId;
    const response = await axios.get(`${baseUrl}/department/getDept/${id}`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    setDepartment(response.data);
  };
  const getDesById = async () => {
    const id = user.designationId;
    const response = await axios.get(`${baseUrl}/designation/getDes/${id}`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    setDesignation(response.data);
  };

  const [color, setColor] = useState(ColorList[3]);

  return (
    <>
      <div className="">
        <div
          className="d-flex"
          style={{
            width: "1080px",
            gap: "20px",
            marginTop: "50px",
            height: "150px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            padding: "30px 23px",
            marginLeft: "25px",
          }}
        >
          <div>
            <Avatar
              style={{
                backgroundColor: color,
                verticalAlign: "middle",
                fontSize: "35px",
              }}
              size={90}
            >
              {userLetter}
            </Avatar>
          </div>
          <div className="mt-2">
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p>{user.email}</p>
          </div>
        </div>
        <Descriptions
          className="mt-4"
          style={{
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            height: "250px",
            width: "1080px",
            marginLeft: "25px",
            padding: "35px 35px",
          }}
          labelStyle={{ fontSize: "18px" }}
        >
          <div className="custom-title" span={3}>
            <h3 style={{ fontSize: "24px" }}>
              More Information
            </h3>
          </div>
          <Descriptions.Item label="Manager" span={3}>
            <span style={{ fontSize: "18px" }}>{user.manager}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Department" span={3}>
            <span style={{ fontSize: "18px" }}>
              {department.departmentName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Designation">
            <span style={{ fontSize: "18px" }}>
              {designation.designationName}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </>
  );
};

export default MyProfile;
