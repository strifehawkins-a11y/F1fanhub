import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { PenLine, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
const labelCls = "font-racing text-[10px] text-gray-400 tracking-widest uppercase block mb-1";

interface StoryForm {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
}

const emptyForm: StoryForm = { title: "", excerpt: "", content: "", tags: "" };

export default function SubmitStoryPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: StoryForm) => {
      const tags = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return apiRequest("POST", "/api/articles/submit", {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags,
        section: "news",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setForm(emptyForm);
    },
    onError: () => {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <h2 className="font-racing text-xl text-gray-900 mb-2">Sign In Required</h2>
        <p className="text-sm text-gray-400 mb-6">You need to be signed in to submit a story.</p>
        <Link href="/login">
          <button className="px-6 py-2.5 rounded-lg bg-primary text-white font-racing text-sm font-bold hover:bg-red-700 transition-all">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="font-racing text-2xl text-gray-900 mb-2">Story Submitted!</h2>
        <p className="text-sm text-gray-500 mb-2">
          Thank you for your submission. Our team will review it shortly. If approved, it will appear in the Articles section.
        </p>
        <p className="text-xs text-gray-400 mb-8">We aim to review all submissions within 48 hours.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setSubmitted(false)}
            data-testid="button-submit-another"
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-racing text-gray-600 hover:border-primary hover:text-primary transition-all"
          >
            Submit Another
          </button>
          <Link href="/articles">
            <button
              data-testid="button-back-articles"
              className="px-5 py-2 rounded-lg bg-primary text-white font-racing text-sm font-bold hover:bg-red-700 transition-all"
            >
              Browse Articles
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = form.title.trim() && form.excerpt.trim() && form.content.trim();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <PenLine className="w-5 h-5 text-primary" />
          <h1 className="font-racing text-2xl font-bold text-gray-900 tracking-wide">Submit a Story</h1>
        </div>
        <p className="text-sm text-gray-400 ml-7">
          Share your F1 insight, race report, or opinion piece. Our editors review all submissions before publishing.
        </p>
      </div>

      {/* Guidelines banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-6">
        <p className="font-racing text-[10px] text-primary tracking-widest uppercase mb-2">Submission Guidelines</p>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Write about F1 topics only — race reports, driver analysis, team news, historical pieces</li>
          <li>Minimum 200 words; no promotional or spam content</li>
          <li>Must be your original work — no plagiarism</li>
          <li>We may lightly edit for grammar and style</li>
        </ul>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) submitMutation.mutate(form);
        }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5"
      >
        {/* Title */}
        <div>
          <label className={labelCls}>Story Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Why Hamilton's Move to Ferrari Was Inevitable"
            data-testid="input-story-title"
            className={inputCls}
            maxLength={120}
          />
          <p className="text-[10px] text-gray-300 mt-1 text-right">{form.title.length}/120</p>
        </div>

        {/* Excerpt */}
        <div>
          <label className={labelCls}>Brief Summary * <span className="normal-case tracking-normal text-gray-300">(shown in article card)</span></label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="A 1–2 sentence summary of your story..."
            rows={2}
            data-testid="input-story-excerpt"
            className={inputCls + " resize-none"}
            maxLength={300}
          />
          <p className="text-[10px] text-gray-300 mt-1 text-right">{form.excerpt.length}/300</p>
        </div>

        {/* Content */}
        <div>
          <label className={labelCls}>Full Story * <span className="normal-case tracking-normal text-gray-300">(blank line = new paragraph)</span></label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your full story here. Use blank lines to separate paragraphs..."
            rows={14}
            data-testid="input-story-content"
            className={inputCls + " resize-y font-mono"}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-gray-300">
              Word count: {form.content.trim() ? form.content.trim().split(/\s+/).length : 0}
            </p>
            {form.content.trim().split(/\s+/).length > 0 && form.content.trim().split(/\s+/).length < 200 && (
              <p className="text-[10px] text-amber-500">Aim for at least 200 words</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={labelCls}>Tags <span className="normal-case tracking-normal text-gray-300">(optional, comma-separated)</span></label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. Hamilton, Ferrari, Race Report"
            data-testid="input-story-tags"
            className={inputCls}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-300">
            Your name will appear as the author once approved.
          </p>
          <button
            type="submit"
            disabled={!canSubmit || submitMutation.isPending}
            data-testid="button-submit-story-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-racing text-sm font-bold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
          >
            {submitMutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
            ) : (
              <><PenLine className="w-4 h-4" />Submit for Review</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
