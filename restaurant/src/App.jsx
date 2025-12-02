import { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Orders from "./pages/Orders/Orders";
import Login from "./pages/Login/Login";
import AddFood from "./pages/AddFood/AddFood";
import ListFood from "./pages/ListFood/ListFood";
import Drones from "./pages/Drones/Drones";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("restaurant-auth");
    if (auth === "true") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear all restaurant-related localStorage
    localStorage.removeItem("restaurant-auth");
    localStorage.removeItem("restaurant-token");
    localStorage.removeItem("restaurant-email");
    localStorage.removeItem("restaurant-name");
    localStorage.removeItem("restaurant-code");
    
    setIsAuthorized(false);
    window.location.href = "/";
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
                <Route path="/drones" element={<Drones />} />
                <Route path="/add-food" element={<AddFood />} />
                <Route path="/list-food" element={<ListFood />} />
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
