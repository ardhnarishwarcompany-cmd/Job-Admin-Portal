import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { LayoutTemplate, Sparkles, Download } from "lucide-react";

const CvBuilder = () => {
  const navigate = useNavigate();

  // Force this page to always render in light mode
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => {
      if (hadDark) html.classList.add("dark");
    };
  }, []);

  return (
    <div className="theme-force-light min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto my-8 px-4 sm:my-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CV Builder</h1>
          <p className="text-lg text-gray-600">Create professional, ATS-friendly CVs that stand out to employers with our AI-powered builder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 mb-4">
              <LayoutTemplate className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3 Professional Templates</h3>
            <p className="text-gray-600">Choose from Modern, Classic ATS-Safe, or Professional two-column templates.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-green-600 mb-4">
              <Sparkles className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real AI ATS Score</h3>
            <p className="text-gray-600">Get a real-time, AI-generated ATS score with matched/missing keywords and improvement tips.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-sky-600 mb-4">
              <Download className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload &amp; Download PDF</h3>
            <p className="text-gray-600">Upload an existing resume PDF to auto-fill fields, preview your CV live, and download it as a PDF.</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/cv-maker')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Start Building Your CV
          </button>
        </div>
      </div>
    </div>
  );
};

export default CvBuilder;
