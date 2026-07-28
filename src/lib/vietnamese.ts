/**
 * Removes Vietnamese accents/diacritics and converts string to lowercase normalized form.
 * Example: "Bàn ghế giáo viên" -> "ban ghe giaovien"
 */
export function removeVietnameseAccents(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Checks if a target string contains a search query, ignoring Vietnamese diacritics/accents & case.
 * Example: vietnameseIncludes("Bàn ghế học sinh", "ghe") -> true
 * Example: vietnameseIncludes("THCS Nguyễn Trãi", "nguyen trai") -> true
 * If query is empty/whitespace, always returns true (matches all items).
 */
export function vietnameseIncludes(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!query || typeof query !== "string" || !query.trim()) return true;
  if (!target) return false;
  const cleanTarget = removeVietnameseAccents(target);
  const cleanQuery = removeVietnameseAccents(query);
  return cleanTarget.includes(cleanQuery);
}
