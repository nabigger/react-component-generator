import { useState, useCallback } from 'react';

interface ComponentState {
  prompt: string;
  code: string;
  isLoading: boolean;
  error: string | null;
}

export function useComponentState() {
  const [state, setState] = useState<ComponentState>({
    prompt: '',
    code: '',
    isLoading: false,
    error: null,
  });

  const updatePrompt = useCallback((prompt: string) => {
    setState(prev => ({ ...prev, prompt }));
  }, []);

  const updateCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, code }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState({
      prompt: '',
      code: '',
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    updatePrompt,
    updateCode,
    setLoading,
    setError,
    reset,
  };
}
