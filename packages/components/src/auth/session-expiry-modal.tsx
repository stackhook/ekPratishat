
// "use client";

// import { useState } from "react";
// import { Lock, Phone, Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";
// import { useSignInUser } from "@repo/query-hook";
// import { useQueryClient } from "@tanstack/react-query";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";


// interface SessionExpiredSignInModalProps {
//   open: boolean;
//   onLoginSuccess: () => void;
//   onCancel: () => void;
// }

// export function SessionExpiredSignInModal({
//   open,
//   onLoginSuccess,
//   onCancel,
// }: SessionExpiredSignInModalProps) {
//   const queryClient = useQueryClient();
//   const signinMutation = useSignInUser();

//   const [form, setForm] = useState({
//     contact: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showCancelConfirmation, setShowCancelConfirmation] =
//     useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     signinMutation.mutate(form, {
//       onSuccess: (data) => {
//         if (data?.ok) {
//           toast.success("Login Successful!!!");

//           queryClient.invalidateQueries({
//             queryKey: ["user-info"],
//           });

//           queryClient.invalidateQueries({
//             queryKey: ["my-information"],
//           });

//           onLoginSuccess();
//         } else if (data?.error) {
//           toast.error(data.error);
//         } else {
//           toast.error("Unexpected error");
//         }
//       },
//     });
//   };

//   const handleCancel = () => {
//     setShowCancelConfirmation(true);
//   };

//   const handleConfirmCancel = () => {
//     setShowCancelConfirmation(false);
//     onCancel();
//   };

//   return (
//     <>
//       <Dialog
//         open={open && !showCancelConfirmation}
//         onOpenChange={(nextOpen) => {
//           if (!nextOpen) {
//             handleCancel();
//           }
//         }}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Sign in again</DialogTitle>
//           </DialogHeader>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Contact */}
//             <label className="block">
//               <span className="mb-1 flex items-center gap-2 text-sm text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
//                 <Phone size={17} />
//                 Contact
//               </span>

//               <input
//                 type="tel"
//                 name="contact"
//                 value={form.contact}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, "");

//                   setForm((prev) => ({
//                     ...prev,
//                     contact: value,
//                   }));
//                 }}
//                 inputMode="numeric"
//                 autoComplete="tel"
//                 className="mt-1 block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/25 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100"
//                 required
//               />
//             </label>

//             {/* Password */}
//             <label className="block">
//               <span className="mb-1 flex items-center gap-2 text-sm text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
//                 <Lock size={17} />
//                 Password
//               </span>

//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   autoComplete="current-password"
//                   className="mt-1 block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3 py-2 pr-10 text-gray-900 outline-none transition focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/25 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100"
//                   required
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                   className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//                   aria-label={
//                     showPassword
//                       ? "Hide password"
//                       : "Show password"
//                   }
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>
//             </label>

//             <DialogFooter>
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 disabled={signinMutation.isPending}
//                 className="rounded-xl border border-[var(--ek-border-soft)] px-4 py-2 text-sm font-medium text-[var(--ek-text-primary)] transition hover:bg-[rgba(154,106,0,0.06)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--ek-dark-border)] dark:text-[var(--ek-dark-text)] dark:hover:bg-[rgba(229,184,62,0.08)]"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={signinMutation.isPending}
//                 className="rounded-xl bg-gold-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-800 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {signinMutation.isPending ? "Signing in..." : "Sign in"}
//               </button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Cancel confirmation */}
//       <Dialog
//         open={showCancelConfirmation}
//         onOpenChange={setShowCancelConfirmation}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Leave sign in?</DialogTitle>
//           </DialogHeader>

//           <p className="text-sm text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)]">
//             Your session has expired. If you leave now, you will be
//             returned to the home page.
//           </p>

//           <DialogFooter>
//             <button
//               type="button"
//               onClick={() => setShowCancelConfirmation(false)}
//               className="rounded-xl border border-[var(--ek-border-soft)] px-4 py-2 text-sm font-medium text-[var(--ek-text-primary)] transition hover:bg-[rgba(154,106,0,0.06)] dark:border-[var(--ek-dark-border)] dark:text-[var(--ek-dark-text)]"
//             >
//               No
//             </button>

