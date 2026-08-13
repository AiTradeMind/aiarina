import { AuthenticatedRequest } from "../middleware/auth.ts";
import { MembershipRepository } from "../modules/identity/repositories/index.ts";
import { isInvalidOrg } from "./utils.ts";

const membershipRepo = new MembershipRepository();

/**
 * Resolves the organization ID from the request context.
 * Prioritizes the x-organization-id header, then user membership.
 * In development mode, may return null if no org context is provided.
 */
export async function getOrgId(req: AuthenticatedRequest): Promise<string | null> {
  const headerOrgId = req.headers["x-organization-id"] as string;
  if (headerOrgId && !isInvalidOrg(headerOrgId)) return headerOrgId;

  if (req.user?.userId) {
    try {
      const memberships = await membershipRepo.getMembershipsForUser(req.user.userId);
      if (memberships.length > 0 && !isInvalidOrg(memberships[0].organizationId)) {
        return memberships[0].organizationId;
      }
    } catch (e) {
      // ignore
    }
  }

  // Fallback for development if needed (previously used isDevAuth() from env.ts)
  // This module is only used on the backend, so we don't need env.ts here.
  const isDev = false; 
  if (isDev) {
    return null;
  }

  if (!req.user) throw new Error("Unauthorized");
  return null;
}
