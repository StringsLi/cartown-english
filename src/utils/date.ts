export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateTime(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function isYesterday(dateKey: string, base = new Date()): boolean {
  const yesterday = new Date(base);
  yesterday.setDate(base.getDate() - 1);

  return todayKey(yesterday) === dateKey;
}
