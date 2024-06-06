import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";

export function Alltemplate() {
  const [templates, setTemplates] = useState([]);
  const [userId, setUserId] = useState(102); //we will use this for getting user object from database
  async function getTempalte() {
    await axios
      .get(`${baseUrl}/template/all`, userId) //we have to extract userId
      .then((response) => response.data)
      .then((data) => setTemplates(data))
      .catch((error) => console.log(error));
  }
  useEffect(() => {
    getTempalte();
  }, []);

  return (
    <div>
      <h1>All Templates</h1>
      <div></div>
    </div>
  );
}
