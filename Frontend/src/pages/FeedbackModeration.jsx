import { useEffect, useState } from "react";
import api from "../api/api.js";
import { Star, Eye, EyeOff, Trash2, Search, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

export default function FeedbackModeration() {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/feedback")
      .then((res) => setFeedback(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Could not fetch feedback:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const hide = async (id) => {
    await api.put(`/feedback/${id}/hide`);
    load();
  };

  const unhide = async (id) => {
    await api.put(`/feedback/${id}/unhide`);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    await api.delete(`/feedback/${id}`);
    load();
  };

  const visibleCount = feedback.filter((f) => f.status === "visible").length;
  const hiddenCount = feedback.filter((f) => f.status === "hidden").length;

  const filtered = feedback
    .filter((f) => (filter === "all" ? true : f.status === filter))
    .filter((f) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (f.customer_name && f.customer_name.toLowerCase().includes(term)) ||
        (f.product_name && f.product_name.toLowerCase().includes(term)) ||
        (f.comment && f.comment.toLowerCase().includes(term))
      );
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
            Customer Feedback Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, curate, hide, or approve customer testimonials and product ratings
          </p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Reviews</span>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-1">{feedback.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Public / Visible</span>
          <p className="text-2xl font-bold font-heading text-emerald-600 mt-1">{visibleCount}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Hidden / Moderated</span>
          <p className="text-2xl font-bold font-heading text-amber-600 mt-1">{hiddenCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { id: "all", label: "All Reviews" },
            { id: "visible", label: "Visible" },
            { id: "hidden", label: "Hidden" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === s.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feedback..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading feedback...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No feedback matching current filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div
              key={f.feedback_id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{f.customer_name}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-600 text-xs">{f.product_name}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      f.status === "visible"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {f.status}
                  </span>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">{f.comment}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                {f.status === "visible" ? (
                  <button
                    onClick={() => hide(f.feedback_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </button>
                ) : (
                  <button
                    onClick={() => unhide(f.feedback_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                )}

                <button
                  onClick={() => remove(f.feedback_id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}