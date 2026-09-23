const stripFences = (raw) => String(raw ?? '').replace(/```json|```/g, '').trim();

export const safeParseAnalysis = (raw) => {
  try {
    return JSON.parse(stripFences(raw));
  } catch {
    // Return a safe empty shell so UI doesn't crash
    return {
      jobTitle: 'Unknown',
      company: null,
      requiredSkills: { hard: [], soft: [] },
      matchedSkills: [],
      missingSkills: [],
      matchScore: 0,
      matchSummary: 'Analysis failed. Please try again.',
      tailoredResume: '',
      coverLetter: '',
    };
  }
};

export const safeParse = (raw, fallback = null) => {
  try {
    return JSON.parse(stripFences(raw));
  } catch {
    return fallback;
  }
};
