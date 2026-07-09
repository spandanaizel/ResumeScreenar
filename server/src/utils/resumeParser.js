// Standard email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Extracts the first email address found in the resume text.
 * Returns an empty string if none found.
 */
const extractEmail = (resumeText) => {
  if (!resumeText) return "";
  const match = resumeText.match(EMAIL_REGEX);
  return match ? match[0] : "";
};

/**
 * Approximates the candidate's name using a simple heuristic:
 * the first non-empty line that doesn't look like an email, URL,
 * phone number, or a long sentence.
 */
const extractCandidateName = (resumeText) => {
  if (!resumeText) return "";

  const lines = resumeText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const hasEmail = line.includes("@");
    const hasDigits = /\d{3,}/.test(line);
    const looksLikeUrl = /(https?:\/\/|www\.)/i.test(line);
    const isReasonableLength = line.length > 1 && line.length <= 50;
    const wordCount = line.split(/\s+/).length;

    if (
      isReasonableLength &&
      !hasEmail &&
      !hasDigits &&
      !looksLikeUrl &&
      wordCount <= 5
    ) {
      return line;
    }
  }

  return "";
};

module.exports = { extractEmail, extractCandidateName };
