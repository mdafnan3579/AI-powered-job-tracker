import { create } from 'zustand';

const initialState = {
  jobDescription: '',
  resumeText: '',
  analysis: null,
  isLoading: false,
  error: null,
};

export const useAnalysisStore = create((set) => ({
  ...initialState,
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setResumeText: (resumeText) => set({ resumeText }),
  setAnalysis: (analysis) => set({ analysis }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
