/**
 * Shared Next.js data-cache tags.
 *
 * Keep these in a leaf module (no DB/Next imports) so route handlers can
 * import a tag without pulling in the service that defines the cached
 * functions.
 */

/**
 * Roster projections derived from player stats. Invalidate this whenever
 * stats are entered or a team's roster changes (trade accepted, draft
 * completed), since the projection reads the current roster.
 */
export const ROSTER_PROJECTION_CACHE_TAG = "roster-projections";