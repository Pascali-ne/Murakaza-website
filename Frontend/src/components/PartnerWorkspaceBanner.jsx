import { Shield, User, Sparkles, Layers } from "lucide-react";

export default function PartnerWorkspaceBanner({
  currentUser,
  activeWorkspace,
  setActiveWorkspace,
  myTitle = "My Dashboard",
  partnerTitle = "Partner Dashboard",
}) {
  if (!currentUser?.delegated_from_role) return null;

  const partnerName = currentUser.delegated_by_name || "Business Partner";
  const partnerEmail = currentUser.delegated_by_email;
  const grantedRole = (currentUser.role || "admin").toUpperCase();
  const baseRole = (currentUser.delegated_from_role || "staff").toUpperCase();

  return (
    <div className="mb-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/5 dark:from-amber-950/40 dark:via-slate-800 dark:to-slate-800/60 p-5 rounded-2xl border border-amber-300/40 dark:border-amber-700/50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-base sm:text-lg flex items-center gap-1.5">
                <span>Partner Dashboard Added</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  <Sparkles size={11} /> {grantedRole} Access Active
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Your business partner <strong className="text-gray-900 dark:text-white font-semibold">{partnerName}</strong>
              {partnerEmail && <span className="text-gray-500 dark:text-gray-400"> ({partnerEmail})</span>} has granted you elevated <strong className="text-gray-900 dark:text-white font-semibold">{grantedRole}</strong> access.
              His dashboard has been added to your workspace so you can manage both your <strong>{baseRole}</strong> responsibilities and his <strong>{grantedRole}</strong> operations right here.
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Workspace Switcher */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800/80 p-1.5 rounded-xl w-full sm:w-fit border dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveWorkspace("my")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeWorkspace === "my"
              ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <User size={15} />
          <span>{myTitle}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkspace("partner")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeWorkspace === "partner"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent"
          }`}
        >
          <Layers size={15} />
          <span>{partnerTitle}</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
            Added
          </span>
        </button>
      </div>
    </div>
  );
}
