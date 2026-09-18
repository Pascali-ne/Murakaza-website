import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function FeedbackModeration() {
  const [feedback, setFeedback] = useState([]);
  const load = () => api.get("/feedback").then((res) => setFeedback(res.data));
  useEffect(() => { load(); }, []);

  const hide = async (id) => { await api.put(`/feedback/${id}/hide`); load(); };
  const unhide = async (id) => { await api.put(`/feedback/${id}/unhide`); load(); };
  const remove = async (id) => { if (confirm("Delete this feedback permanently?")) { await api.delete(`/feedback/${id}`); load(); } };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Feedback Moderation</h1>
      <div className="space-y-3">
        {feedback.map((f) => (
          <div key={f.feedback_id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start gap-4">
            <div>
              <p className="font-semibold text-gray-800">{f.customer_name} — {f.product_name}</p>
              <p className="text-sm text-yellow-600">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</p>
              <p className="text-gray-600 mt-1">{f.comment}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${f.status === "visible" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>{f.status}</span>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {f.status === "visible" ? (
                <button onClick={() => hide(f.feedback_id)} className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">Hide</button>
              ) : (
                <button onClick={() => unhide(f.feedback_id)} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20">Unhide</button>
              )}
              <button onClick={() => remove(f.feedback_id)} className="text-sm px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
            </div>
          </div>
        ))}
        {feedback.length === 0 && <p className="text-gray-500">No feedback yet.</p>}
      </div>
    </div>
  );
}