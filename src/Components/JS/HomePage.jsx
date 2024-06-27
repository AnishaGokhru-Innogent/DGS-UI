
import React, { useEffect, useState } from "react";
import "../CSS/HomePage.css";
import homeImg from "../Images/homeImg.jpg";
import { Button } from "antd";
import axios from "axios";
import baseUrl from "../../BootApi";
import {
 ArrowRightOutlined,
} from "@ant-design/icons";
const HomePage = ({setCurrentView}) => { 
  useEffect(()=>{
    countTemplate();
    countDocument();
  },[]); 

  const [countTemplates ,setCountTemplates] = useState();
  const [countDocuments ,setCountDocuments] = useState();
  const userId = localStorage.getItem("userId"); 
  const bearerToken = localStorage.getItem("token");
  const countTemplate = async()=>{
     try{
        const response = await axios.get(`${baseUrl}/template/countTemplate/${userId}`,{
          headers: { Authorization: `Bearer ${bearerToken}` }
        });
        console.log(response.data);
        setCountTemplates(response.data);
     }
     catch(error){
        console.log(error);
     }
  }
  const countDocument = async()=>{
    try{
       const response = await axios.get(`${baseUrl}/document/countDocument/${userId}`,{
         headers: { Authorization: `Bearer ${bearerToken}` }
       });
       console.log(response.data);
       setCountDocuments(response.data);
    }
    catch(error){
       console.log(error);
    }
 }
 const handleGettingStarted = ()=>{
   console.log("called");
    setCurrentView("New Tempalte")
 }
  return (
    <div style={{padding:"0",margin:"0"}}>
        <div className="mainBox">
                <div className="leftSec">
                    <div className="content"> 
                          <h2>Design Confidently</h2>
                          <p style={{marginTop:"25px"}}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fuga suscipit possimus illo sunt maxime perferendis nihil, ab velit eius quod modi aspernatur esse tempore, amet recusandae, expedita tenetur provident nam?</p>
                          <Button onClick={handleGettingStarted} icon={<ArrowRightOutlined/>} style={{marginTop:"25px",backgroundColor:"#01606F",color:"white",height:"40px"}}>Get Started</Button>
                    </div>
                    <div className="content-box">
                          <div className="f1">
                                <h6>Total Documents</h6>
                                <h5>{countDocuments}</h5>
                          </div>
                          <div className="f2">
                                <h6>Total Templates</h6>
                                <h5>{countTemplates}</h5>
                          </div>
                    </div>
                </div>
                <div className="rightSec">
                    <img src={homeImg}></img>
                </div>
        </div>
    </div>
  );
}

export default HomePage;
