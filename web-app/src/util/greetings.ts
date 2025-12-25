/**
 * Returns a greeting message based on the current time of day.
 *
 * @returns {string} A greeting string like "Good morning", "Good afternoon", etc.
 */
export const getGreetingBasedOnTime = (): string => {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning";
  }
  if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon";
  }
  if (currentHour >= 18 && currentHour < 22) {
    return "Good evening";
  }
  return "Good night";
};
