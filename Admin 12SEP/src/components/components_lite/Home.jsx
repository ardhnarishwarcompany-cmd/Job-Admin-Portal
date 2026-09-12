import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Header from "./Header";
import Categories from "./Categories";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, error } = useGetAllJobs();
  const allJobs = useSelector((state) => state.job?.allJobs || []);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "Recruiter") {
      navigate("/recruiter/dashboard");
    }
  }, [user, navigate]);

  return (
    <div>
      <Navbar />
      <Header />
      <Categories />

      {/* Loading skeleton */}
      {loading && (
        <section className="bg-white py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-xl bg-slate-200" />
                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-slate-200 mb-2" />
                      <div className="h-3 w-20 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-5 w-48 rounded bg-slate-200 mb-2" />
                  <div className="h-3 w-full rounded bg-slate-100 mb-1" />
                  <div className="h-3 w-3/4 rounded bg-slate-100 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                    <div className="h-6 w-14 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Error state */}
      {error && !loading && (
        <section className="bg-white py-16 px-4 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-bold text-slate-700">Could not load jobs</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </section>
      )}

      {/* Jobs */}
      {!loading && !error && <LatestJobs />}

      <Footer />
    </div>
  );
};

export default Home;
