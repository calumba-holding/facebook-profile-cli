/* eslint-disable no-undef */
function extractPhotosInBrowser() {
  function clean(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  const photos = [];
  const seenHref = new Set();

  const selectors = [
    'a[href*="photo.php"]',
    'a[href*="/photo/"]',
    'a[role="link"][href*="fbid="]',
  ];

  for (const selector of selectors) {
    for (const anchor of document.querySelectorAll(selector)) {
      const href = anchor.href;
      if (!href || seenHref.has(href) || href.startsWith("javascript:")) continue;

      const img = anchor.querySelector("img[src]");
      const imageUrl = img && img.src ? img.src : undefined;
      if (!imageUrl && !href.includes("photo")) continue;

      seenHref.add(href);
      photos.push({
        href,
        imageUrl: imageUrl || null,
        alt: img ? clean(img.alt) || null : null,
      });
    }
  }

  return photos;
}
