export function formatDate(published: Date | undefined): string {
  if (!published) return "";

  const locale = window.navigator.language;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const zone = Temporal.Now.zonedDateTimeISO().timeZoneId;
  const date = published.toTemporalInstant().toZonedDateTimeISO(zone);
  const now = Temporal.Now.zonedDateTimeISO(zone);

  const seconds = now.since(date, { largestUnit: "seconds" }).total({ unit: "seconds" });
  if (seconds < 60) return rtf.format(-Math.floor(seconds), "second");

  const minutes = seconds / 60;
  if (minutes < 60) return rtf.format(-Math.floor(minutes), "minute");

  const hours = minutes / 60;
  if (hours < 24) return rtf.format(-Math.floor(hours), "hour");

  const days = Math.floor(now.since(date, { largestUnit: "days" }).days);
  if (days < 2) return rtf.format(-days, "day");

  const sameYear = date.year === now.year;
  return date.toLocaleString(locale, {
    ...(sameYear ? {} : { year: "numeric" }),
    month: "short",
    day: "numeric",
  });
}
