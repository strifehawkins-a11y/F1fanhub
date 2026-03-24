import { useEffect } from "react";
import { Mail, Phone, User, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact Us | F1 Paddock";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Get in touch with the F1 Paddock editorial team. Contact editor Lansanah Junior Marah for press enquiries, article submissions, and feedback.");
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Get In Touch</span>
        <h1 className="font-racing text-3xl font-black text-gray-900 tracking-tight mt-1">Contact Us</h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Have a tip, press enquiry, partnership proposal, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      {/* Editorial card */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-racing text-[10px] text-gray-400 tracking-widest uppercase">Editor in Chief</p>
              <p className="font-racing text-base font-black text-gray-900">Lansanah Junior Marah</p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:strifehawkins@gmail.com"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              data-testid="link-contact-email"
            >
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-racing text-[9px] text-gray-400 tracking-widest uppercase mb-0.5">Email</p>
                <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  strifehawkins@gmail.com
                </p>
              </div>
            </a>

            <a
              href="tel:+27643 9953"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              data-testid="link-contact-phone"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:shadow-sm group-hover:shadow-primary/20 transition-all flex-shrink-0">
                <Phone className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-racing text-[9px] text-gray-400 tracking-widest uppercase mb-0.5">Phone / WhatsApp</p>
                <p className="font-racing text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                  +27 643 9953
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-racing text-xs font-bold text-gray-900 tracking-wide uppercase">Response Time</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            We aim to respond to all editorial enquiries within <strong className="text-gray-700">48 hours</strong> during the race calendar.
          </p>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-racing text-xs font-bold text-gray-900 tracking-wide uppercase">Coverage</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            F1 Paddock covers the full <strong className="text-gray-700">2026 Formula 1 season</strong> across all 24 Grand Prix weekends worldwide.
          </p>
        </div>
      </div>

      {/* Submission guidelines */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 space-y-3">
        <h2 className="font-racing text-sm font-black text-gray-900 tracking-wide uppercase">Article Submissions & Tips</h2>
        <ul className="space-y-2 text-sm text-gray-500 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">→</span>
            Press releases and race-weekend tips welcome via email
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">→</span>
            Community members can post directly in our <strong className="text-gray-700">Forum</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">→</span>
            For advertising enquiries please include your budget and campaign details
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">→</span>
            Bug reports and site feedback are always appreciated
          </li>
        </ul>
      </div>
    </div>
  );
}
