import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "CruxHire AI",
  description:
    "CruxHire AI is a cutting-edge platform designed to streamline the recruitment process. It leverages advanced AI algorithms to rank and screen resumes, ensuring that recruiters can quickly identify the best candidates for their job openings. The platform provides detailed insights and analytics, making the hiring process more efficient and effective.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    gitHub: "https://github.com/Ashref-dev/talentmatch-ai",
    twitter: "https://x.com/talentmatch_ai",
    instagram: "https://www.instagram.com/talentmatch_ai/",
    facebook: "https://facebook.com/513241155206826",
    bluesky: "https://bsky.app/profile/talentmatch-ai.com",
  },
  mailSupport: "support@talentmatch-ai.com",
};

export const SUPPORTED_LANGUAGES = {
  EN: { name: "English", flag: "🇺🇸", greeting: "Hello!" },
  FR: { name: "French", flag: "🇫🇷", greeting: "Bonjour!" },
  ES: { name: "Spanish", flag: "🇪🇸", greeting: "¡Hola!" },
  DE: { name: "German", flag: "🇩🇪", greeting: "Hallo!" },
  AR: { name: "Arabic", flag: "🇸🇦", greeting: "!مرحبا" },
} as const;

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "/about" },
      // { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  // {
  //   title: "Product",
  //   items: [
  //     { title: "Security", href: "#" },
  //     { title: "Customization", href: "#" },
  //     { title: "Customers", href: "#" },
  //     { title: "Changelog", href: "#" },
  //   ],
  // },
  // {
  //   title: "Docs",
  //   items: [
  //     { title: "Introduction", href: "#" },
  //     { title: "Installation", href: "#" },
  //     { title: "Components", href: "#" },
  //     { title: "Code Blocks", href: "#" },
  //   ],
  // },
];
