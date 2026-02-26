
/**
 * Calculates the percentage of academy progress based on completed modules vs schema.
 * @param completedModuleIds - Set or Array of completed module IDs.
 * @param schemaModuleIds - Array of all valid module IDs in the schema.
 * @returns Integer percentage (0-100).
 */
export function calculateAcademyProgress(
  completedModuleIds: Set<string> | string[],
  schemaModuleIds: string[]
): number {
  const totalModules = schemaModuleIds.length;
  if (totalModules === 0) return 0;

  const completedSet = new Set(completedModuleIds);
  // Count only modules that exist in the schema
  const validCompletedCount = schemaModuleIds.filter(id => completedSet.has(id)).length;

  return Math.round((validCompletedCount / totalModules) * 100);
}
