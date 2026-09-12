import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.role !== "Admin") {
      window.location.href = "http://localhost:5173/";
    }
  }, [user, navigate]);

  if (!user || user.role !== "Admin") {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
