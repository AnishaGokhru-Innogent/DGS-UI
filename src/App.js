import "./App.css";
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
import { ChooseCreateTemplate } from "./Components/JS/ChooseCreateTemplate";
import { Alldocument } from "./Components/JS/AllDocument";
import { FinalDocument } from "./Components/JS/FinalDocument";
import EditTemplate from "./Components/JS/EditTemplate";
import { AccessTemplates } from "./Components/JS/AccessTemplates";
import HomePage from "./Components/JS/HomePage";

function App() {
  return (
    <>
      <ToastContainer />
      <>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="/sign/:documentId/:placeholder/:email"
            element={
              // <PrivateRoute>
              <Signature />
              // </PrivateRoute>
            }
          ></Route>
          {/* <Route path='/home' element={<Home />}></Route> */}
          {/* <Route path='/register' element={<Register/>}></Route> */}

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {/* <Route path='/register' element={<Register/>}></Route> */}
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
          {/* <Route
            path="/document/:id"
            element={
              // <PrivateRoute>
              <Seedocument />
              // </PrivateRoute>
           */}
          <Route path="/document/:id" element={<Seedocument />} />
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
            }
          />
          <Route
            path="/final-document/:documentId"
            element={<FinalDocument />}
          />
          {/* <Route path="/edit-template/:templateId" element={<EditTemplate />} />
          <Route path="/access-template" element={<AccessTemplates />} /> */}
          {/* <Route path="/homePage" element={<HomePage/>}></Route> */}
        </Routes>
      </>
    </>
  );
}

export default App;
