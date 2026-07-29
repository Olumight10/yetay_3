/* ============================================================
   Yetay 3.0 — Moderator Console — SHARED SCRIPT
   Include this on every tab page, in a single <script src="shared.js"></script>
   tag, BEFORE that page's own <script> block.
   ============================================================ */

// Single source of truth for the Google Apps Script backend.
// Every split page uses this same constant — change it here once
// and every tab picks it up.
const scriptURL = "https://script.google.com/macros/s/AKfycbzMnfYQ-gfbxlnUNnzmLuY3uaBjLfHldWkXFQK0jvN31hNrDNHTsuJOsAIAdwBzR9ar/exec";


/* ------------------------------------------------------------
   FullscreenManager
   ------------------------------------------------------------
   Replaces the 3 near-identical toggleLiveFullscreen /
   toggleResultsFullscreen / toggleLbFullscreen functions from
   the old single-file version. Each split page now has only
   ONE tab visible at a time anyway, so "fullscreen" just means:
   hide the <nav>, expand the container to fill the viewport,
   and (best-effort) request real browser fullscreen.

   USAGE in a tab page:

     <button onclick="FullscreenManager.toggle('page-root', 'btn-fullscreen')">
       ⛶ Fullscreen
     </button>

   'page-root'      = id of the container element to expand
   'btn-fullscreen'  = id of the button whose label should flip
                       between "⛶ Fullscreen" and "✕ Exit Full"

   Escape key and the browser's native fullscreen-exit (F11 / OS
   gesture) are both wired up automatically, once, the first time
   toggle() is called.
   ------------------------------------------------------------ */
const FullscreenManager = (function () {
    let active = false;
    let containerId = null;
    let btnId = null;
    let listenersAttached = false;

    function enterLabel() { return '⛶ Fullscreen'; }
    function exitLabel()  { return '✕ Exit Full'; }

    function attachGlobalListenersOnce() {
        if (listenersAttached) return;
        listenersAttached = true;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && active) toggle(containerId, btnId);
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && active) toggle(containerId, btnId);
        });
    }

    function toggle(newContainerId, newBtnId) {
        containerId = newContainerId;
        btnId = newBtnId;
        attachGlobalListenersOnce();

        active = !active;
        const container = document.getElementById(containerId);
        const btn = document.getElementById(btnId);
        const nav = document.querySelector('nav');
        // Some pages may also have a secondary bar (e.g. tab switcher)
        // that should hide in fullscreen; give it id="secondary-bar" if so.
        const secondaryBar = document.getElementById('secondary-bar');

        if (!container) return;

        if (active) {
            if (nav) nav.style.display = 'none';
            if (secondaryBar) secondaryBar.style.display = 'none';
            container.style.position = 'fixed';
            container.style.inset = '0';
            container.style.zIndex = '9999';
            container.style.height = '100dvh';
            if (btn) btn.textContent = exitLabel();
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } else {
            if (nav) nav.style.display = '';
            if (secondaryBar) secondaryBar.style.display = '';
            container.style.position = '';
            container.style.inset = '';
            container.style.zIndex = '';
            container.style.height = '';
            if (btn) btn.textContent = enterLabel();
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    return { toggle, isActive: () => active };
})();


/* ------------------------------------------------------------
   loadSharedNav()
   ------------------------------------------------------------
   Fetches nav.html and injects it into <div id="nav-placeholder">.
   Then highlights whichever tab matches document.body's
   data-page attribute.

   USAGE — put this at the very top of <body>:

     <body data-page="control">
       <div id="nav-placeholder"></div>
       <script>loadSharedNav();</script>
       ... rest of the page ...

   Call it as early as possible so the nav appears without a
   visible flash/delay.
   ------------------------------------------------------------ */
async function loadSharedNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) return;

    try {
        const resp = await fetch('nav.html');
        const html = await resp.text();
        placeholder.innerHTML = html;

        const currentPage = document.body.dataset.page;
        placeholder.querySelectorAll('.portal-tab').forEach(link => {
            if (link.dataset.page === currentPage) {
                link.classList.add('text-blue-900', 'border-yellow-500');
                link.classList.remove('text-gray-400', 'border-transparent');
            } else {
                link.classList.add('text-gray-400', 'border-transparent');
                link.classList.remove('text-blue-900', 'border-yellow-500');
            }
        });
    } catch (err) {
        placeholder.innerHTML = '<div class="p-2 text-center text-red-500 text-xs">Nav failed to load</div>';
    }
}