const FACEBOOK_HOSTS = new Set(["facebook.com", "www.facebook.com", "m.facebook.com"]);

export function normalizeFacebookProfileUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Invalid profile URL: ${input}`);
  }

  const host = url.hostname.replace(/^www\./, "");
  if (!FACEBOOK_HOSTS.has(url.hostname) && host !== "facebook.com") {
    throw new Error(`URL must be a Facebook profile link (got host: ${url.hostname})`);
  }

  if (!url.pathname || url.pathname === "/") {
    throw new Error("URL must point to a Facebook profile path (e.g. https://www.facebook.com/username)");
  }

  url.hash = "";
  return url.toString();
}
