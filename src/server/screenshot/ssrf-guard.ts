import { promises as dns } from 'dns';

/**
 * SSRF guard for the screenshot worker.
 *
 * Before launching Playwright on a user-supplied URL, we:
 *   - Verify the scheme is `http` or `https`.
 *   - Resolve the hostname's A/AAAA records.
 *   - Reject the request if any resolved IP is in a private / loopback /
 *     link-local / metadata range.
 *
 * The check returns a typed `SsrfError` rather than throwing a generic
 * Error so the caller can branch on the reason (logging vs. retry).
 */

export class SsrfError extends Error {
  constructor(
    message: string,
    readonly reason: SsrfErrorReason
  ) {
    super(message);
    this.name = 'SsrfError';
  }
}

export type SsrfErrorReason =
  | 'invalid-url'
  | 'unsupported-scheme'
  | 'unresolvable-host'
  | 'private-ip'
  | 'metadata-endpoint';

const FORBIDDEN_HOSTS = new Set(['localhost', 'metadata.google.internal', 'metadata.aws.internal']);

const FORBIDDEN_HOSTNAME_SUFFIXES = ['.localhost', '.internal'];

interface ResolveFn {
  (host: string): Promise<string[]>;
}

const defaultResolve: ResolveFn = async (host) => {
  const [v4, v6] = await Promise.allSettled([dns.resolve4(host), dns.resolve6(host)]);
  const out: string[] = [];
  if (v4.status === 'fulfilled') out.push(...v4.value);
  if (v6.status === 'fulfilled') out.push(...v6.value);
  return out;
};

export async function assertSafeUrl(
  rawUrl: string,
  resolve: ResolveFn = defaultResolve
): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfError(`Invalid URL: ${rawUrl}`, 'invalid-url');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SsrfError(`Unsupported scheme: ${url.protocol}`, 'unsupported-scheme');
  }

  const host = url.hostname.toLowerCase();
  if (FORBIDDEN_HOSTS.has(host)) {
    throw new SsrfError(`Blocked host: ${host}`, 'metadata-endpoint');
  }
  if (FORBIDDEN_HOSTNAME_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new SsrfError(`Blocked hostname suffix: ${host}`, 'metadata-endpoint');
  }

  // If the hostname is already an IP literal, validate it directly.
  if (looksLikeIp(host)) {
    if (isPrivateIp(host)) {
      throw new SsrfError(`Blocked private IP: ${host}`, 'private-ip');
    }
    return url;
  }

  let addresses: string[] = [];
  try {
    addresses = await resolve(host);
  } catch (err) {
    throw new SsrfError(
      `DNS resolution failed for ${host}: ${err instanceof Error ? err.message : String(err)}`,
      'unresolvable-host'
    );
  }
  if (addresses.length === 0) {
    throw new SsrfError(`No DNS records for ${host}`, 'unresolvable-host');
  }
  for (const addr of addresses) {
    if (isPrivateIp(addr)) {
      throw new SsrfError(`Resolved to private IP ${addr} for host ${host}`, 'private-ip');
    }
  }
  return url;
}

function looksLikeIp(host: string): boolean {
  return /^[0-9.]+$/.test(host) || host.includes(':');
}

/**
 * Checks RFC1918 v4 ranges, loopback, link-local, multicast, and a couple
 * of common cloud metadata addresses. Also covers IPv6 loopback / unique
 * local / link-local.
 */
export function isPrivateIp(addr: string): boolean {
  if (!addr) return true;
  // Strip IPv4-mapped IPv6 prefix: ::ffff:10.0.0.1 → 10.0.0.1
  const cleaned = addr.replace(/^::ffff:/i, '').toLowerCase();

  // IPv4 checks
  if (/^[0-9.]+$/.test(cleaned)) {
    const parts = cleaned.split('.').map((p) => Number(p));
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
      return true;
    }
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local + AWS metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  // IPv6 checks
  if (cleaned === '::1' || cleaned === '::') return true;
  if (cleaned.startsWith('fe80:')) return true; // link-local
  if (cleaned.startsWith('fc') || cleaned.startsWith('fd')) return true; // unique local
  return false;
}
