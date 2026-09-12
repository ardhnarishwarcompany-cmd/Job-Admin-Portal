import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ children, title, description, icon: Icon, noPadding = false }) => {
  const sidebarCollapsed = useSelector((state) => state.auth.sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 overflow-hidden font-sans">
      <AdminSidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 w-full min-h-screen overflow-hidden ${
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
        }`}
      >
        <AdminHeader />
        
        <main className={`flex-1 overflow-y-auto overflow-x-hidden ${noPadding ? "" : "p-4 sm:p-6 lg:p-8"}`}>
          <div className="mx-auto max-w-7xl w-full h-full flex flex-col">
            {(title || description) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4 }}
                className={`mb-6 flex-shrink-0 ${noPadding ? "p-4 sm:p-6 lg:p-8 pb-0 mb-0" : ""}`}
              >
                <h1 className="flex items-center gap-2 font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {Icon && <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />}
                  {title}
                </h1>
                {description && <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">{description}</p>}
              </motion.div>
            )}
            
            {/* The actual content passed into the layout */}
            <div className="flex-1 flex flex-col w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
