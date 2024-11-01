import { useEffect } from 'react';

/**
 * Custom hook for handling beforeunload event
 * Shows confirmation dialog when user tries to leave page with unsaved changes
 *
 * @param shouldPreventUnload - Boolean flag indicating if unload should be prevented
 * @param message - Optional custom message to show in confirmation dialog
 *
 * @example
 * // Show confirmation when form is dirty
 * const [isDirty, setIsDirty] = useState(false)
 * useBeforeUnload(isDirty, 'You have unsaved changes. Are you sure you want to leave?')
 *
 * // Basic usage
 * useBeforeUnload(true)
 */
export const useBeforeUnload = (shouldPreventUnload: boolean, message: string = 'Are you sure you want to leave? Changes you made may not be saved.') => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldPreventUnload) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    // Add event listener when component mounts
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPreventUnload, message]);
};
