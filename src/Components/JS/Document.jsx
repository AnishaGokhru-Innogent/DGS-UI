import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import baseUrl from "../../BootApi";

export function Seedocument() {
  const bearerToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [document, setDocument] = useState({});

  const { id } = useParams();

  async function getDocument(id) {
    await axios
      .get(`${baseUrl}/document/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setDocument(data))
      .catch((error) => console.log(error));
  }
  useEffect(() => {
    getDocument(id);
  }, []);
  return (
    <div>
      <h1>Document</h1>
    </div>
  );
}
