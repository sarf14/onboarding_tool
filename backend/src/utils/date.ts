/**
 * Get current date/time in Indian Standard Time (IST - UTC+5:30)
 * @returns ISO string in IST timezone
 */
export function getISTDate(): string {
  const now = new Date();
  
  // Get UTC time components
  const utcYear = now.getUTCFullYear();
  const utcMonth = now.getUTCMonth();
  const utcDate = now.getUTCDate();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const utcMilliseconds = now.getUTCMilliseconds();
  
  // Add IST offset (UTC+5:30)
  let istHours = utcHours + 5;
  let istMinutes = utcMinutes + 30;
  let istDate = utcDate;
  let istMonth = utcMonth;
  let istYear = utcYear;
  
  // Handle minute overflow
  if (istMinutes >= 60) {
    istMinutes -= 60;
    istHours += 1;
  }
  
  // Handle hour overflow
  if (istHours >= 24) {
    istHours -= 24;
    istDate += 1;
  }
  
  // Handle date overflow (simplified - doesn't account for month lengths)
  if (istDate > 31) {
    istDate = 1;
    istMonth += 1;
  }
  
  // Handle month overflow
  if (istMonth >= 12) {
    istMonth = 0;
    istYear += 1;
  }
  
  // Format as ISO string with IST timezone
  const year = String(istYear).padStart(4, '0');
  const month = String(istMonth + 1).padStart(2, '0');
  const day = String(istDate).padStart(2, '0');
  const hours = String(istHours).padStart(2, '0');
  const minutes = String(istMinutes).padStart(2, '0');
  const seconds = String(utcSeconds).padStart(2, '0');
  const milliseconds = String(utcMilliseconds).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
}

/**
 * Get a date X days ago in IST
 * @param days - Number of days ago
 * @returns ISO string in IST timezone
 */
export function getISTDateDaysAgo(days: number): string {
  const now = new Date();
  const daysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  // Get UTC time components
  const utcYear = daysAgo.getUTCFullYear();
  const utcMonth = daysAgo.getUTCMonth();
  const utcDate = daysAgo.getUTCDate();
  const utcHours = daysAgo.getUTCHours();
  const utcMinutes = daysAgo.getUTCMinutes();
  const utcSeconds = daysAgo.getUTCSeconds();
  const utcMilliseconds = daysAgo.getUTCMilliseconds();
  
  // Add IST offset (UTC+5:30)
  let istHours = utcHours + 5;
  let istMinutes = utcMinutes + 30;
  let istDate = utcDate;
  let istMonth = utcMonth;
  let istYear = utcYear;
  
  // Handle minute overflow
  if (istMinutes >= 60) {
    istMinutes -= 60;
    istHours += 1;
  }
  
  // Handle hour overflow
  if (istHours >= 24) {
    istHours -= 24;
    istDate += 1;
  }
  
  // Handle date overflow (simplified - doesn't account for month lengths)
  if (istDate > 31) {
    istDate = 1;
    istMonth += 1;
  }
  
  // Handle month overflow
  if (istMonth >= 12) {
    istMonth = 0;
    istYear += 1;
  }
  
  // Format as ISO string with IST timezone
  const year = String(istYear).padStart(4, '0');
  const month = String(istMonth + 1).padStart(2, '0');
  const day = String(istDate).padStart(2, '0');
  const hours = String(istHours).padStart(2, '0');
  const minutes = String(istMinutes).padStart(2, '0');
  const seconds = String(utcSeconds).padStart(2, '0');
  const milliseconds = String(utcMilliseconds).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
}

/**
 * Convert a Date object to IST ISO string
 * @param date - Date object to convert
 * @returns ISO string in IST timezone
 */
export function getISTDateFromDate(date: Date): string {
  // Get UTC time components
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const utcSeconds = date.getUTCSeconds();
  const utcMilliseconds = date.getUTCMilliseconds();
  
  // Add IST offset (UTC+5:30)
  let istHours = utcHours + 5;
  let istMinutes = utcMinutes + 30;
  let istDate = utcDate;
  let istMonth = utcMonth;
  let istYear = utcYear;
  
  // Handle minute overflow
  if (istMinutes >= 60) {
    istMinutes -= 60;
    istHours += 1;
  }
  
  // Handle hour overflow
  if (istHours >= 24) {
    istHours -= 24;
    istDate += 1;
  }
  
  // Handle date overflow (simplified - doesn't account for month lengths)
  if (istDate > 31) {
    istDate = 1;
    istMonth += 1;
  }
  
  // Handle month overflow
  if (istMonth >= 12) {
    istMonth = 0;
    istYear += 1;
  }
  
  // Format as ISO string with IST timezone
  const year = String(istYear).padStart(4, '0');
  const month = String(istMonth + 1).padStart(2, '0');
  const day = String(istDate).padStart(2, '0');
  const hours = String(istHours).padStart(2, '0');
  const minutes = String(istMinutes).padStart(2, '0');
  const seconds = String(utcSeconds).padStart(2, '0');
  const milliseconds = String(utcMilliseconds).padStart(3, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:30`;
}
