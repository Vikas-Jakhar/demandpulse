"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Menu, X, Sparkles, Loader2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export function Navbar({ isLoggedIn = false }: NavbarProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGuestLogin = async () => {
    try {
      setIsGuestLoading(true);
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B0B0D]/90 backdrop-blur-md border-b border-[#26262E] shadow-xl shadow-black/60"
          : "bg-[#0B0B0D]/60 backdrop-blur-sm border-b border-[#26262E]/50"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#151518] border border-[#26262E] group-hover:border-[#FF6A00]/60 group-hover:shadow-[0_0_15px_rgba(255,106,0,0.3)] transition-all">
            <Activity className="h-5 w-5 text-[#FF6A00] transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">DemandPulse</span>
              <span className="rounded bg-[#FF6A00]/15 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#FF6A00] border border-[#FF6A00]/30 shadow-[0_0_10px_rgba(255,106,0,0.15)]">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8] -mt-0.5 tracking-wider uppercase font-mono">
              Control Room
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#features"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors"
          >
            Benefits
          </a>
          <a
            href="#sandbox"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors flex items-center gap-1.5"
          >
            <span>Live Sandbox</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
          </a>
          <a
            href="#faq"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors"
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="text-xs font-medium text-white hover:text-[#FF6A00] transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/Vikas-jakhar/demandpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#94A3B8] hover:text-[#FF6A00] hover:bg-[#151518] rounded-md transition-colors"
            title="GitHub Repository"
          >
            <Github className="h-4 w-4" />
          </a>

          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="signal" size="sm" className="gap-1.5">
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <button
                onClick={handleGuestLogin}
                disabled={isGuestLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E2E8F0] hover:text-[#FF6A00] px-3.5 py-1.5 rounded-md border border-[#26262E] hover:border-[#FF6A00]/50 hover:bg-[#151518] transition-all hover:shadow-[0_0_12px_rgba(255,106,0,0.15)]"
              >
                {isGuestLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF6A00]" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[#FF6A00]" />
                )}
                <span>Instant Demo</span>
              </button>

              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs text-[#E2E8F0] hover:text-white">
                  Sign in
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  variant="signal"
                  size="sm"
                  className="text-xs font-semibold shadow-md shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleGuestLogin}
            disabled={isGuestLoading}
            className="px-2.5 py-1 text-[11px] font-medium text-white bg-gradient-to-r from-[#FF6A00] to-[#FF9D2E] rounded flex items-center gap-1 shadow-sm"
          >
            {isGuestLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Demo
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#FF6A00] hover:bg-[#151518] rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0D] border-b border-[#26262E] px-4 py-5 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors"
            >
              Features
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors"
            >
              Product Benefits
            </a>
            <a
              href="#sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors flex items-center justify-between"
            >
              <span>Live Forecasting Sandbox</span>
              <span className="text-[10px] font-mono text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded border border-[#FF6A00]/30">
                Interactive
              </span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors"
            >
              FAQ
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-white hover:text-[#FF6A00] transition-colors"
            >
              Contact & Sales
            </a>
          </nav>

          <div className="pt-4 border-t border-[#26262E] flex flex-col gap-2.5">
            {isLoggedIn ? (
              <Link href="/dashboard" className="w-full">
                <Button variant="signal" className="w-full justify-center">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <button
                  onClick={handleGuestLogin}
                  disabled={isGuestLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#151518] border border-[#26262E] text-white text-sm font-medium hover:border-[#FF6A00]/50"
                >
                  {isGuestLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#FF6A00]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#FF6A00]" />
                  )}
                  Try Guest Demo (No Login)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center text-xs">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button variant="signal" className="w-full justify-center text-xs">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
