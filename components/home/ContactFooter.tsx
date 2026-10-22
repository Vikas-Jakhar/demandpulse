"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Github,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <footer id="contact" className="relative bg-[#151518] border-t border-[#26262E]">
      {/* Contact Form Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact details & Enterprise briefing */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#26262E] bg-[#0B0B0D] px-3.5 py-1 text-xs text-[#FF6A00] font-mono font-semibold shadow-[0_0_12px_rgba(255,106,0,0.15)]">
              <Mail className="h-3.5 w-3.5" />
              <span>GET IN TOUCH</span>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight text-white">
              Ready to Upgrade Your Supply Chain?
            </h3>

            <p className="text-sm text-[#E2E8F0] leading-relaxed">
              Whether you are an inventory planner modeling 50 volatile retail SKUs or an enterprise
              supply chain leader managing multi-node regional distribution centers, our team is ready
              to help you deploy DemandPulse.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B0B0D] border border-[#26262E] text-[#FF6A00] shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Direct Sales & Solutions</div>
                  <a
                    href="mailto:solutions@demandpulse.io"
                    className="text-[#94A3B8] hover:text-[#FF6A00] transition-colors font-mono"
                  >
                    solutions@demandpulse.io
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B0B0D] border border-[#26262E] text-[#38BDF8] shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Response Time SLA</div>
                  <div className="text-[#94A3B8]">Under 24 hours guaranteed for enterprise inquiries</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0B0B0D] border border-[#26262E] text-[#10B981] shrink-0 mt-0.5">
                  <Github className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Open Source Codebase</div>
                  <a
                    href="https://github.com/Vikas-jakhar/demandpulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#94A3B8] hover:text-[#FF6A00] transition-colors font-mono"
                  >
                    github.com/Vikas-jakhar/demandpulse
                  </a>
                </div>
              </div>
            </div>

            {/* System Status Indicator */}
            <div className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[#26262E] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[#94A3B8] font-mono">Platform Status:</span>
                <span className="text-[#10B981] font-semibold font-mono">All Systems Operational</span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">v1.0.0 Stable</span>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#26262E] bg-[#0B0B0D] p-6 sm:p-8 shadow-2xl shadow-black/80">
              <div className="border-b border-[#26262E] pb-4 mb-6">
                <h4 className="text-lg font-bold text-white">Request an Enterprise Consultation</h4>
                <p className="text-xs text-[#E2E8F0] mt-0.5">
                  Send us your specifications or ask for a personalized forecast benchmark on your data.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h5 className="text-base font-bold text-white">Inquiry Successfully Received</h5>
                  <p className="text-xs text-[#E2E8F0] max-w-sm">
                    Thank you, {formData.name || "there"}. A demand forecasting specialist will review
                    your requirements and respond to <strong className="text-white">{formData.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-[#FF6A00] hover:text-[#FF9D2E] hover:underline font-mono pt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Rostova"
                        className="w-full rounded-md border border-[#26262E] bg-[#151518] px-3.5 py-2 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        className="w-full rounded-md border border-[#26262E] bg-[#151518] px-3.5 py-2 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Apex Brands LLC"
                        className="w-full rounded-md border border-[#26262E] bg-[#151518] px-3.5 py-2 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
                        Active SKU Portfolio Size
                      </label>
                      <select
                        value={formData.skuCount}
                        onChange={(e) => setFormData({ ...formData, skuCount: e.target.value })}
                        className="w-full rounded-md border border-[#26262E] bg-[#151518] px-3.5 py-2 text-xs text-white focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none"
                      >
                        <option value="1-10">1 – 10 SKUs (Pilot)</option>
                        <option value="10-100">10 – 100 SKUs (Mid-Market)</option>
                        <option value="100-1000">100 – 1,000 SKUs (Enterprise)</option>
                        <option value="1000+">1,000+ SKUs (High Complexity)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#E2E8F0] mb-1.5">
                      Operational Objectives / Message
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your current forecasting setup, supplier lead time challenges, or specific algorithmic needs..."
                      className="w-full rounded-md border border-[#26262E] bg-[#151518] px-3.5 py-2 text-xs text-white placeholder:text-[#94A3B8] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#94A3B8]">
                      🔒 Your data is kept strictly confidential.
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] text-white font-bold text-xs shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 hover:brightness-110 transition-all active:scale-[0.98]"
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
      <div className="border-t border-[#26262E] bg-[#0B0B0D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#151518] border border-[#26262E] group-hover:border-[#FF6A00]/60 transition-colors">
                  <Activity className="h-4 w-4 text-[#FF6A00]" />
                </div>
                <span className="font-bold tracking-tight text-white text-base">DemandPulse</span>
              </Link>
              <p className="text-xs text-[#E2E8F0] leading-relaxed max-w-sm">
                Industrial-grade demand forecasting SaaS platform: statistically fitted forecasts,
                calibrated confidence envelopes, dynamic safety stock, and an AI copilot grounded in
                real sales numbers.
              </p>
              <div className="flex items-center gap-3 text-[#94A3B8] pt-2">
                <a
                  href="https://github.com/Vikas-jakhar/demandpulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[#151518] hover:text-[#FF6A00] transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h5 className="text-xs font-bold uppercase font-mono text-white tracking-wider mb-3">
                Platform
              </h5>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <a href="#features" className="hover:text-[#FF6A00] transition-colors">
                    Champion Tournament
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#FF6A00] transition-colors">
                    Uncertainty Envelopes
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#FF6A00] transition-colors">
                    Safety Stock Engine
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#FF6A00] transition-colors">
                    Grounded AI Copilot
                  </a>
                </li>
                <li>
                  <a href="#sandbox" className="hover:text-[#FF6A00] transition-colors">
                    Live Simulator
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources & Tech */}
            <div>
              <h5 className="text-xs font-bold uppercase font-mono text-white tracking-wider mb-3">
                Technology
              </h5>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <a href="#architecture" className="hover:text-[#FF6A00] transition-colors">
                    Next.js 14 App Router
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-[#FF6A00] transition-colors">
                    Prisma ORM & Postgres
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-[#FF6A00] transition-colors">
                    Stateless JWT Sessions
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-[#FF6A00] transition-colors">
                    WAPE / MASE Algorithms
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-[#FF6A00] transition-colors">
                    Docker Deployments
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Quick Launch */}
            <div>
              <h5 className="text-xs font-bold uppercase font-mono text-white tracking-wider mb-3">
                Access
              </h5>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <Link href="/login" className="hover:text-[#FF6A00] transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-[#FF6A00] transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#FF6A00] transition-colors">
                    Reset Password
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/Vikas-jakhar/demandpulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF6A00] transition-colors flex items-center gap-1"
                  >
                    <span>GitHub Repo</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-[#26262E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} DemandPulse Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <span className="text-[#FF6A00]">Premium Orange & Black Edition</span>
              <span>•</span>
              <span>Industrial Precision Forecasting</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
