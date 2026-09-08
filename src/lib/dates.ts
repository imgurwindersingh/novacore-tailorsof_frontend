/**
 * Local-timezone date (YYYY-MM-DD) `days` from today. Kept in local time so the
 * date picker and delivery day match the shop's calendar.
 */
export function datePlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}