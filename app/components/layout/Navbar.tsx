"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts";
import { Button, Dropdown, DropdownItem, DropdownDivider } from "../ui";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/library", label: "Library" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#1E1E1F]/80 backdrop-blur-xl border-b border-[#3C3B3D] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-8">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all duration-300">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#CBC9CF] group-hover:text-white transition-colors">
                WebNest
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pathname === link.href
                        ? "bg-[#3C3B3D] text-white"
                        : "text-[#6D6C70] hover:text-[#CBC9CF] hover:bg-[#3C3B3D]/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#3C3B3D] transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-medium shadow-lg shadow-violet-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                }
              >
                <div className="px-4 py-3 border-b border-[#3C3B3D]">
                  <p className="font-medium text-[#CBC9CF]">{user.name}</p>
                  <p className="text-sm text-[#6D6C70]">{user.email}</p>
                </div>
                <DropdownItem>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 w-full"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </Link>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem variant="danger" onClick={logout}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {user && (
        <div className="md:hidden border-t border-[#3C3B3D]">
          <div className="flex items-center gap-1 p-2 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  pathname === link.href
                    ? "bg-[#3C3B3D] text-white"
                    : "text-[#6D6C70] hover:text-[#CBC9CF]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
