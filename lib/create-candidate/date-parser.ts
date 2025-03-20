/**
 * Parses dates from various common string formats
 */
export function parseDate(dateStr: string): Date {
  try {
    // Handle various date formats
    const formats = [
      "MM/YYYY", // e.g. "12/2022"
      "M/YYYY", // e.g. "6/2022"
      "YYYY-MM-DD", // ISO format
      "DD/MM/YYYY", // European format
      "MMMM YYYY", // e.g. "June 2024"
    ];

    // First try parsing as is
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // If it's a month and year format like "June 2024"
    const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
    if (monthYearMatch) {
      const [_, month, year] = monthYearMatch;
      const date = new Date(`${month} 1, ${year}`);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // If it's "Present" or similar, return current date
    if (dateStr.toLowerCase() === "present") {
      return new Date();
    }

    // If no format matches, default to first day of current month
    console.warn(`Could not parse date: ${dateStr}, using current date`);
    return new Date();
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return new Date(); // Fallback to current date
  }
} 