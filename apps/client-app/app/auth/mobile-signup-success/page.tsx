
export default function MobileSignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ek-bg-main)] dark:bg-[var(--ek-dark-page)] dark:text-[var(--ek-dark-text)] px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Signup Successful!</h1>
        <p className="mb-6">Your account has been created successfully. You can now log in to the app.</p>
        <a
          href="https://play.google.com/store/apps/details?id=com.ekpratisat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
        >
          Download the App
        </a>
      </div>
    </div>
  );
}   