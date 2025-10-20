import { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Login from "./pages/Login/Login";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("restaurant-auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("restaurant-auth");
    setIsAuthorized(false);
    navigate("/");
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Slide}
      />
      {isAuthorized ? (
        <>
          <Navbar onLogout={handleLogout} />
          <hr style={{ margin: 0, border: 0, borderTop: '1px solid #e5e7eb' }} />
          <div className="app-content">
            <Sidebar />
            <div className="inner-body">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders/*" element={<Orders />} />
                <Route path="/orders/new" element={<Orders />} />
                <Route path="/orders/preparing" element={<Orders />} />
                <Route path="/orders/ready" element={<Orders />} />
                <Route path="/orders/completed" element={<Orders />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
