import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import {
  KeyRound, Plus, X, Loader2, Ban, RotateCcw, Trash2, Eye, EyeOff,
  ShieldCheck, Clock, Mail, Tag,
} from "lucide-react";

const emptyForm = { label: "", email: "", password: "" };

const AccessKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ADMIN_API_ENDPOINT}/access-keys`, { withCredentials: true });
      if (res.data.success) setKeys(res.data.keys);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not load login IDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.email.trim() || !form.password) {
      toast.error("Fill in label, email and password.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${ADMIN_API_ENDPOINT}/access-keys`, form, { withCredentials: true });
      if (res.data.success) {
        toast.success("Login ID created — it signs in to this same admin account.");
        setForm(emptyForm);
        setShowForm(false);
        fetchKeys();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not create login ID");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (key) => {
    setBusyId(key.id);
    try {
      const action = key.is_active ? "revoke" : "reactivate";
      const res = await axios.put(`${ADMIN_API_ENDPOINT}/access-keys/${key.id}/${action}`, {}, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message);
        setKeys((prev) => prev.map((k) => (k.id === key.id ? res.data.key : k)));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Permanently delete the login ID "${key.label}"? This cannot be undone.`)) return;
    setBusyId(key.id);
    try {
      const res = await axios.delete(`${ADMIN_API_ENDPOINT}/access-keys/${key.id}`, { withCredentials: true });
      if (res.data.success) {
        toast.success("Login ID deleted");
        setKeys((prev) => prev.filter((k) => k.id !== key.id));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete login ID");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Login IDs" description="Create extra email/password login IDs for this admin account" icon={KeyRound}>
      <div className="w-full">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-200 transition-all"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Login ID"}
          </button>
        </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreate}
                className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <Tag className="h-3.5 w-3.5" /> Label
                    </label>
                    <input
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="e.g. Ramesh - Support Desk"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <Mail className="h-3.5 w-3.5" /> Login Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ramesh@ardhnarishwar.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <KeyRound className="h-3.5 w-3.5" /> Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-blue-200 transition-all disabled:opacity-60"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {creating ? "Creating..." : "Create Login ID"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="mb-3 h-7 w-7 animate-spin" />
              <p className="text-sm font-semibold">Loading login IDs...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
              <KeyRound className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">No extra login IDs yet</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Create one to let a trusted teammate sign in to this same admin account without sharing your primary password.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map((key) => (
                <motion.div
                  key={key.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-4 shadow-sm transition-colors ${
                    key.is_active ? "border-slate-200 bg-white" : "border-rose-100 bg-rose-50/50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{key.label}</p>
                      <p className="truncate text-xs text-slate-500">{key.email}</p>
                    </div>
                    {key.is_active ? (
                      <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <ShieldCheck className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        <Ban className="h-3 w-3" /> Revoked
                      </span>
                    )}
                  </div>

                  <div className="mb-3 space-y-1 text-[11px] text-slate-400">
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Created {key.created_at ? new Date(key.created_at).toLocaleDateString() : "—"}
                    </p>
                    {key.last_used_at && (
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last used {new Date(key.last_used_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(key)}
                      disabled={busyId === key.id}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60 ${
                        key.is_active
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      {busyId === key.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : key.is_active ? (
                        <Ban className="h-3.5 w-3.5" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      {key.is_active ? "Revoke" : "Re-allow"}
                    </button>
                    <button
                      onClick={() => handleDelete(key)}
                      disabled={busyId === key.id}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-60"
                      title="Delete permanently"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </AdminLayout>
  );
};

export default AccessKeys;
