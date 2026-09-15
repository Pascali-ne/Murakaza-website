import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("murakaza_lang", lang);
  };

  return (
    <div className="flex items-center bg-white/10 rounded-full p-0.5 text-xs font-semibold">
      <button onClick={() => changeLang("en")} className={`px-2.5 py-1 rounded-full transition ${i18n.language === "en" ? "bg-white text-primary" : "text-white/80"}`}>
        EN
      </button>
      <button onClick={() => changeLang("rw")} className={`px-2.5 py-1 rounded-full transition ${i18n.language === "rw" ? "bg-white text-primary" : "text-white/80"}`}>
        RW
      </button>
    </div>
  );
}