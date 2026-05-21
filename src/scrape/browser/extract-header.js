/* eslint-disable no-undef */
function extractHeaderInBrowser() {
  function clean(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  const h1 = clean(document.querySelector("h1")?.textContent);
  const nameSpan = Array.from(document.querySelectorAll("span")).find((el) => {
    const text = clean(el.textContent);
    return text.length > 2 && text.length < 80 && !/followers|following|friends/i.test(text);
  });

  const images = Array.from(document.querySelectorAll("img[src]"))
    .map((img) => img.src)
    .filter(Boolean);

  const profilePictureUrl =
    images.find((src) => src.includes("scontent") || src.includes("fbcdn")) || images[0];
  const coverPhotoUrl = images.find((src) => src.includes("cover") || src.includes("960x")) || images[1];

  const bodyText = clean(document.body.innerText);
  const followers = bodyText.match(/([\d.,KMB]+)\s+followers?/i)?.[0];
  const following = bodyText.match(/([\d.,KMB]+)\s+following/i)?.[0];
  const friends = bodyText.match(/([\d.,KMB]+)\s+friends?/i)?.[0];

  return {
    displayName: h1 || clean(nameSpan?.textContent) || undefined,
    profilePictureUrl,
    coverPhotoUrl,
    counts: { followers, following, friends },
    metaTitle:
      (document.querySelector('meta[property="og:title"]') || {}).content || document.title,
    metaDescription:
      (document.querySelector('meta[name="description"]') || {}).content ||
      (document.querySelector('meta[property="og:description"]') || {}).content,
  };
}
