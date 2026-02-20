import { useState, useCallback, useRef } from "react";

const ANIMATION_CYCLE_MS = 8000; // One full CeipaLoader drawing cycle

/**
 * Hook to manage processing state with the CeipaLoader.
 * Ensures the loader is shown for at least one full animation cycle.
 * 
 * Usage:
 *   const { isProcessing, runWithLoader } = useProcessing();
 *   
 *   // In your submit handler:
 *   const handleSubmit = () => {
 *     runWithLoader(async () => {
 *       await saveData();
 *       navigate("/next");
 *     });
 *   };
 * 
 *   // In your JSX:
 *   {isProcessing && <CeipaLoader />}
 */
const useProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef(null);

  const runWithLoader = useCallback(async (asyncFn) => {
    setIsProcessing(true);
    startTimeRef.current = Date.now();

    try {
      await asyncFn();
    } finally {
      // Wait for at least one full animation cycle
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = ANIMATION_CYCLE_MS - (elapsed % ANIMATION_CYCLE_MS);
      if (remaining > 0 && remaining < ANIMATION_CYCLE_MS) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, runWithLoader };
};

export default useProcessing;
