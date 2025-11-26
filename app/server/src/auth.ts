import { jwtVerify, createRemoteJWKSet } from "jose";
import type { Request, Response, NextFunction } from "express";

export interface User {
  email: string;
  sub: string; // subject/user ID
  name?: string;
  preferred_username?: string;
  roles?: string[];
}

export interface KeycloakJwtPayload {
  email?: string;
  sub?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
  resource_access?: { [clientId: string]: { roles: string[] } };
  [key: string]: unknown;
}

declare module "express" {
  interface Request {
    user?: User;
  }
}

const ISSUER = process.env.KEYCLOAK_ISSUER!;
const AUDIENCE = process.env.KEYCLOAK_AUDIENCE!;
const JWKS_URI =
  process.env.KEYCLOAK_JWKS_URI || `${ISSUER}/protocol/openid-connect/certs`;

export async function verifyJWT(authHeader: string): Promise<User> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error(
      'Invalid authorization header format. Expected "Bearer <token>"'
    );
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  if (!token) {
    throw new Error("No token provided in authorization header");
  }

  const jwks = createRemoteJWKSet(new URL(JWKS_URI));

  const { payload } = await jwtVerify(token, jwks, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  const keycloakPayload = payload as KeycloakJwtPayload;

  const user: User = {
    email: keycloakPayload.email as string,
    sub: keycloakPayload.sub as string,
    name: keycloakPayload.name as string,
    preferred_username: keycloakPayload.preferred_username as string,
    roles: [
      ...(keycloakPayload.realm_access?.roles || []),
      ...(keycloakPayload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]
        ?.roles || []),
    ],
  };

  if (!user.email) {
    throw new Error("Token does not contain required email claim");
  }
  if (!user.sub) {
    throw new Error("Token does not contain required subject claim");
  }

  return user;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Authorization header required" });
      return;
    }

    const user = await verifyJWT(authHeader);
    req.user = user;
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";

    res.status(401).json({
      error: "Unauthorized",
      message: errorMessage,
    });
    return;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (!user.roles?.includes("admin")) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
