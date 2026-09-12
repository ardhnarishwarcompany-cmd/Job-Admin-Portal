export const USER_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/user`;
export const JOB_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/job`;
export const APPLICATION_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/application`;
export const COMPANY_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/company`;
export const NOTIFICATION_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/notifications`;
export const AI_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/ai`;
export const MESSAGING_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/messaging`;
export const ADMIN_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/admin`;
export const COMPLAINT_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/complaints`;
export const RECRUITER_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/recruiter`;
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getFileUrl = (filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const baseUrl = API_URL;
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `${baseUrl}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
};

export const PAYMENT_API_ENDPOINT = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/payments`;
