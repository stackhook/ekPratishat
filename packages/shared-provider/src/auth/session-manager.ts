type SessionExpiredListener = () => void;

let sessionExpiredListener: SessionExpiredListener | null = null;

export const sessionManager = {
  setSessionExpiredListener(listener: SessionExpiredListener) {
    sessionExpiredListener = listener;
  },

  clearSessionExpiredListener() {
    sessionExpiredListener = null;
  },

  notifySessionExpired() {
    sessionExpiredListener?.();
  },
};