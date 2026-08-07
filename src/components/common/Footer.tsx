import React, { memo } from "react";
import Link from "next/link";
import { SITE_CONFIG, ROUTES } from "@/constants";
import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: "Explore Projects", href: ROUTES.PROJECTS },
      { label: "Browse Skills", href: ROUTES.SKILLS },
      { label: "Create Profile", href: ROUTES.REGISTER },
      { label: "Dashboard", href: ROUTES.DASHBOARD },
    ],
    resources: [
      { label: "About Us", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Success Stories", href: "#" },
      { label: "Blog", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Guidelines", href: "#" },
    ],
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      className="relative overflow-hidden bg-background border-t border-border/20 mt-auto"
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="container mx-auto max-w-7xl px-4 md:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link
              href={ROUTES.HOME}
              aria-label="SkillSwap Home"
              className="mb-6 inline-flex items-center space-x-2 text-2xl font-black tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8">
              The premium student collaboration platform. Swap skills, join ambitious projects, and build a world-class portfolio alongside talented peers from top universities.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full bg-background border border-border/50 hover:border-primary/50">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full bg-background border border-border/50 hover:border-primary/50">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full bg-background border border-border/50 hover:border-primary/50">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="mailto:hello@skillswap.example.com" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full bg-background border border-border/50 hover:border-primary/50">
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-wide text-sm mb-2">Platform</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-wide text-sm mb-2">Resources</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-wide text-sm mb-2">Legal</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/20 bg-background/80 backdrop-blur-md relative z-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Engineered with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
});
