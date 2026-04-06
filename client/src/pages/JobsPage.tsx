import { Link } from "wouter";
import { Briefcase, ExternalLink, ChevronRight } from "lucide-react";

const JOB_LISTINGS = [
  {
    category: "Engineering & Technical Roles",
    site: "LinkedIn",
    description:
      "Browse open engineering positions across F1 teams — from aerodynamics and powertrain to simulation and software engineering. LinkedIn lists roles at top constructors including Red Bull, Ferrari, Mercedes and more.",
    url: "https://www.linkedin.com/jobs/formula-1-engineering-jobs",
    color: "#0077B5",
    tags: ["Aerodynamics", "Software", "Powertrain", "Simulation"],
  },
  {
    category: "Field Marshal & Event Operations",
    site: "Indeed",
    description:
      "Formula 1 race weekends rely on hundreds of event operations staff — marshals, logistics coordinators, hospitality and circuit operations personnel. Find current openings on Indeed.",
    url: "https://www.indeed.com/q-Formula-1-Field-Marshal-jobs.html",
    color: "#2164F3",
    tags: ["Marshalling", "Logistics", "Hospitality", "Event Ops"],
  },
  {
    category: "Motorsport Journalism & Media",
    site: "Glassdoor",
    description:
      "From race reporters and video editors to social media managers and broadcast producers, the F1 media machine never stops. Find journalism and content roles listed on Glassdoor.",
    url: "https://www.glassdoor.com/Job/formula-1-jobs-SRCHKO0,8.htm",
    color: "#0CAA41",
    tags: ["Journalism", "Media", "Broadcasting", "Content"],
  },
  {
    category: "Pit Crew & Technical Garage Roles",
    site: "Totaljobs",
    description:
      "Pit crew mechanics, tyre technicians, garage engineers and fabricators are all vital to an F1 team's race-weekend performance. Totaljobs lists Formula One technical vacancies across the UK.",
    url: "https://www.totaljobs.com/jobs/formula-one",
    color: "#E4003B",
    tags: ["Pit Crew", "Mechanic", "Fabrication", "Tyres"],
  },
  {
    category: "Marketing, Sponsorship & Commercial",
    site: "Reed.co.uk",
    description:
      "Sponsorship managers, brand partnerships executives, commercial analysts and marketing strategists keep the money flowing in Formula 1. Explore relevant roles on Reed.co.uk.",
    url: "https://www.reed.co.uk/jobs/sponsorship",
    color: "#CC0000",
    tags: ["Marketing", "Sponsorship", "Commercial", "Partnerships"],
  },
];

export default function JobsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#0d0005 0%,#1a0008 40%,#3d0015 70%,#2d0010 100%)" }}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="px-8 py-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-primary flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <span className="mcl-label text-white/60">Careers in Formula 1</span>
          </div>
          <h1 className="mcl-heading text-4xl sm:text-5xl text-white mb-4">
            F1 Job Listings
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xl">
            Formula 1 is more than racing — it's a global industry employing thousands of
            engineers, journalists, event staff, marketers and technicians. Whether you're
            chasing a paddock pass or a press box seat, these curated links will get you started.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-racing">
        <Link href="/"><span className="hover:text-primary cursor-pointer transition-colors">Home</span></Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Job Listings</span>
      </div>

      {/* Intro text */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="mcl-heading text-base text-gray-900">About These Listings</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          The links below connect you directly to job searches on reputable platforms such as LinkedIn,
          Indeed, Glassdoor, Totaljobs and Reed. Each link is filtered for Formula One–related roles
          in a specific area of the sport. New positions are posted regularly, so bookmark this page
          and check back often. Roles range from entry-level volunteer marshal positions all the way
          to senior engineering and commercial director-level opportunities.
        </p>
      </div>

      {/* Job cards */}
      <div className="space-y-4">
        {JOB_LISTINGS.map((job) => (
          <a
            key={job.site}
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-job-${job.site.toLowerCase().replace(/\./g, "-")}`}
            className="block group"
          >
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-md transition-all overflow-hidden">
              {/* Top accent bar with site colour */}
              <div className="h-0.5" style={{ background: job.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="mcl-label text-gray-400">{job.site}</span>
                    <h3 className="font-racing text-base font-black text-gray-900 group-hover:text-primary transition-colors mt-0.5">
                      {job.category}
                    </h3>
                  </div>
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform"
                    style={{ background: `${job.color}18` }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: job.color }} />
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-3">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {job.tags.map(tag => (
                    <span
                      key={tag}
                      className="font-racing text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                  <span
                    className="ml-auto font-racing text-[10px] font-bold tracking-wide flex items-center gap-1 transition-colors"
                    style={{ color: job.color }}
                  >
                    View Listings <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Tips section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h2 className="mcl-heading text-base text-gray-900">Tips for Applying</h2>
        </div>
        <ul className="space-y-3 text-sm text-gray-600">
          {[
            "Set up job alerts on each platform so you're notified the moment a new F1 role goes live — competition is fierce and roles fill fast.",
            "Tailor your CV to the specific role. Teams care deeply about relevant motorsport experience, even if it's karting, student formula or club racing.",
            "Network on LinkedIn with people already working in F1 — many roles never get publicly advertised.",
            "Consider volunteer marshal or hospitality roles as a foot in the door; former marshals have gone on to full-time FIA and team positions.",
            "For media roles, a strong portfolio of published work matters more than a formal qualification — start writing, filming or podcasting now.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded flex items-center justify-center mt-0.5">
                <span className="font-racing text-[9px] font-black text-primary">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-gray-400 font-racing tracking-wide text-center pb-4">
        F1 Paddock does not endorse any employer and is not responsible for third-party job listings. 
        Links open external sites. Always verify roles directly with the employer.
      </p>
    </div>
  );
}
