/* Shared light/dark theme for every page on the root site.

   Loaded synchronously from <head>, after the theme-color metas, so a
   saved choice lands before first paint instead of flashing the OS
   theme first. Storage access is wrapped because browsers that block
   site data throw on localStorage; the toggle then still works, it just
   can't remember the choice. */
(function () {
  var KEY = "kranmal-theme";
  var root = document.documentElement;

  /* the browser chrome should follow the page once the visitor has
     picked a theme, not the OS, so remember each meta's own tint */
  var metas = [].slice.call(document.querySelectorAll('meta[name="theme-color"]'));
  var tint = {};
  metas.forEach(function (m) {
    tint[/dark/.test(m.getAttribute("media") || "") ? "dark" : "light"] = m.content;
  });

  function valid(theme) { return theme === "light" || theme === "dark"; }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (tint[theme]) metas.forEach(function (m) { m.content = tint[theme]; });
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (valid(saved)) apply(saved);

  /* delegated, because the button doesn't exist yet when this runs */
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#theme-toggle")) return;
    var explicit = root.getAttribute("data-theme");
    var dark = explicit ? explicit === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e2) {}
  });

  /* keep other open tabs of the site in step */
  window.addEventListener("storage", function (e) {
    if (e.key === KEY && valid(e.newValue)) apply(e.newValue);
  });
})();
