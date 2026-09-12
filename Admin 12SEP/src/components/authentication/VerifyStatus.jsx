import React from "react";
import { useSelector } from "react-redux";
import PendingVerification from "./PendingVerification";

const VerifyStatus = ({ children }) => {
  const { user } = useSelector((store) => store.auth);

  if (user && user.role !== "Admin" && (user.verificationStatus === "pending" || user.verificationStatus === "rejected")) {
    return <PendingVerification user={user} />;
  }

  return <>{children}</>;
};

export default VerifyStatus;
