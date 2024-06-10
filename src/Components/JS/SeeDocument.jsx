import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import baseUrl from "../../BootApi";
import { log } from "util";

export function Seedocument() {
  const bearerToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [document, setDocument] = useState();
  const [signatures, setSignatures] = useState();

  const { id } = useParams();

  async function getDocumentAndSignature(id) {
    await axios
      .get(`${baseUrl}/document/getDocument/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setDocument(data))
      .catch((error) => console.log(error));

    await axios
      .get(`${baseUrl}/signature/getSignature/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setSignatures(data))
      .catch((error) => console.log(error));
  }
  useEffect(() => {
    getDocumentAndSignature(id);
  }, []);
  console.log(signatures);
  return (
    <div>
      <h1>Document</h1>
    </div>
  );
}
