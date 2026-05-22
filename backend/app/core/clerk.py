import os
import requests
import time
import sys
from jose import jwt, jwk, JWTError
from jose.constants import ALGORITHMS
from typing import Optional

CLERK_PUBLISHABLE_KEY = os.getenv(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    os.getenv("CLERK_PUBLISHABLE_KEY", ""),
)

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")

CLERK_DOMAIN_OVERRIDE = os.getenv("CLERK_DOMAIN", "")

_jwks_cache: dict = {}
_jwks_cache_time: float = 0
JWKS_CACHE_TTL = 3600


def log(msg: str):
    print(f"[clerk] {msg}", flush=True)


def _get_clerk_domain() -> str:
    if CLERK_DOMAIN_OVERRIDE:
        log(f"using CLERK_DOMAIN override: {CLERK_DOMAIN_OVERRIDE}")
        return CLERK_DOMAIN_OVERRIDE
    if not CLERK_PUBLISHABLE_KEY:
        log("CLERK_PUBLISHABLE_KEY not set")
        return ""
    parts = CLERK_PUBLISHABLE_KEY.split("_")
    if len(parts) >= 3:
        try:
            import base64
            decoded = base64.b64decode(parts[-1]).decode("utf-8")
            log(f"domain from publishable key: {decoded}")
            return decoded
        except Exception:
            pass
    try:
        import base64
        decoded = base64.b64decode(CLERK_PUBLISHABLE_KEY).decode("utf-8")
        if "." in decoded and " " not in decoded:
            log(f"domain from raw publishable key: {decoded}")
            return decoded
    except Exception:
        pass
    return ""


def _get_domain_from_token(token: str) -> str:
    try:
        unverified_payload = jwt.get_unverified_claims(token)
        iss = unverified_payload.get("iss", "")
        if iss:
            domain = iss.replace("https://", "").rstrip("/")
            log(f"domain from token iss: {domain}")
            return domain
        log("no iss claim in token")
    except Exception as e:
        log(f"failed to extract claims from token: {e}")
    return ""


def get_clerk_user_email(user_id: str) -> Optional[str]:
    if not CLERK_SECRET_KEY:
        return None
    try:
        resp = requests.get(
            f"https://api.clerk.com/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
            timeout=10,
        )
        if resp.ok:
            data = resp.json()
            email_addr = data.get("email_address", "")
            if email_addr and "@" in email_addr:
                return email_addr
            emails = data.get("email_addresses", [])
            if emails:
                primary = next(
                    (e["email_address"] for e in emails if e.get("id") == data.get("primary_email_address_id")),
                    None,
                )
                if primary:
                    return primary
                return emails[0].get("email_address")
        log(f"clerk API user fetch failed: {resp.status_code}")
        return None
    except Exception as e:
        log(f"clerk API exception: {e}")
        return None


def get_jwks(domain: Optional[str] = None) -> dict:
    global _jwks_cache, _jwks_cache_time
    if not domain:
        domain = _get_clerk_domain()
    if not domain:
        raise ValueError(
            "Clerk domain not found. "
            "Set CLERK_DOMAIN env var or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY."
        )

    now = time.time()
    _cache_key = domain
    cached = _jwks_cache.get(_cache_key)
    if cached is None or (now - _jwks_cache_time) > JWKS_CACHE_TTL:
        url = f"https://{domain}/.well-known/jwks.json"
        log(f"fetching JWKS from {url}")
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        _jwks_cache[_cache_key] = resp.json()
        _jwks_cache_time = now

    return _jwks_cache[_cache_key]


def verify_token_via_clerk_api(token: str) -> Optional[dict]:
    if not CLERK_SECRET_KEY:
        return None
    try:
        resp = requests.post(
            "https://api.clerk.com/v1/tokens/verify",
            headers={
                "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            json={"token": token},
            timeout=10,
        )
        if resp.ok:
            log("token verified via Clerk API")
            return resp.json()
        log(f"Clerk API token verify failed: {resp.status_code} {resp.text[:200]}")
        return None
    except Exception as e:
        log(f"Clerk API token verify exception: {e}")
        return None


def verify_clerk_token(token: str) -> Optional[dict]:
    # Try Clerk API verification first (most reliable)
    api_result = verify_token_via_clerk_api(token)
    if api_result:
        return api_result

    # Fall back to JWKS-based verification
    try:
        domain = _get_clerk_domain()
        if not domain:
            domain = _get_domain_from_token(token)
        if not domain:
            log("domain not found from env or token")
            return None

        jwks = get_jwks(domain)
        unverified_header = jwt.get_unverified_header(token)
        log(f"token kid: {unverified_header.get('kid')}")

        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == unverified_header.get("kid"):
                rsa_key = key
                break

        if not rsa_key:
            log("no matching key in JWKS")
            return None

        key = jwk.construct(rsa_key, algorithm=ALGORITHMS.RS256)
        payload = jwt.decode(
            token,
            key,
            algorithms=[ALGORITHMS.RS256],
            issuer=f"https://{domain}",
            options={"verify_audience": False},
        )
        log("token verified via JWKS")

        if not payload.get("email"):
            user_id = payload.get("sub", "")
            if user_id:
                email = get_clerk_user_email(user_id)
                if email:
                    payload["email"] = email

        return payload
    except ValueError as e:
        log(f"JWKS error: {e}")
        return None
    except JWTError as e:
        log(f"JWT verification error: {e}")
        return None
    except Exception as e:
        log(f"unexpected error: {type(e).__name__}: {e}")
        return None
