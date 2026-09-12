import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components_lite/Navbar";
import { motion } from "framer-motion";
import { Check, X, Zap, Star, Crown } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_API_ENDPOINT } from "@/utils/data";

const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      id: 1,
      name: "Starter",
      icon: Zap,
      price: billingCycle === "monthly" ? 29 : 290,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Perfect for individuals",
      color: "from-blue-500 to-blue-600",
      features: [
        { name: "AI Resume Screening", included: true },
        { name: "Email Campaigns", included: true },
        { name: "Basic Analytics", included: true },
        { name: "Interview Scheduling", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Branding", included: false },
        { name: "API Access", included: false },
      ],
    },
    {
      id: 2,
      name: "Professional",
      icon: Star,
      price: billingCycle === "monthly" ? 79 : 790,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "Best for growing teams",
      color: "from-sky-500 to-sky-600",
      features: [
        { name: "AI Resume Screening", included: true },
        { name: "Email Campaigns", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Interview Scheduling", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Branding", included: false },
        { name: "API Access", included: false },
      ],
      recommended: true,
    },
    {
      id: 3,
      name: "Enterprise",
      icon: Crown,
      price: billingCycle === "monthly" ? 199 : 1990,
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "For large organizations",
      color: "from-amber-500 to-amber-600",
      features: [
        { name: "AI Resume Screening", included: true },
        { name: "Email Campaigns", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Interview Scheduling", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Branding", included: true },
        { name: "API Access", included: true },
      ],
    },
  ];

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleBuyClick = async (planName) => {
    try {
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error("Could not load Razorpay checkout. Please check your internet connection.");
      const orderRes = await axios.post(
        `${PAYMENT_API_ENDPOINT}/create-order`,
        { planName, billingCycle },
        { withCredentials: true }
      );
      if (!orderRes.data?.success) throw new Error(orderRes.data?.message || "Could not create payment order.");
      const { keyId, order, plan } = orderRes.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "ArdhnariShwar Job Portal",
        description: `${plan.name} — ${plan.billingCycle} plan`,
        order_id: order.id,
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const verify = await axios.post(`${PAYMENT_API_ENDPOINT}/verify`, response, { withCredentials: true });
            if (verify.data?.success) toast.success("Payment successful! Your plan is active.");
            else toast.error(verify.data?.message || "Payment verification failed.");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: { ondismiss: () => toast.info("Payment window closed.") },
      });
      rzp.on("payment.failed", (response) => toast.error(response?.error?.description || "Payment failed."));
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not start payment.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-sky-900 to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Choose the perfect plan for your recruitment needs
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly"
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setBillingCycle(
                  billingCycle === "monthly" ? "yearly" : "monthly"
                )
              }
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-gradient-to-r from-sky-600 to-blue-600"
            >
              <motion.div
                className="inline-block h-6 w-6 transform rounded-full bg-white"
                animate={{
                  x: billingCycle === "yearly" ? 32 : 4,
                }}
              />
            </motion.button>
            <span
              className={`text-sm font-medium ${
                billingCycle === "yearly"
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full"
              >
                Save 20%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 lg:gap-6"
        >
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                whileHover="hover"
                className={`relative rounded-2xl overflow-hidden ${
                  plan.recommended ? "md:scale-105" : ""
                }`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-5`}
                />

                {/* Card Content */}
                <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl h-full flex flex-col">
                  {plan.recommended && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold rounded-full"
                    >
                      RECOMMENDED
                    </motion.div>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${plan.color}`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-white">
                        ₹{plan.price}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuyClick(plan.name)}
                    className={`w-full py-3 rounded-lg font-bold text-white mb-8 transition-all ${
                      plan.recommended
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    Get Started Now
                  </motion.button>

                  {/* Features */}
                  <div className="space-y-3 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-white"
                              : "text-gray-500 line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            Questions? We have answers
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan anytime.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, get 14 days free trial with no credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards and digital payment methods.",
              },
              {
                q: "Is there a long-term contract?",
                a: "No, all plans are month-to-month or yearly with cancel anytime.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-xl text-left"
              >
                <h4 className="font-bold text-white mb-2">{item.q}</h4>
                <p className="text-gray-300 text-sm">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPlans;
