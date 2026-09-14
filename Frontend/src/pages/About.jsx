import { Target, Users, ShieldCheck } from "lucide-react";

export default function About() {
  const values = [
    { icon: <Target />, title: "Our Mission", text: "Reduce the need to visit the shop physically just to find out what's available." },
    { icon: <Users />, title: "Who We Serve", text: "Students and offices across Rwanda who need supplies delivered simply." },
    { icon: <ShieldCheck />, title: "Our Promise", text: "Reliable products, secure payments, and support you can count on." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">About MURAKAZA</h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        MURAKAZA is a web-based shop that helps customers buy student supplies and
        office equipment online. Our goal is simple: reduce the need for customers
        to visit the shop physically just to find out what is available.
      </p>
      <p className="text-gray-700 leading-relaxed mb-10">
        Alongside our core products, we also offer supporting services such as
        printing, photocopying, scanning, photo express, and Irembo services —
        available on request through our Other Services page.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {values.map((v, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6 text-center flex flex-col items-center gap-3">
            <div className="text-primary">{v.icon}</div>
            <h3 className="font-bold text-gray-800">{v.title}</h3>
            <p className="text-sm text-gray-600">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}