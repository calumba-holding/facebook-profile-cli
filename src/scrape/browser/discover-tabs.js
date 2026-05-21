/* eslint-disable no-undef */
function discoverTabsInBrowser() {
  function clean(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  const tablist = document.querySelector('[role="tablist"]');
  if (!tablist) return [];

  const tabs = [];
  for (const tab of tablist.querySelectorAll('[role="tab"]')) {
    const name = clean(tab.textContent);
    if (!name || name.toLowerCase() === "more") continue;
    const link = tab.closest("a") || (tab.matches("a") ? tab : null);
    const href = link && link.href ? link.href : tab.getAttribute("href") || undefined;
    tabs.push({ name, href: href || undefined });
  }

  return tabs;
}
