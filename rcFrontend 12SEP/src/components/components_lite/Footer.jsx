import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from './logo.jpeg';
import { Github, Linkedin, Twitter, Mail, MapPin, Phone, Briefcase, Heart } from "lucide-react";
import { useSelector } from "react-redux";

const Footer = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const getProfileLink = () => {
    if (!user) return "/login";
    return user.role === "Recruiter" ? "/recruiter/profile" : "/profile";
  };

  const handleLinkClick = (to, e) => {
    if (!user && to !== "/") {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 px-2 py-1 text-white text-sm font-black"><img src={logo} alt="logo"/></span>
              <span className="text-xl font-black">Ardhnari<span className="text-blue-400">Shwar</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's #1 AI-powered job portal connecting top talent with leading companies. Find your dream career today.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Github, href: "https://github.com" },
                { Icon: Linkedin, href: "https://linkedin.com" },
                { Icon: Twitter, href: "https://x.com" }
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:bg-blue-500 hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/jobs", label: "Browse Jobs" },
                { to: getProfileLink(), label: "My Profile" },
                { to: "/cv-maker", label: "CV Maker" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={user || link.to === "/" ? link.to : "/login"}
                    onClick={(e) => handleLinkClick(link.to, e)}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-500 group-hover:w-3 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Employers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">For Employers</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/recruiter/dashboard", label: "Recruiter Dashboard" },
                { to: "/recruiter/jobs/create", label: "Post a Job" },
                { to: "/more/pricing-plans", label: "Pricing Plans" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={user ? link.to : "/login"}
                    onClick={(e) => handleLinkClick(link.to, e)}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-blue-500 group-hover:w-3 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                Noida Sector 63 ,H-112,nearby electronic City metro station, Uttar Pradesh, India - 201301
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@recruweb.com" className="hover:text-blue-400 transition-colors">info@recruweb.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <a href="tel:+919334532636" className="hover:text-blue-400 transition-colors">+91 9334532636</a>
              </li>
            </ul>
            <div className="mt-5">
              <Link
                to={user ? "/more/contact-us" : "/login"}
                onClick={(e) => handleLinkClick("/more/contact-us", e)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-bold text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
              >
                <Briefcase className="h-4 w-4" /> Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row"
        >
          <p className="text-sm text-slate-500 flex items-center gap-1">
            &copy; 2026 JobPortal SaaS.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