//             <button
//               type="button"
//               onClick={handleConfirmCancel}
//               className="rounded-xl bg-gold-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-800"
//             >
//               Yes
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }


"use client";

import { useState } from "react";
import {
  Lock,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useSignInUser } from "@repo/query-hook";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";

interface SessionExpiredSignInModalProps {
  open: boolean;
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export function SessionExpiredSignInModal({
  open,
  onLoginSuccess,
  onCancel,
}: SessionExpiredSignInModalProps) {
  const signinMutation = useSignInUser();

  const [form, setForm] = useState({
    contact: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] =
    useState(false);

  // Reset the entire modal whenever it closes.
  // useEffect(() => {
  //   if (!open) {
  //     setForm({
  //       contact: "",
  //       password: "",
  //     });

  //     setShowPassword(false);
  //     setShowCancelConfirmation(false);
  //     signinMutation.reset();
  //   }
  // }, [open, signinMutation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetModalState = () => {
  setForm({
    contact: "",
    password: "",
  });

  setShowPassword(false);
  setShowCancelConfirmation(false);
  signinMutation.reset();
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    signinMutation.mutate(form, {
      onSuccess: (data) => {
        if (data?.ok) {
          toast.success("Login Successful!!!");
          resetModalState();
          onLoginSuccess();
        } else if (data?.error) {
          toast.error(data.error);
        } else {
          toast.error("Unexpected error");
        }
      },
    });
  };

  const handleCancel = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    resetModalState();
    onCancel();
  };

  return (
    <>
      {/* Sign in again */}
      <Dialog
        open={open && !showCancelConfirmation}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleCancel();
          }
        }}
        overlayClassName="bg-black/55 backdrop-blur-[6px]"
      >
        <DialogContent className="max-w-md p-7 sm:p-8">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(154,106,0,0.10)] text-gold-700 dark:bg-[rgba(229,184,62,0.10)] dark:text-gold-500">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <DialogTitle className="text-xl">
                Sign in again
              </DialogTitle>

              <p className="mt-2 max-w-sm text-sm leading-5 text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)]">
                Your session has expired. Sign in again to continue
                where you left off.
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-5">
            {/* Contact */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
                <Phone size={16} />
                Contact
              </span>

              <input
                type="tel"
                name="contact"
                value={form.contact}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");

                  setForm((prev) => ({
                    ...prev,
                    contact: value,
                  }));
                }}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Enter your contact number"
                className="block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/20 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100 dark:placeholder:text-gray-500"
                required
              />
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
                <Lock size={16} />
                Password
              </span>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-[rgba(154,106,0,0.16)] bg-white px-3.5 py-2.5 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gold-700/40 focus:ring-2 focus:ring-gold-500/20 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-gray-100 dark:placeholder:text-gray-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center rounded-lg px-2 text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            <DialogFooter className="mt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={signinMutation.isPending}
                className="rounded-xl border border-[var(--ek-border-soft)] px-5 py-2.5 text-sm font-medium text-[var(--ek-text-primary)] transition hover:bg-[rgba(154,106,0,0.06)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--ek-dark-border)] dark:text-[var(--ek-dark-text)] dark:hover:bg-[rgba(229,184,62,0.08)]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={signinMutation.isPending}
                className="rounded-xl bg-gold-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gold-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signinMutation.isPending
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <Dialog
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        overlayClassName="bg-black/55 backdrop-blur-[6px]"
      >
        <DialogContent className="max-w-sm p-7">
          <DialogHeader>
            <DialogTitle>Leave sign in?</DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-6 text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)]">
            Your session has expired. If you leave now, you will
            be returned to the home page.
          </p>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowCancelConfirmation(false)}
              className="rounded-xl border border-[var(--ek-border-soft)] px-5 py-2.5 text-sm font-medium text-[var(--ek-text-primary)] transition hover:bg-[rgba(154,106,0,0.06)] dark:border-[var(--ek-dark-border)] dark:text-[var(--ek-dark-text)] dark:hover:bg-[rgba(229,184,62,0.08)]"
            >
              No
            </button>

            <button
              type="button"
              onClick={handleConfirmCancel}
              className="rounded-xl bg-gold-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gold-800"
            >
              Yes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
