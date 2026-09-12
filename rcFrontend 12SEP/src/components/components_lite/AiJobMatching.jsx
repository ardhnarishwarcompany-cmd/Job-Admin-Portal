import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BriefcaseBusiness,
  IndianRupee,
  LocateFixed,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "./Navbar";

const initialForm = {
  about: "",
  skills: "",
  experience: "",
  expectedSalary: "",
  preferredLocation: "",
  industry: "",
};

const splitWords = (value) =>
  value
    .toLowerCase()
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const getJobText = (job) =>
  [
    job.title,
    job.description,
    job.location,
    job.jobType,
    job.industry,
    job.company?.name,
    job.requirements?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getNumber = (value) => {
  const number = Number(String(value || "").match(/\d+(\.\d+)?/)?.[0]);
  return Number.isNaN(number) ? 0 : number;
};

const AiJobMatching = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const reduxJobs = useSelector((store) => store.job?.allJobs || []);
  const jobs = reduxJobs;
  const [form, setForm] = useState(initialForm);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    if (user) {
      let profileData = null;
      if (user.candidateProfile) {
        try {
          profileData = typeof user.candidateProfile === "string" 
            ? JSON.parse(user.candidateProfile) 
            : user.candidateProfile;
        } catch (e) {
          console.error("Failed to parse candidateProfile", e);
        }
      }
      
      let rawSkills = user.skills || user.profile?.skills || "";
      if (Array.isArray(rawSkills)) {
        rawSkills = rawSkills.map(s => typeof s === 'object' && s !== null ? (s.skill || s.name || "") : String(s)).filter(Boolean).join(", ");
      } else if (profileData?.skills) {
        rawSkills = profileData.skills.map(s => s.skill).filter(Boolean).join(", ");
      }

      setForm({
        about: user.profile?.bio || profileData?.personal?.bio || "",
        skills: rawSkills,
        experience: String(user.experience || profileData?.experience?.total || ""),
        expectedSalary: String(profileData?.career?.salary?.expected || ""),
        preferredLocation: user.city || profileData?.personal?.city || "",
        industry: profileData?.career?.industry || "",
      });
    }
  }, [user]);

  const matches = useMemo(() => {
    if (!hasSearched) return [];

    const skills = splitWords(form.skills);
    const industry = form.industry.trim().toLowerCase();
    const location = form.preferredLocation.trim().toLowerCase();
    const expectedSalary = getNumber(form.expectedSalary);
    const experience = getNumber(form.experience);

    return jobs
      .map((job) => {
        const jobText = getJobText(job);
        const jobSalary = getNumber(job.salary);
        const jobExperience = getNumber(job.experienceLevel || job.experience);

        let score = 0;
        score += skills.filter((skill) => jobText.includes(skill)).length * 25;
        if (industry && jobText.includes(industry)) score += 20;
        if (location && job.location?.toLowerCase().includes(location)) score += 20;
        if (expectedSalary && jobSalary && jobSalary >= expectedSalary) score += 15;
        if (experience && jobExperience && jobExperience <= experience + 1) score += 10;
        if (!skills.length && !industry && !location && !expectedSalary && !experience) {
          score = 0;
        }

        return { ...job, matchScore: Math.min(score, 100) };
      })
      .filter((job) => job.matchScore >= 25)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [form, hasSearched, jobs]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <section className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
            <Sparkles size={16} />
            AI Job Matching
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Find jobs that match your profile
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Tell me about yourself, add your filters, and get matching jobs from available openings.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200/70 sm:p-6"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Tell me About YourSelf</h2>
                <p className="text-sm text-slate-500">Fill details for better matches</p>
              </div>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">About Yourself</span>
              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                rows="4"
                placeholder="Example: I am a React developer looking for frontend roles..."
                className="w-full resize-none rounded-lg border px-4 py-3 text-sm text-slate-800"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Your Skills</span>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, Node, Java"
                  className="w-full rounded-lg border px-4 py-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Experience</span>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="2 years"
                  className="w-full rounded-lg border px-4 py-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Expected Salary</span>
                <input
                  name="expectedSalary"
                  value={form.expectedSalary}
                  onChange={handleChange}
                  placeholder="6 LPA"
                  className="w-full rounded-lg border px-4 py-3 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred Location</span>
                <input
                  name="preferredLocation"
                  value={form.preferredLocation}
                  onChange={handleChange}
                  placeholder="Remote, Pune, Delhi"
                  className="w-full rounded-lg border px-4 py-3 text-sm"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Industry</span>
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm"
              >
                <option value="">Select Industry</option>
                <option value="IT">IT</option>
                <option value="Software">Software</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Human Resource">Human Resource</option>
                <option value="Healthcare">Healthcare</option>
              </select>
            </label>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
            >
              <Search size={18} />
              Find My Matches
            </button>
          </form>

          <div className="border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200/70 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Your Job Matches</h2>
                <p className="text-sm text-slate-500">
                  {hasSearched
                    ? `${matches.length} matching job${matches.length === 1 ? "" : "s"} found`
                    : "Your matching jobs will appear here"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {jobs.length} jobs scanned
              </div>
            </div>

            {!hasSearched ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 text-center">
                <div>
                  <Sparkles className="mx-auto mb-4 text-teal-600" size={36} />
                  <h3 className="text-lg font-bold text-slate-900">Ready when you are</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Add your skills, experience, salary, location, and industry to see relevant job matches.
                  </p>
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-rose-200 bg-rose-50 px-5 text-center">
                <div>
                  <Search className="mx-auto mb-4 text-rose-500" size={36} />
                  <h3 className="text-lg font-bold text-slate-900">No Matching Jobs Found</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try adding more skills, changing location, or lowering expected salary.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid max-h-[720px] gap-4 overflow-y-auto pr-1">
                {matches.map((job) => (
                  <article
                    key={job._id || job.id || job.title}
                    className="border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-semibold text-teal-700">
                          {job.company?.name || "Top Company"}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-950">{job.title}</h3>
                      </div>
                      <span className="w-fit rounded-lg bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">
                        {job.matchScore}% Match
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {job.description || "A role matching your skills and career preferences."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                        <LocateFixed size={15} />
                        {job.location || "Remote"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                        <IndianRupee size={15} />
                        {job.salary || "Not disclosed"}{String(job.salary || "").toLowerCase().includes("lpa") ? "" : " LPA"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                        <BriefcaseBusiness size={15} />
                        {job.experienceLevel || job.experience || "Fresh"} yrs
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => job._id && navigate(`/description/${job._id}`)}
                      className="mt-4 border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                    >
                      View Job
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AiJobMatching;
