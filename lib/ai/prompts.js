export const analyzePrompt = (jd, resume) => `
You are an expert recruiter and resume coach.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "jobTitle": "string",
  "company": "string or null",
  "requiredSkills": { "hard": ["string"], "soft": ["string"] },
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "matchScore": number (0-100),
  "matchSummary": "2-sentence honest assessment",
  "tailoredResume": "full ATS-friendly resume text (plain text, standard headings) rewritten to match the JD keywords, using only skills the candidate really has",
  "coverLetter": "tailored cover letter text, 3 paragraphs"
}
`;

export const generateResumePrompt = (jd, resume, existingAnalysis) => `
You are an expert resume writer.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume}
${
  existingAnalysis
    ? `
PRIOR ANALYSIS (use it to focus the rewrite):
Matched skills: ${(existingAnalysis.matchedSkills ?? []).join(', ')}
Missing skills: ${(existingAnalysis.missingSkills ?? []).join(', ')}
`
    : ''
}
Rewrite the resume so it targets this job: mirror the job description's keywords where the candidate genuinely has the experience, reorder and emphasize the most relevant achievements, and keep it concise. Never invent employers, titles, dates, degrees or skills the candidate does not have.

Return ONLY the plain text of the tailored resume (no markdown fences, no commentary).
`;

export const generateCoverLetterPrompt = (jd, resume, jobTitle, company) => `
You are an expert career coach writing a cover letter.

JOB TITLE: ${jobTitle || 'the role'}
COMPANY: ${company || 'the company'}

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume}

Write a tailored, professional cover letter of exactly 3 paragraphs: (1) a strong opening showing interest and fit, (2) the most relevant achievements and skills from the resume mapped to the job's needs, (3) a confident closing with a call to action. Do not invent experience the candidate does not have.

Return ONLY the plain text of the cover letter (no markdown fences, no commentary).
`;

export const optimizePrompt = (jd, resume, approvedSkills, analysis) => `
You are an expert resume writer and ATS (applicant tracking system) specialist.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume}

The candidate has CONFIRMED they have, and want added to their resume, these skills that were missing:
${(approvedSkills ?? []).map((s) => `- ${s}`).join('\n') || '(none)'}

Skills already matched: ${(analysis?.matchedSkills ?? []).join(', ') || '(none)'}
Skills still missing and NOT approved (do NOT add these): ${(analysis?.missingSkills ?? []).filter((s) => !(approvedSkills ?? []).includes(s)).join(', ') || '(none)'}

Rewrite the resume and cover letter so they match the job description as closely as possible:
- ATS-friendly resume: plain text, single column, no tables, columns, icons or graphics; standard section headings in caps (SUMMARY, SKILLS, EXPERIENCE, EDUCATION, plus PROJECTS/CERTIFICATIONS only if the original has them); simple "-" bullets; reverse-chronological; contact details at the top.
- Use the job description's exact keyword phrasing (spelled out with acronyms where useful, e.g. "Continuous Integration (CI)") for every skill the candidate has or approved.
- Put every approved skill in a SKILLS section and work it naturally into the SUMMARY. Do not attach approved skills to specific employers, projects, dates or metrics, and do not invent employers, job titles, dates, degrees, certifications or numbers.
- Never add skills that are not matched or approved.
- Lead with the most relevant experience and mirror the job's language in the bullets.
- Cover letter: exactly 3 paragraphs, addressed to the hiring team, weaving in the job's key requirements and the approved skills, in confident first person. No invented experience.

Then estimate "matchScore" (0-100) as the share of the job description's required skills and keywords that now appear in the new resume.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact shape:
{
  "tailoredResume": "full ATS-friendly resume text",
  "coverLetter": "3 paragraph cover letter",
  "matchScore": number,
  "matchSummary": "2-sentence honest assessment of the updated resume"
}
`;
