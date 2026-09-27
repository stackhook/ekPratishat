type SessionExpiredListener = () => void;

let sessionExpiredListener: SessionExpiredListener | null = null;
let isLoggingOut = false;

export const sessionManager = {
  setSessionExpiredListener(listener: SessionExpiredListener) {
    sessionExpiredListener = listener;
  },

  clearSessionExpiredListener() {
    sessionExpiredListener = null;
  },

  startLogout() {
    isLoggingOut = true;
  },

  isLogoutInProgress() {
    return isLoggingOut;
  },

  notifySessionExpired() {
    if (isLoggingOut) {
      return;
    }
    sessionExpiredListener?.();
  },
};