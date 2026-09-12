import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { Check, ChevronDown, RotateCcw, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const filterData = [
  {
    filterType: "Location",
    id: "location",
    array: ["Delhi", "Mumbai", "Kolhapur", "Pune", "Bangalore", "Hyderabad", "Chennai", "Noida", "Gurgaon", "Remote"],
  },
  {
    filterType: "Technology / Skills",
    id: "technology",
    array: ["MERN", "React", "Node.js", "Python", "Java", "Angular", "Vue", "Data Science", "Fullstack", "Frontend", "Backend", "Mobile", "DevOps", "Cloud", "AI/ML"],
  },
  {
    filterType: "Experience Level",
    id: "experience",
    array: ["Fresher (0-1 yr)", "0-3 years", "3-5 years", "5-7 years", "7-10 years", "10-15 years", "15+ years"],
  },
  {
    filterType: "Salary Range",
    id: "salary",
    array: ["0-3 LPA", "3-6 LPA", "6-10 LPA", "10-15 LPA", "15-25 LPA", "25 LPA+"],
  },
  {
    filterType: "Job Type",
    id: "jobType",
    array: ["Full-Time", "Part-Time", "Contract", "Internship", "Freelance"],
  },
  {
    filterType: "Work Mode",
    id: "workMode",
    array: ["Work From Office", "Work From Home", "Hybrid", "Remote"],
  },
  {
    filterType: "Industry",
    id: "industry",
    array: ["IT / Software", "Finance", "Healthcare", "Education", "E-commerce", "Startup", "Manufacturing", "Media"],
  },
];

const emptyFilters = {
  location: [],
  technology: [],
  experience: [],
  salary: [],
  jobType: [],
  workMode: [],
  industry: [],
};

const FilterCard = () => {
  const dispatch = useDispatch();
  const [selectedFilters, setSelectedFilters] = useState(emptyFilters);
  const [customLocation, setCustomLocation] = useState("");
  const [customExperience, setCustomExperience] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    technology: true,
    experience: true,
    salary: true,
    jobType: false,
    workMode: false,
    industry: false,
  });

  const handleToggle = (categoryId, value) => {
    setSelectedFilters((prev) => {
      const current = prev[categoryId] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [categoryId]: updated };
    });
  };

  const clearFilters = () => setSelectedFilters(emptyFilters);

  const toggleSection = (categoryId) => {
    setExpandedSections(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  useEffect(() => {
    dispatch(setSearchedQuery(selectedFilters));
  }, [selectedFilters, dispatch]);

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="font-black text-lg text-slate-900 dark:text-white">Filters</h1>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-5">
        {filterData.map((data) => (
          <div key={data.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
            <button
              onClick={() => toggleSection(data.id)}
              className="flex items-center justify-between w-full group mb-1"
            >
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[14px] text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                  {data.filterType}
                </h2>
                {selectedFilters[data.id]?.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40 text-[9px] font-bold text-blue-700 dark:text-blue-400">
                    {selectedFilters[data.id].length}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expandedSections[data.id] ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSections[data.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-2">
                    {data.id === "location" && (
                      <div className="mb-3 relative">
                        <input
                          type="text"
                          placeholder="Type city & press Enter"
                          className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 pl-3 pr-8 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customLocation.trim()) {
                              e.preventDefault();
                              if (!selectedFilters.location?.includes(customLocation.trim())) {
                                handleToggle("location", customLocation.trim());
                              }
                              setCustomLocation("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-slate-400 dark:text-slate-500 hover:text-blue-600"
                          onClick={() => {
                            if (customLocation.trim() && !selectedFilters.location?.includes(customLocation.trim())) {
                              handleToggle("location", customLocation.trim());
                              setCustomLocation("");
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {data.id === "location" && selectedFilters.location?.filter(loc => !data.array.includes(loc)).map((loc, idx) => (
                      <label key={`custom-loc-${idx}`} className="flex items-center group cursor-pointer">
                        <input type="checkbox" className="hidden" checked={true} onChange={() => handleToggle(data.id, loc)} />
                        <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md border flex-shrink-0 transition-colors border-blue-600 bg-blue-600">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                        <span className="ml-2.5 text-sm font-semibold text-slate-900 dark:text-white">{loc}</span>
                      </label>
                    ))}

                    {data.id === "experience" && (
                      <div className="mb-3 relative">
                        <input
                          type="text"
                          placeholder="Type custom exp (e.g. 12 years) & press Enter"
                          className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 pl-3 pr-8 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          value={customExperience}
                          onChange={(e) => setCustomExperience(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customExperience.trim()) {
                              e.preventDefault();
                              if (!selectedFilters.experience?.includes(customExperience.trim())) {
                                handleToggle("experience", customExperience.trim());
                              }
                              setCustomExperience("");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-slate-400 dark:text-slate-500 hover:text-blue-600"
                          onClick={() => {
                            if (customExperience.trim() && !selectedFilters.experience?.includes(customExperience.trim())) {
                              handleToggle("experience", customExperience.trim());
                              setCustomExperience("");
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {data.id === "experience" && selectedFilters.experience?.filter(exp => !data.array.includes(exp)).map((exp, idx) => (
                      <label key={`custom-exp-${idx}`} className="flex items-center group cursor-pointer">
                        <input type="checkbox" className="hidden" checked={true} onChange={() => handleToggle(data.id, exp)} />
                        <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md border flex-shrink-0 transition-colors border-blue-600 bg-blue-600">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                        <span className="ml-2.5 text-sm font-semibold text-slate-900 dark:text-white">{exp}</span>
                      </label>
                    ))}

                    {data.array.map((item, idx) => {
                      const isChecked = selectedFilters[data.id]?.includes(item);
                      return (
                        <label key={idx} className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={() => handleToggle(data.id, item)}
                          />
                          <div className={`flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-md border flex-shrink-0 transition-colors ${isChecked ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 group-hover:border-blue-400"}`}>
                            {isChecked && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <span className={`ml-2.5 text-sm ${isChecked ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterCard;
