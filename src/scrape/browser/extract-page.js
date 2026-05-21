/* eslint-disable no-undef */
function extractPageInBrowser(maxText) {
  function clean(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function decodeFacebookRedirect(href) {
    try {
      const url = new URL(href);
      if (!url.hostname.includes("facebook.com") || !url.pathname.includes("/l.php")) return href;
      const target = url.searchParams.get("u");
      return target ? decodeURIComponent(target) : href;
    } catch {
      return href;
    }
  }

  function uniquePush(list, value) {
    if (!value || list.includes(value)) return;
    list.push(value);
  }

  function findSectionByHeading(title) {
    const heading = Array.from(document.querySelectorAll("h2, h3")).find(
      (el) => clean(el.textContent) === title,
    );
    if (!heading) return null;

    if (heading.id) {
      const labelled = document.querySelector(`[aria-labelledby="${heading.id}"]`);
      if (labelled) return labelled;
    }

    return (
      heading.closest('[role="list"]')?.parentElement ??
      heading.closest("div")?.parentElement?.parentElement ??
      heading.parentElement
    );
  }

  const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4"))
    .map((el) => clean(el.textContent))
    .filter((text) => text.length > 0 && text.length < 200);

  const links = [];
  const seenHrefs = new Set();
  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = decodeFacebookRedirect(anchor.href);
    if (!href || seenHrefs.has(href) || href.startsWith("javascript:")) continue;
    const text = clean(anchor.innerText || anchor.textContent);
    if (!text && !href.includes("http")) continue;
    seenHrefs.add(href);
    links.push({ text: text || href, href });
    if (links.length >= 150) break;
  }

  const sectionTitles = ["Links", "Contact info", "About", "Posts", "Intro", "Details", "Overview"];
  const sections = [];

  for (const title of sectionTitles) {
    const root = findSectionByHeading(title);
    if (!root) continue;

    const lines = [];
    for (const item of root.querySelectorAll('[role="listitem"], li')) {
      const text = clean(item.textContent);
      if (!text || text === title || text.length > 400) continue;
      uniquePush(lines, text);
      if (lines.length >= 40) break;
    }

    const sectionLinks = [];
    const seen = new Set();
    for (const anchor of root.querySelectorAll("a[href]")) {
      const href = decodeFacebookRedirect(anchor.href);
      if (!href || seen.has(href)) continue;
      seen.add(href);
      sectionLinks.push({
        text: clean(anchor.innerText || anchor.textContent) || href,
        href,
      });
      if (sectionLinks.length >= 30) break;
    }

    if (lines.length > 0 || sectionLinks.length > 0) {
      sections.push({ title, lines, links: sectionLinks });
    }
  }

  const listItems = Array.from(document.querySelectorAll('[role="listitem"], li'))
    .map((el) => clean(el.textContent))
    .filter((text) => text.length > 2 && text.length < 400)
    .slice(0, 80);

  const postsPreview = Array.from(document.querySelectorAll('[role="article"]'))
    .map((el) => clean(el.textContent))
    .filter((text) => text.length > 20)
    .slice(0, 15);

  const main =
    document.querySelector('[role="main"]') ??
    document.querySelector("#screen-root") ??
    document.body;
  const visibleText = clean(main ? main.textContent : "").slice(0, maxText);

  return {
    title: document.title,
    metaDescription:
      (document.querySelector('meta[name="description"]') || {}).content ||
      (document.querySelector('meta[property="og:description"]') || {}).content,
    headings: Array.from(new Set(headings)),
    links,
    sections,
    listItems: Array.from(new Set(listItems)),
    visibleText,
    postsPreview,
  };
}
