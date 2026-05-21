/* eslint-disable no-undef */
function extractOverviewInBrowser() {
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

  const sectionTitles = ["Links", "Contact info", "Intro", "About"];
  const sections = [];

  for (const title of sectionTitles) {
    const root = findSectionByHeading(title);
    if (!root) continue;

    const lines = [];
    const links = [];
    const seenHref = new Set();

    for (const item of root.querySelectorAll('[role="listitem"], li')) {
      const text = clean(item.textContent);
      if (!text || text === title || text.length > 400) continue;
      uniquePush(lines, text);
    }

    for (const anchor of root.querySelectorAll("a[href]")) {
      const href = decodeFacebookRedirect(anchor.href);
      if (!href || seenHref.has(href)) continue;
      seenHref.add(href);
      links.push({
        text: clean(anchor.innerText || anchor.textContent) || href,
        href,
      });
    }

    if (lines.length > 0 || links.length > 0) {
      sections.push({ title, lines: lines.slice(0, 30), links: links.slice(0, 20) });
    }
  }

  const allLinks = [];
  const seen = new Set();
  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = decodeFacebookRedirect(anchor.href);
    if (!href || seen.has(href)) continue;
    seen.add(href);
    allLinks.push({
      text: clean(anchor.innerText || anchor.textContent) || href,
      href,
    });
    if (allLinks.length >= 80) break;
  }

  const postsPreview = Array.from(document.querySelectorAll('[role="article"]'))
    .map((el) => clean(el.textContent))
    .filter((text) => text.length > 20)
    .slice(0, 15);

  const displayName =
    clean(document.querySelector("h1")?.textContent) ||
    clean(document.querySelector('[role="main"] span')?.textContent);

  return { sections, links: allLinks, postsPreview, displayName };
}
