let token: string | null = null;

export function setClerkToken(t: string | null) {
  token = t;
}

export function getClerkToken() {
  return token;
}
