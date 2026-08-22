import { createLocalJWKSet, createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export interface AccessEnv {
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ACCESS_JWKS_JSON?: string;
}

export interface AdminIdentity {
  email: string;
  subject: string;
}

function normalizeIssuer(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function keySet(env: AccessEnv) {
  if (env.ACCESS_JWKS_JSON) {
    const parsed = JSON.parse(env.ACCESS_JWKS_JSON) as { keys?: JsonWebKey[] };
    if (!Array.isArray(parsed.keys) || parsed.keys.length === 0) {
      throw new Error('ACCESS_JWKS_JSON must contain at least one key.');
    }
    return createLocalJWKSet(parsed as never);
  }
  const issuer = normalizeIssuer(env.ACCESS_TEAM_DOMAIN);
  return createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
}

function asAdminIdentity(payload: JWTPayload): AdminIdentity | null {
  if (payload.type !== 'app') return null;
  if (typeof payload.email !== 'string' || payload.email.length === 0) return null;
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) return null;
  return { email: payload.email, subject: payload.sub };
}

export async function verifyAccessRequest(request: Request, env: AccessEnv): Promise<AdminIdentity | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;

  try {
    const issuer = normalizeIssuer(env.ACCESS_TEAM_DOMAIN);
    const { payload } = await jwtVerify(token, keySet(env), {
      issuer,
      audience: env.ACCESS_AUD,
      algorithms: ['RS256'],
    });
    return asAdminIdentity(payload);
  } catch {
    return null;
  }
}
