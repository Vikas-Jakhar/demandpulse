import { prisma } from "@/lib/db/prisma";

export class ForbiddenError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Ownership guards for the two resources a user's session should never be
 * able to reach outside of their own account: their Datasets and their
 * Forecasts. `requireUser()` (require-user.ts) answers "is this request
 * authenticated"; these answer "does *this* authenticated user own *this*
 * specific row" — a check that has to happen per-request, per-resource-id,
 * because authentication alone doesn't imply authorization over someone
 * else's data.
 *
 * Deliberately throws the same "not found" shape whether the row doesn't
 * exist or belongs to someone else, rather than a distinct 403. Returning a
 * different error for "exists but isn't yours" vs. "doesn't exist" lets an
 * attacker enumerate valid IDs belonging to other users by watching which
 * response they get back — collapsing both cases into 404 avoids that leak.
 */

export async function requireDatasetOwnership(datasetId: string, userId: string) {
  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
  if (!dataset || dataset.userId !== userId) {
    throw new ForbiddenError();
  }
  return dataset;
}

export async function requireForecastOwnership(forecastId: string, userId: string) {
  const forecast = await prisma.forecast.findUnique({ where: { id: forecastId } });
  if (!forecast || forecast.userId !== userId) {
    throw new ForbiddenError();
  }
  return forecast;
}

/**
 * Example usage in a future Phase 3+ route handler:
 *
 *   export const GET = withAuth(async (req, session, { params }) => {
 *     try {
 *       const dataset = await requireDatasetOwnership(params.id, session.sub);
 *       const rows = await prisma.datasetRow.findMany({ where: { datasetId: dataset.id } });
 *       return NextResponse.json({ dataset, rows });
 *     } catch (err) {
 *       if (err instanceof ForbiddenError) {
 *         return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
 *       }
 *       throw err;
 *     }
 *   });
 */
