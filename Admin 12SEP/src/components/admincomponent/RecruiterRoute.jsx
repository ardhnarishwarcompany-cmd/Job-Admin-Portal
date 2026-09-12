import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RecruiterRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
    else if (!["Recruiter", "Client"].includes(user.role)) navigate("/");
  }, [user, navigate]);

  if (!user || !["Recruiter", "Client"].includes(user.role)) return null;
  return <>{children}</>;
};

export default RecruiterRoute;
