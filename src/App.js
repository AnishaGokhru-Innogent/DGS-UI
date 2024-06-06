import "./App.css";
import ModalSignature from "./ModalSignature";
import Signature from "./Components/JS/Signature";
import Home from "./Components/JS/Home";
import Register from "./Components/JS/Register";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Components/JS/Login";
import CreateTemplate from "./Components/JS/CreateTemplate";
import { CreateDocument } from "./Components/JS/CreateDocument";

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/sign" element={<Signature />}></Route>
          <Route path="/home" element={<Home />}></Route>
          {/* <Route path='/register' element={<Register/>}></Route> */}
          <Route path="/create-template" element={<CreateTemplate />} />
          <Route path="/create-document/:id" element={<CreateDocument />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
