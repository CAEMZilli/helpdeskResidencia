export const isValidEmail = (email: unknown): email is string => {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};

export const sanitizeString = (val: unknown): string => {
  if (typeof val !== "string") return "";
  // Strip HTML tags and trim whitespace
  return val.replace(/<[^>]*>/g, "").trim();
};
