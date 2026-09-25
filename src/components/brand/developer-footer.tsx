import { Mail } from "lucide-react";
import { DEVELOPER_NAME, SOCIAL_LINKS } from "@/lib/site";
import { GithubIcon, LinkedinIcon } from "@/components/brand/social-icons";

const LINKS = [
  { href: SOCIAL_LINKS.github, label: "GitHub", Icon: GithubIcon },
  { href: SOCIAL_LINKS.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
] as const;

/** Attribution footer: developer name, GitHub and LinkedIn profiles.
 *  Rendered at the bottom of every authenticated screen and the auth pages. */
export function DeveloperFooter({ className }: { className?: string }) {
  return (
    <footer className={className}>
      <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
        <span>
          Built by{" "}
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 underline-offset-4 hover:underline dark:text-slate-200"
          >
            {DEVELOPER_NAME}
          </a>
        </span>
        <div className="flex items-center gap-4">
          {LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </a>
          ))}
          <a
            href={`mailto:${SOCIAL_LINKS.email}`}
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden="true" /> Email
          </a>
        </div>
      </div>
    </footer>
  );
}
