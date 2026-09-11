
import SignupForm from "@repo/components/signUpForm";

import Link from "next/link";


export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const isMobileSignup = params.redirect === "mobile";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ek-bg-main)] dark:bg-[var(--ek-dark-page)] dark:text-[var(--ek-dark-text)] px-4">
      <div className="w-full max-w-md">
        <SignupForm isMobileSignup={isMobileSignup} />
        {
          !isMobileSignup && (
            <p className="text-sm mt-4 text-center">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-gold-700 dark:text-gold-400">Log in</Link>
            </p>
          )}
      </div>
    </div>
  );
}
