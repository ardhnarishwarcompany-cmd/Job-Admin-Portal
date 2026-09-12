import express from "express";
import crypto from "crypto";
import axios from "axios";
import authenticateToken from "../middleware/isAuthenticated.js";
import connection from "../utils/db.js";
import { User } from "../models/user.model.js";
import { sendPaymentConfirmationEmail } from "../utils/mailer.js";

const router = express.Router();

const PLAN_AMOUNTS = {
  // India Candidate (INR)
  "AI CV analysis": { amount: 9900, currency: "INR" },
  "Premium CV Maker": { amount: 29900, currency: "INR" },
  "Premium profile": { amount: 49900, currency: "INR" },
  "AI Interview preparation": { amount: 19900, currency: "INR" },
  "Career consultation": { amount: 99900, currency: "INR" },

  // India Employer (INR)
  "Basic": { amount: 99900, currency: "INR" },
  "Professional": { amount: 299900, currency: "INR" },
  "Premium": { amount: 599900, currency: "INR" },
  "Monthly Recruiter": { amount: 999900, currency: "INR" },
  "Enterprise": { amount: 2500000, currency: "INR" },

  // Overseas Employer (USD)
  "International job posting": { amount: 9900, currency: "USD" },
  "Featured international job": { amount: 19900, currency: "USD" },
  "CV database": { amount: 49900, currency: "USD" },
  "AI shortlisting": { amount: 9900, currency: "USD" },
  "AI interview": { amount: 1500, currency: "USD" },
  "Recruitment Package": { amount: 99900, currency: "USD" },

  // Overseas Candidate (USD)
  "AI CV analysis - Global": { amount: 500, currency: "USD" },
  "Premium CV Maker - Global": { amount: 1000, currency: "USD" },
  "Premium profile - Global": { amount: 2000, currency: "USD" },
  "AI Interview prep - Global": { amount: 1500, currency: "USD" },
  "Career consultation - Global": { amount: 4900, currency: "USD" },
};

const PLAN_NAMES = Object.keys(PLAN_AMOUNTS);
const normalizeCycle = (v) => String(v || "monthly").toLowerCase() === "yearly" ? "yearly" : "monthly";

const getPlanDetails = (planName, billingCycle) => {
  const plan = PLAN_AMOUNTS[planName];
  if (!plan) return null;
  // Apply yearly multiplier if it's a subscription plan (Monthly Recruiter, Enterprise, CV database, Premium profile)
  const isSubscription = ["Monthly Recruiter", "Enterprise", "CV database", "Premium profile"].includes(planName);
  const finalAmount = (isSubscription && normalizeCycle(billingCycle) === "yearly") ? plan.amount * 10 : plan.amount;
  return { amount: finalAmount, currency: plan.currency };
};

const requireKeys = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error("Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend .env file.");
    err.statusCode = 503;
    throw err;
  }
};

router.post("/create-order", authenticateToken, async (req, res) => {
  try {
    requireKeys();
    const planName = String(req.body.planName || "").trim();
    const billingCycle = normalizeCycle(req.body.billingCycle);
    const planDetails = getPlanDetails(planName, billingCycle);
    if (!PLAN_NAMES.includes(planName) || !planDetails) {
      return res.status(400).json({ success:false, message:"Invalid pricing plan." });
    }

    const { amount, currency } = planDetails;

    const receipt = `arp_${Date.now()}_${req.id}`.slice(0, 40);
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      { amount, currency, receipt, notes: { planName, billingCycle, userId: String(req.id) } },
      { auth: { username: process.env.RAZORPAY_KEY_ID, password: process.env.RAZORPAY_KEY_SECRET }, timeout: 15000 }
    );

    await connection.promise().query(
      `INSERT INTO jobportal_payments (user_id, plan_name, billing_cycle, amount, currency, razorpay_order_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'created')`,
      [req.id, planName, billingCycle, amount, currency, response.data.id]
    );

    res.json({
      success:true,
      keyId:process.env.RAZORPAY_KEY_ID,
      order:{ id:response.data.id, amount:response.data.amount, currency:response.data.currency },
      plan:{ name:planName, billingCycle },
    });
  } catch (error) {
    console.error("Razorpay create order error:", error.response?.data || error.message);
    res.status(error.statusCode || 500).json({ success:false, message:error.response?.data?.error?.description || error.message || "Could not create Razorpay order." });
  }
});

router.post("/verify", authenticateToken, async (req, res) => {
  try {
    requireKeys();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success:false, message:"Incomplete Razorpay payment response." });
    }

    const [rows] = await connection.promise().query(
      `SELECT * FROM jobportal_payments WHERE razorpay_order_id = ? AND user_id = ? LIMIT 1`,
      [razorpay_order_id, req.id]
    );
    const payment = rows[0];
    if (!payment) return res.status(404).json({ success:false, message:"Payment order not found." });

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const providedSignature = Buffer.from(String(razorpay_signature));
    const expectedSignature = Buffer.from(expected);
    const valid = providedSignature.length === expectedSignature.length && crypto.timingSafeEqual(expectedSignature, providedSignature);
    if (!valid) return res.status(400).json({ success:false, message:"Payment signature verification failed." });

    await connection.promise().query(
      `UPDATE jobportal_payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, payment.id]
    );

    const user = await User.findById(req.id);
    if (user?.email) {
      sendPaymentConfirmationEmail(user.email, user.fullname || user.name || "there", payment.plan_name, payment.billing_cycle, Number(payment.amount)/100)
        .catch((e) => console.error("Payment confirmation email failed:", e.message));
    }

    const io = req.app.get("io");
    if (io) io.to(`user:${req.id}`).emit("payment_success", { planName: payment.plan_name, billingCycle: payment.billing_cycle, paymentId: razorpay_payment_id });

    res.json({ success:true, message:`${payment.plan_name} plan payment successful.`, data:{ planName:payment.plan_name, billingCycle:payment.billing_cycle, paymentId:razorpay_payment_id } });
  } catch (error) {
    console.error("Razorpay verify error:", error.message);
    res.status(500).json({ success:false, message:"Could not verify payment." });
  }
});

router.get("/history", authenticateToken, async (req,res)=>{
  try {
    const [rows] = await connection.promise().query(
      `SELECT id, plan_name, billing_cycle, amount, currency, razorpay_order_id, razorpay_payment_id, status, created_at, paid_at
       FROM jobportal_payments WHERE user_id = ? ORDER BY created_at DESC`, [req.id]
    );
    res.json({success:true,data:rows});
  } catch(e) {
    res.status(500).json({success:false,message:"Could not load payment history."});
  }
});

export default router;
