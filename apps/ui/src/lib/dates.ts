
export function formatDate(published: Date | undefined): string {
  if (!published) return "";
  const date = published instanceof Date ? published : new Date(published);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const locale = window.navigator.language;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSeconds < 60) return rtf.format(-diffSeconds, "second");
  if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");

  const parts = rtf.formatToParts(-1, "day");
  const yesterdayLiteral = parts.map((p) => p.value).join("");
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  if (date >= startOfYesterday && date < startOfToday)
    return yesterdayLiteral;

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(locale, {
    ...(sameYear ? {} : { year: "numeric" }),
    month: "short",
    day: "numeric",
  });
}
