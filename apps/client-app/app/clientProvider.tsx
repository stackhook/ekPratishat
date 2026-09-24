

// "use client";

// import { BaseProvider } from "@repo/shared-provider";


// export function ClientProvider({ children }: {children: React.ReactNode}){
//     return (
//         <BaseProvider>
//             {children}
//         </BaseProvider>
//     )
// }

"use client";

import { useEffect, useState } from "react";
import {
  BaseProvider,
  sessionManager,
  queryClient
} from "@repo/shared-provider";
import { SessionExpiredSignInModal } from "@repo/components/auth/session-expiry-modal";

import { useRouter } from "next/navigation";


export function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    sessionManager.setSessionExpiredListener(() => {
      setSessionExpired(true);
    });

    return () => {
      sessionManager.clearSessionExpiredListener();
    };
  }, []);

  return (
    <BaseProvider>
      {children}

      <SessionExpiredSignInModal
        open={sessionExpired}
        onLoginSuccess={() => {
          queryClient.clear();
          setSessionExpired(false);
        }}
        onCancel={() => {
          setSessionExpired(false);
          queryClient.clear();
          router.replace("/");
        }}
      />
    </BaseProvider>
  );
}