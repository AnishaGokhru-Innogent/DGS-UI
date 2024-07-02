import React, { useEffect, useState } from "react";
import "../CSS/HomePage.css";
import homeImg from "../Images/homeImg.jpg";
import { Button } from "antd";
import axios from "axios";
import baseUrl from "../../BootApi";
import { PlusOutlined } from "@ant-design/icons";
const HomePage = ({ setCurrentView, user }) => {
  useEffect(() => {
    countTemplate();
    countDocument();
    countAccessTemplate();
  }, []);

  const [countTemplates, setCountTemplates] = useState();
  const [countDocuments, setCountDocuments] = useState();
  const [countAccessTemplates , setCountAccessTemplates] = useState();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const currentDate = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = days[currentDate.getDay()];
  const month = months[currentDate.getMonth()];
  const date = currentDate.getDate();
  const year = currentDate.getFullYear();
  const dateString = `${day}, ${date} ${month} ${year}`;

  const countTemplate = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/template/countTemplate/${userId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      // console.log(response.data);
      setCountTemplates(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const countDocument = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/document/countDocument/${userId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      //  console.log(response.data);
      setCountDocuments(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const countAccessTemplate = async ()=>{
    try{
       const response = await axios.get(`${baseUrl}/accessControl/countAccessTemplate/${userId}`,{
         headers:{Authorization:`Bearer ${bearerToken}`}
       });
       setCountAccessTemplates(response.data);
      //  console.log(response.data);
    }catch(error){
       console.log(error);
    }
    
  }
  const handleStarting = ()=>{
    setCurrentView("New Tempalte")
  }
  return (
    <div style={{ padding: "0", margin: "0" }}>
      <div className="mainBox">
        <div className="heading">
          <p className="mt-5">{dateString}</p>
          <h2 style={{fontFamily:"script"}}>Hello , <span style={{color:"#01606F",fontWeight:"500",fontSize:"40px"}}>{user.firstName}</span></h2>
        </div>
        <div className="content-box">
          <div className="f1">
            <h6>Total Documents</h6>
            <h4 style={{color: "rgb(74, 170, 142)"}}>{countDocuments}</h4>
          </div>
          <div className="f1">
            <h6>Total Templates</h6>
            <h4 style={{color: "rgb(244, 67, 54)"}}>{countTemplates}</h4>
          </div>
          <div className="f1">
            <h6>Shared With Me</h6>
            <h4 style={{color: "rgb(255, 152, 0)"}}>{countAccessTemplates}</h4>
          </div>
        </div>
        <div className="button" style={{marginTop:"50px",marginLeft:"65px"}}>
           <Button onClick={handleStarting} icon={<PlusOutlined/>}type="primary" style={{backgroundColor:"#01606F"}}>Create Template</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
