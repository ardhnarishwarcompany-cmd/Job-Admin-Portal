import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { MessageCircle, Search, CheckCircle2, Shield, Mail, Clock4, XCircle } from "lucide-react";

const ContactRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/contact/requests`, { withCredentials: true })
      .then((res) => {
        const requests = Array.isArray(res.data.requests) ? res.data.requests : [];
        setRequests(
          requests.map((request) => ({
            ...request,
            _id: request._id || String(request.id || request.ID || ""),
            id: request.id || request._id || request.ID || "",
          }))
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error("Unable to load contact requests.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/contact/requests/${id}/resolve`, {}, { withCredentials: true });
      setRequests((prev) => prev.map((item) => (item._id === id || item.id === id ? res.data.request : item)));
      toast.success("Request marked resolved.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to update request status.");
    }
  };

  const filteredRequests = requests.filter((item) => {
    const searchTerm = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm) ||
      item.topic?.toLowerCase().includes(searchTerm) ||
      item.message?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <AdminLayout title="Contact Requests" description="Review messages sent by users and resolve support requests." icon={MessageCircle}>
      <div className="w-full">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, topic or message..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-28 rounded-3xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              <Shield className="mx-auto mb-4 h-12 w-12 text-blue-500" />
              <p className="font-semibold">No contact requests found.</p>
              <p className="text-sm text-slate-400">Once users submit messages, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">{request.status}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Topic: {request.topic || "General"}</span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{request.name}</p>
                        <p className="text-sm text-slate-500">{request.email}</p>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{request.message}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
                        <div className="font-semibold">Submitted</div>
                        <div className="mt-1 text-xs text-slate-400">{new Date(request.createdAt).toLocaleString()}</div>
                      </div>
                      <button
                        disabled={request.status === "Closed"}
                        onClick={() => handleResolve(request._id)}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${request.status === "Closed"
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {request.status === "Closed" ? "Resolved" : "Mark Resolved"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </AdminLayout>
  );
};

export default ContactRequests;
