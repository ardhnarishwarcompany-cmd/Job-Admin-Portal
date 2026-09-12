import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Edit2, Building2, Calendar, Globe } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector((store) => store.company);
  const navigate = useNavigate();
  const [filterCompany, setFilterCompany] = useState(companies);

  useEffect(() => {
    const filtered = companies.filter((company) => {
      if (!searchCompanyByText) return true;
      return company.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
    });
    setFilterCompany(filtered);
  }, [companies, searchCompanyByText]);

  if (!companies) return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  if (filterCompany.length === 0) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Building2 className="h-16 w-16 mb-4 opacity-20" />
      <p className="font-semibold">No companies found</p>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence>
        {filterCompany.map((company) => (
          <motion.div
            key={company._id || company.id}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5, boxShadow: "0 16px 32px rgba(109,40,217,0.1)" }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:border-blue-300 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                  {company.logo ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={company.logo} alt={company.name} />
                    </Avatar>
                  ) : (
                    <Building2 className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{company.name}</h3>
                  {company.location && (
                    <p className="text-xs text-slate-500 mt-0.5">{company.location}</p>
                  )}
                </div>
              </div>
            </div>

            {company.website && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 truncate transition-colors">
                  {company.website}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="h-3 w-3" /> {company.createdAt?.split("T")[0]}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/recruiter/companies/${company._id}`)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:shadow-blue-200 transition-all"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompaniesTable;
