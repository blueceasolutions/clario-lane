import { useEffect, useState } from "react";

const REFERRAL_MODAL_STORAGE_KEY = "hasSeenReferralModal";
const DELAY_MS = 6000; // 6 seconds delay before showing the modal

export const useReferralModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal
    const hasSeenModal = localStorage.getItem(REFERRAL_MODAL_STORAGE_KEY);

    if (!hasSeenModal) {
      // Set a timeout to show the modal after a delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem(REFERRAL_MODAL_STORAGE_KEY, "true");
  };

  // Also allow closing by clicking outside or pressing escape
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  return {
    isOpen,
    handleOpenChange,
    closeModal,
  };
};
