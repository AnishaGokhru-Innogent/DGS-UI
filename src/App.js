import "./App.css";
import ModalSignature from "./ModalSignature";
import Signature from "./Components/JS/Signature";
import Home from "./Components/JS/Home";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Components/JS/Login";
import CreateTemplate from "./Components/JS/CreateTemplate";
import { CreateDocument } from "./Components/JS/CreateDocument";
import { Seedocument } from "./Components/JS/SeeDocument";
import { Provider } from "react-redux";
import PrivateRoute from "./Components/redux/PrivateRoute";
import store from "./Components/redux/store";

function App() {
  return (
    <>
      <ToastContainer />
      <>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="/sign/:documentId/:placeholder"
            element={
              // <PrivateRoute>
              <Signature />
              // </PrivateRoute>
            }
          ></Route>
          {/* <Route path='/home' element={<Home />}></Route> */}
          {/* <Route path='/register' element={<Register/>}></Route> */}

          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {/* <Route path='/register' element={<Register/>}></Route> */}
<<<<<<< HEAD
          <Route
            path="/create-template"
            element={
              <PrivateRoute>
                <CreateTemplate />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-document/:id"
            element={
              <PrivateRoute>
                <CreateDocument />
              </PrivateRoute>
            }
          />
          <Route
            path="/sign/:documentId/:placeholder"
            element={<Signature />}
          ></Route>
          <Route
            path="/document/:id"
            element={
              // <PrivateRoute>
              <Seedocument />
              // </PrivateRoute>
=======
          <Route
            path="/create-template"
            element={
              <PrivateRoute>
                <CreateTemplate />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-document/:id"
            element={
              <PrivateRoute>
                <CreateDocument />
              </PrivateRoute>
            }
          />
          <Route
            path="/document/:id"
            element={
              <PrivateRoute>
                <Seedocument />
              </PrivateRoute>
>>>>>>> 933d1a15dffa25821d9063ceab2d14f38a4394b8
            }
          />
        </Routes>
      </>
    </>
  );
}

export default App;
