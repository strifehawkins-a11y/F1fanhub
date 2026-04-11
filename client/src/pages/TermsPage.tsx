import { useEffect } from "react";
import { FileText } from "lucide-react";
import { Link } from "wouter";

const LAST_UPDATED = "11 April 2026";
const SITE_NAME = "F1 Paddock";
const SITE_URL = "https://www.f1fanhub.net";
const OWNER = "Lansanah Junior Marah";
const CONTACT_EMAIL = "strifehawkins@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-racing text-sm font-black text-gray-900 tracking-wide uppercase border-l-4 border-primary pl-3">
        {title}
      </h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2 pl-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service | F1 Paddock";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "F1 Paddock terms of service. Read the rules and conditions for using our F1 news, community, and fan platform at f1fanhub.net.");
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-racing text-[10px] text-primary tracking-[0.25em] uppercase font-bold">Legal</span>
        </div>
        <h1 className="font-racing text-3xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-gray-400 font-racing mt-2">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-primary/20" />
        <div className="p-6 space-y-7">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using <strong>{SITE_NAME}</strong> at{" "}
              <a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a>{" "}
              (the "Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Site.
            </p>
            <p>
              These Terms apply to all visitors, registered users, and any other persons who access or use the Site.
            </p>
          </Section>

          <Section title="2. About the Site">
            <p>
              {SITE_NAME} is a Formula 1 fan community platform providing news, race reports, driver and constructor standings, community polls, quizzes, and interactive fan experiences. The Site is operated by <strong>{OWNER}</strong>.
            </p>
            <p>
              {SITE_NAME} is an independent fan site and is not affiliated with, endorsed by, or connected to Formula 1, the FIA, Formula One Management (FOM), or any F1 team or driver.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              To access certain features (polls, quizzes, leaderboards, community forums) you may register for an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.
            </p>
            <p>
              You must provide accurate and complete information when creating an account. You may not use another person's account or impersonate any individual or entity.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, at our sole discretion.
            </p>
          </Section>

          <Section title="4. User-Generated Content">
            <p>
              Users may submit comments, forum posts, poll votes, and other content ("User Content"). By submitting User Content, you grant {SITE_NAME} a non-exclusive, royalty-free, worldwide licence to display and distribute that content on the Site.
            </p>
            <p>You agree not to submit content that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Is unlawful, defamatory, harassing, abusive, or threatening</li>
              <li>Infringes any third-party intellectual property or privacy rights</li>
              <li>Contains spam, unsolicited advertising, or malicious code</li>
              <li>Impersonates any person or entity</li>
              <li>Is hateful, discriminatory, or promotes violence</li>
            </ul>
            <p>
              We reserve the right to remove any User Content at our discretion and without notice.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All original editorial content, design, graphics, logos, and code on the Site are the property of {OWNER} or licensed to us and are protected by applicable intellectual property laws.
            </p>
            <p>
              Formula 1, F1, the F1 logo, and team/driver names are trademarks of their respective owners. Their use on this Site is for editorial and fan commentary purposes only and does not imply any commercial relationship or endorsement.
            </p>
            <p>
              You may not reproduce, distribute, or create derivative works from our original content without prior written permission.
            </p>
          </Section>

          <Section title="6. Advertising & Third-Party Services">
            <p>
              The Site displays advertisements served by third-party advertising networks including <strong>Google AdSense</strong> and other ad platforms. These networks may use cookies and similar technologies to serve ads based on your prior visits to this and other websites.
            </p>
            <p>
              We also use <strong>Google Subscribe with Google (SWG)</strong> to facilitate reader engagement. Use of these services is subject to Google's own Terms of Service and Privacy Policy.
            </p>
            <p>
              We may include links to third-party websites or sponsored content. We are not responsible for the content, accuracy, or practices of any third-party sites. Clicking on advertisements or sponsored links is entirely at your own discretion.
            </p>
            <p>
              You can opt out of personalised advertising by visiting{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Ad Settings
              </a>{" "}
              or{" "}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                AboutAds.info
              </a>.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              The Site uses cookies and similar tracking technologies for functionality, analytics, and advertising. By using the Site, you consent to our use of cookies as described in our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
            <p>
              You can control or disable cookies through your browser settings, though some features of the Site may not function correctly without them.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              The Site and its content are provided on an <strong>"as is" and "as available"</strong> basis without any warranties of any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
            <p>
              Race results, standings, and news content are provided for informational and entertainment purposes only. We strive for accuracy but cannot guarantee that all information is current or error-free.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, {OWNER} and {SITE_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Site, even if we have been advised of the possibility of such damages.
            </p>
            <p>
              Our total liability to you for any claim arising from your use of the Site shall not exceed £100 (one hundred pounds sterling).
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify and hold harmless {OWNER}, {SITE_NAME}, and their officers, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising out of your use of the Site, your User Content, or your violation of these Terms.
            </p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we do, we will revise the "Last updated" date at the top of this page. Your continued use of the Site after any changes constitutes your acceptance of the revised Terms.
            </p>
            <p>
              We encourage you to review these Terms periodically to stay informed of any updates.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Site:</strong> {SITE_NAME} — <a href={SITE_URL} className="text-primary hover:underline">{SITE_URL}</a></li>
              <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a></li>
              <li><strong>Operator:</strong> {OWNER}</li>
            </ul>
          </Section>

        </div>
      </div>

      {/* Footer links */}
      <div className="flex gap-4 text-xs text-gray-400 pb-4">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
      </div>
    </div>
  );
}
