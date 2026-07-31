/**
 * Unified budget calculation helper across Admin & Sale Dashboards and Proposals lists.
 * Ensures 100% data consistency between personal sales view and admin dashboard.
 */

export function computeProposalAllocatedBudget(p: {
  allocatedBudget?: number | string | null;
  newStudents?: number | string | null;
  school?: { newStudents?: number | string | null } | null;
}): number {
  const dbAlloc = Number(p.allocatedBudget || 0);
  if (dbAlloc > 0) return dbAlloc;

  // Check if newStudents is explicitly set on proposal record
  if (p.newStudents !== undefined && p.newStudents !== null) {
    const propStudents = Number(p.newStudents || 0);
    if (propStudents > 0) {
      return Math.floor((propStudents * 100_000_000) / 105);
    }
    return 0;
  }

  const schoolStudents = Number(p.school?.newStudents || 0);
  if (schoolStudents > 0) {
    return Math.floor((schoolStudents * 100_000_000) / 105);
  }

  return 0;
}

export function deduplicateActiveProposals<T extends {
  id?: string;
  schoolId?: string | null;
  projectName?: string | null;
  status?: string | null;
  updatedAt?: Date | string | null;
  school?: { id?: string } | null;
}>(proposals: T[]): T[] {
  // 1. Exclude CLOSED status proposals
  const activeProposals = proposals.filter(p => p.status !== "CLOSED");

  // 2. Map newest proposal per school + project
  const map = new Map<string, T>();
  for (const p of activeProposals) {
    const schId = p.schoolId || p.school?.id;
    if (!schId) continue;
    const projName = (p.projectName || "IPRO").toString().toUpperCase().trim();
    const key = `${schId}_${projName}`;
    if (!map.has(key)) {
      map.set(key, p);
    }
  }

  return Array.from(map.values());
}
