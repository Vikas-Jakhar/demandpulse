"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  ShieldCheck,
  Server,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactFooter() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    skuCount: "10-100",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <footer id="contact" className="relative bg-surface border-t border-border">
      {/* Contact Form Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact details & Enterprise briefing */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-signal font-mono font-medium">
              <Mail className="h-3.5 w-3.5" />
              <span>GET IN TOUCH</span>
            </div>

            <h3 className="text-3xl font-bold tracking-tight text-ink">
              Ready to Upgrade Your Supply Chain?
            </h3>

            <p className="text-sm text-ink-muted leading-relaxed">
              Whether you are an inventory planner modeling 50 volatile retail SKUs or an enterprise
              supply chain leader managing multi-node regional distribution centers, our team is ready
              to help you deploy DemandPulse.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="p-2 rounded bg-canvas border border-border text-signal shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-ink">Direct Sales & Solutions</div>
                  <a
                    href="mailto:solutions@demandpulse.io"
                    className="text-ink-muted hover:text-signal transition-colors font-mono"
                  >
                    solutions@demandpulse.io
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="p-2 rounded bg-canvas border border-border text-actual shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-ink">Response Time SLA</div>
                  <div className="text-ink-muted">Under 24 hours guaranteed for enterprise inquiries</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="p-2 rounded bg-canvas border border-border text-good shrink-0 mt-0.5">
                  <Github className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-ink">Open Source Codebase</div>
                  <a
                    href="https://github.com/Vikas-jakhar/demandpulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-signal transition-colors font-mono"
                  >
                    github.com/Vikas-jakhar/demandpulse
                  </a>
                </div>
              </div>
            </div>

            {/* System Status Indicator */}
            <div className="p-3.5 rounded-xl bg-canvas border border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-good animate-pulse" />
                <span className="text-ink-muted font-mono">Platform Status:</span>
                <span className="text-good font-semibold font-mono">All Systems Operational</span>
              </div>
              <span className="text-[10px] font-mono text-ink-faint">v1.0.0 Stable</span>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-canvas p-6 sm:p-8 shadow-xl shadow-black/40">
              <div className="border-b border-border/70 pb-4 mb-6">
                <h4 className="text-lg font-semibold text-ink">Request an Enterprise Consultation</h4>
                <p className="text-xs text-ink-muted mt-0.5">
                  Send us your specifications or ask for a personalized forecast benchmark on your data.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-good/15 text-good border border-good/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h5 className="text-base font-semibold text-ink">Inquiry Successfully Received</h5>
                  <p className="text-xs text-ink-muted max-w-sm">
                    Thank you, {formData.name || "there"}. A demand forecasting specialist will review
                    your requirements and respond to <strong>{formData.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-signal hover:underline font-mono pt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Rostova"
                        className="w-full rounded-md border border-border bg-surface-raised px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        className="w-full rounded-md border border-border bg-surface-raised px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Apex Brands LLC"
                        className="w-full rounded-md border border-border bg-surface-raised px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-muted mb-1.5">
                        Active SKU Portfolio Size
                      </label>
                      <select
                        value={formData.skuCount}
                        onChange={(e) => setFormData({ ...formData, skuCount: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface-raised px-3.5 py-2 text-xs text-ink focus:border-signal focus:outline-none"
                      >
                        <option value="1-10">1 – 10 SKUs (Pilot)</option>
                        <option value="10-100">10 – 100 SKUs (Mid-Market)</option>
                        <option value="100-1000">100 – 1,000 SKUs (Enterprise)</option>
                        <option value="1000+">1,000+ SKUs (High Complexity)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      Operational Objectives / Message
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your current forecasting setup, supplier lead time challenges, or specific algorithmic needs..."
                      className="w-full rounded-md border border-border bg-surface-raised px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-ink-faint">
                      🔒 Your data is kept strictly confidential.
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-signal text-canvas font-semibold text-xs hover:bg-signal/90 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="border-t border-border bg-canvas/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised border border-border group-hover:border-signal/50 transition-colors">
                  <Activity className="h-4 w-4 text-signal" />
                </div>
                <span className="font-semibold tracking-tight text-ink text-base">DemandPulse</span>
              </Link>
              <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
                Industrial-grade demand forecasting SaaS platform: statistically fitted forecasts,
                calibrated confidence envelopes, dynamic safety stock, and an AI copilot grounded in
                real sales numbers.
              </p>
              <div className="flex items-center gap-3 text-ink-muted pt-2">
                <a
                  href="https://github.com/Vikas-jakhar/demandpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-surface-raised hover:text-ink transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h5 className="text-xs font-semibold uppercase font-mono text-ink tracking-wider mb-3">
                Platform
              </h5>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    Champion Tournament
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    Uncertainty Envelopes
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    Safety Stock Engine
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-ink transition-colors">
                    Grounded AI Copilot
                  </a>
                </li>
                <li>
                  <a href="#sandbox" className="hover:text-ink transition-colors">
                    Live Simulator
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources & Tech */}
            <div>
              <h5 className="text-xs font-semibold uppercase font-mono text-ink tracking-wider mb-3">
                Technology
              </h5>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li>
                  <a href="#architecture" className="hover:text-ink transition-colors">
                    Next.js 14 App Router
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-ink transition-colors">
                    Prisma ORM & Postgres
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-ink transition-colors">
                    Stateless JWT Sessions
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-ink transition-colors">
                    WAPE / MASE Algorithms
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-ink transition-colors">
                    Docker Deployments
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Quick Launch */}
            <div>
              <h5 className="text-xs font-semibold uppercase font-mono text-ink tracking-wider mb-3">
                Access
              </h5>
              <ul className="space-y-2 text-xs text-ink-muted">
                <li>
                  <Link href="/login" className="hover:text-ink transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-ink transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-ink transition-colors">
                    Reset Password
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/Vikas-jakhar/demandpulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink transition-colors flex items-center gap-1"
                  >
                    <span>GitHub Repo</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} DemandPulse Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <span>Industrial SaaS Suite</span>
              <span>•</span>
              <span>High Precision Forecasting</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
