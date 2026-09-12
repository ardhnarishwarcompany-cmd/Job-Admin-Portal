import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allJobs: [],
  allAdminJobs: [], // This will hold
  singleJob: null, // This will hold the job details when a user clicks on a job
  searchJobByText: "",
  searchJobByText: "",
  allAppliedJobs: [],
  searchedQuery: "",
  savedJobs: [], // This will hold the saved jobs from the backend
  savedJobIds: [], // This will just hold the IDs for quick lookup (like a set)
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setAllJobs(state, action) {
      // Normalise: always ensure _id exists (MySQL returns id, not _id)
      state.allJobs = (action.payload || []).map((j) => ({
        ...j,
        _id: j._id || String(j.id || ""),
      }));
    },
    setSingleJob(state, action) {
      state.singleJob = action.payload;
    },
    setAllAdminJobs(state, action) {
      state.allAdminJobs = (action.payload || []).map((j) => ({
        ...j,
        _id: j._id || String(j.id || ""),
      }));
    },
    setSearchJobByText(state, action) {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs(state, action) {
      state.allAppliedJobs = action.payload;
    },
    setSearchedQuery(state, action) {
      state.searchedQuery = action.payload;
    },
    setSavedJobs(state, action) {
      state.savedJobs = (action.payload || []).map((j) => ({
        ...j,
        _id: j._id || String(j.id || ""),
      }));
      state.savedJobIds = state.savedJobs.map(j => String(j._id));
    },
    toggleSavedJobId(state, action) {
      const id = String(action.payload);
      if (state.savedJobIds.includes(id)) {
        state.savedJobIds = state.savedJobIds.filter(jId => jId !== id);
        state.savedJobs = state.savedJobs.filter(j => String(j._id) !== id);
      } else {
        state.savedJobIds.push(id);
      }
    },
    updateJobStatus(state, action) {
      const { jobId, status } = action.payload;
      const jobInAll = state.allJobs.find(j => String(j._id) === String(jobId));
      if (jobInAll) jobInAll.status = status;
      
      const jobInAdmin = state.allAdminJobs.find(j => String(j._id) === String(jobId));
      if (jobInAdmin) jobInAdmin.status = status;
      
      if (state.singleJob && String(state.singleJob._id) === String(jobId)) {
        state.singleJob.status = status;
      }
    }
  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllAdminJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setSavedJobs,
  toggleSavedJobId,
  updateJobStatus
} = jobSlice.actions;
export default jobSlice.reducer;
