/**
 * Applies the stored theme before first paint.
 *
 * This has to be a blocking inline script in <head>: any later and the page
 * paints in the system theme first, then flips — a visible flash that also
 * registers as a layout-stability problem on slow devices. It is ~180 bytes.
 */
const script = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}
