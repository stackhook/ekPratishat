

"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lock, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { useSignInUser } from "@repo/query-hook";

type SignInError = {
  contact?: string;
  password?: string;
};

interface SignInProps {
  label?: string;
}

export default function SignInForm({ label }: SignInProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ contact: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signinMutation = useSignInUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signinMutation.mutate(form, {
      onSuccess: (data) => {
        if (data?.ok) {
          toast.success("Login Successful!!!");
          queryClient.invalidateQueries({
            queryKey: ["user-info"],
          });
          queryClient.invalidateQueries({
            queryKey: ["my-information"],
          });
          router.replace("/");
        } else if (data?.error) {
          toast.error(data.error || "Something Happened");
        } else {
          toast.error("Unexpected error")
        }
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[rgba(154,106,0,0.14)] bg-white/85 px-8 pt-6 pb-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center pb-10">
        Welcome to{" "}
        <span className="text-gold-700 dark:text-gold-400">
          {label ? label : <Link href="/">EkPratisat</Link>}
        </span>
      </h2>

      {/* Contact */}
      <label className="block mb-4">
        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Phone size={18} /> Contact
        </span>
        <input
          type="tel"
          name="contact"
          value={form.contact}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setForm({ ...form, contact: value });
          }}
          inputMode="numeric"
          className="mt-1 block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/25 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100"
          required
        />
      </label>

      {/* Password */}
      <label className="block mb-4">
        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Lock size={18} /> Password
        </span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3 py-2 pr-10 text-gray-900 outline-none transition focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/25 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      {/* Submit */}
      <Button
        className="w-full"
        variant="default"
        type="submit"
        disabled={signinMutation.isPending}
      >
        {
          signinMutation.isPending ? "Signing in...." : "Sign In"
        }
      </Button>
    </form>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-red-600 text-sm mt-1 dark:text-red-400">
      **{message}
    </p>
  );
}
