import multer from "multer";
import fs from "fs";

const uploadDir = "uploads";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const singleUpload = multer({ storage }).single("file");

// Job Application Uploads - supports standard resume and audio introduction
export const applicationUpload = multer({ storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "audioIntro", maxCount: 1 }
]);

// Used by the multi-step Candidate / Recruiter / Job-posting wizards, which can
// submit several files at once (profile photo, resume, certification files,
// verification docs, a short video intro, company logo, etc).
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });
export const multiUpload = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "videoIntro", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 },
  { name: "certificationFiles", maxCount: 10 },
  { name: "verificationDocs", maxCount: 10 },
]);

// Chat attachments (images/PDFs shared inside a conversation) — 10MB cap, single file.
const chatUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/i;
    cb(null, allowed.test(file.mimetype) || allowed.test(file.originalname));
  },
});
export const chatAttachmentUpload = chatUpload.single("attachment");

// AI Interview answer recordings — one video clip per question, 80MB cap
// (a couple of minutes of webcam video at browser-default bitrate).
const interviewUpload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /webm|mp4|ogg|quicktime/i;
    cb(null, allowed.test(file.mimetype));
  },
});
export const interviewAnswerUpload = interviewUpload.single("answer");
