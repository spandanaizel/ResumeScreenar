/**
 * Strips markdown code fences (```json ... ``` or ``` ... ```) that Gemini
 * sometimes wraps its JSON response in, and trims whitespace.
 */
const cleanJSONResponse = (rawText) => {
  if (typeof rawText !== "string") {
    return "";
  }

  let cleaned = rawText.trim();

  // Remove ```json or ``` at the start and ``` at the end
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");

  return cleaned.trim();
};

module.exports = { cleanJSONResponse };
