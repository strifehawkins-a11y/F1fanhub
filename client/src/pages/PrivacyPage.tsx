import { useEffect } from "react";
import { Shield } from "lucide-react";
import { format } from "date-fns";

const LAST_UPDATED = "24 March 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-racing text-sm font-black text-gray-900 tracking-wide uppercase border-l-4 border-primary pl-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2 pl-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | F1 Paddock";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "F1 Paddock privacy policy. Learn how we collect, use and protect your data on our F1 news, forums and community platform.");
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Legal</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-gray-400 font-racing mt-2">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="p-6 space-y-7">

          <Section title="1. Who We Are">
            <p>
              F1 Paddock (<strong>"we", "us", "our"</strong>) is a Formula 1 fan community website operated by{" "}
              <strong>Lansanah Junior Marah</strong>. Our editorial contact is{" "}
              <a href="mailto:strifehawkins@gmail.com" className="text-primary hover:underline">strifehawkins@gmail.com</a>.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, and protect information about you when you use F1 Paddock at
              www.f1fanhub.net and any associated subdomains.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Account information:</strong> When you register, we collect your name, email address, and a hashed password. If you use our quick sign-in option, we receive basic profile information from your linked account.</p>
            <p><strong>Usage data:</strong> We track article views using an anonymous visitor ID stored in your browser's local storage. This ID is not linked to personal identifiers unless you are logged in.</p>
            <p><strong>Forum &amp; community content:</strong> Any posts, comments, poll votes, or quiz answers you submit are stored in our database and associated with your account.</p>
            <p><strong>Points &amp; rewards:</strong> We store your points balance, lifetime score, and daily claim timestamps to power the rewards system.</p>
            <p><strong>Cookies:</strong> We use a session cookie to keep you logged in. We may also use third-party advertising cookies if Google AdSense ads are displayed (see Section 6).</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="space-y-1 list-disc list-inside">
              <li>To operate and personalise your F1 Paddock account</li>
              <li>To award and track community points and rewards</li>
              <li>To display your contributions in the forum, leaderboard, and comments</li>
              <li>To send transactional communications (e.g. password reset)</li>
              <li>To improve site performance and content based on aggregate analytics</li>
              <li>To serve relevant advertisements via Google AdSense</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Our cloud hosting provider</strong> — responsible for infrastructure and data storage on our behalf.</li>
              <li><strong>Google LLC</strong> — for advertising (AdSense) and analytics. Google may set cookies and collect usage data in accordance with their own privacy policy.</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Your account and content data is retained for as long as your account is active. You may request deletion of
              your account and associated data by emailing{" "}
              <a href="mailto:strifehawkins@gmail.com" className="text-primary hover:underline">strifehawkins@gmail.com</a>.
            </p>
            <p>Anonymous visitor IDs stored in local storage are never transmitted to third parties and can be cleared at any time by clearing your browser data.</p>
          </Section>

          <Section title="6. Advertising (Google AdSense)">
            <p>
              F1 Paddock may display advertisements served by <strong>Google AdSense</strong>. Google uses cookies to serve ads
              based on your prior visits to this website or other websites. You can opt out of personalised advertising by
              visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Ads Settings
              </a>{" "}
              or by visiting{" "}
              <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                aboutads.info
              </a>.
            </p>
            <p>
              We comply with Google AdSense programme policies. Our Privacy Policy and contact details are accessible from every
              page of the site.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location you may have the right to:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict how we process your data</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:strifehawkins@gmail.com" className="text-primary hover:underline">strifehawkins@gmail.com</a>.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              F1 Paddock is not directed at children under 13. We do not knowingly collect personal data from children under 13.
              If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect
              any changes. Continued use of the site after changes are posted constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For any privacy-related questions, please contact:<br />
              <strong>Lansanah Junior Marah</strong><br />
              Email: <a href="mailto:strifehawkins@gmail.com" className="text-primary hover:underline">strifehawkins@gmail.com</a><br />
              Phone: +27 643 9953
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
