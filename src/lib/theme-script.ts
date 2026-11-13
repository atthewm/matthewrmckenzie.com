// Shared by the server layout (inline script) and the client theme hook.
export const THEME_KEY = "mmck-theme";

/**
 * Inline <head> script. Kept tiny and dependency free: it runs before the
 * body is parsed so no page ever flashes the wrong appearance.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_KEY}");if(c!=="light"&&c!=="dark")c="system";var d=c==="dark"||(c==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

