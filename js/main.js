/* ============================================================
   ZZZ Timeline — Scroll, Marquee & Typewriter
   ============================================================ */

"use strict";

/* Service Worker for PWA */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

(function initTimeline() {
    var entries = document.querySelectorAll(".entry");
    if (!entries.length) return;

    var observer = new IntersectionObserver(function (obsList) {
        obsList.forEach(function (obs) {
            if (obs.isIntersecting) {
                obs.target.classList.add("entry--visible");
                observer.unobserve(obs.target);
            }
        });
    }, { threshold: 0.15 });

    entries.forEach(function (entry) { observer.observe(entry); });
})();

/* ----------------------------------------------------------
   Marquee init + character cycling
   ---------------------------------------------------------- */
(function initMarquee() {
    var spans = document.querySelectorAll(".js-marq");
    if (!spans.length) return;

    var viewW = document.documentElement.clientWidth;
    var charW = 7;

    spans.forEach(function (span) {
        var pattern = span.getAttribute("data-pattern") || "";
        var needed = Math.max(Math.ceil((viewW * 2.5) / (pattern.length * charW)), 3);
        var full = "";
        for (var i = 0; i < needed; i++) { full += pattern; }
        span.textContent = full;
    });

    var CHARS = ["Z", "z", "2", "7"];
    var INTERVAL = 200;

    function cycleOne(el) {
        if (!el) return;
        var text = el.textContent;
        var len = text.length;
        if (len === 0) return;
        var arr = text.split("");
        var idx = Math.floor(Math.random() * len);
        if (arr[idx] !== " ") {
            var pool = CHARS.filter(function (c) { return c !== arr[idx]; });
            arr[idx] = pool[Math.floor(Math.random() * pool.length)];
        }
        el.textContent = arr.join("");
    }

    function tick() {
        spans.forEach(function (span) { cycleOne(span); });
        setTimeout(tick, INTERVAL + Math.random() * 120);
    }
    tick();
})();

/* ----------------------------------------------------------
   Typewriter reveal on card hover
   ---------------------------------------------------------- */
(function initTypewriter() {
    var CARDS = document.querySelectorAll(".entry__card");
    if (!CARDS.length) return;

    var SPEED = 38;       /* ms per character */
    var timers = {};       /* map element -> timeout ID for active typewriter */
    var cursorEls = {};    /* map element -> its cursor span */

    /* color palette per version splashscreen */
    var VERSION_COLORS = {
        "v1.0": "#3ab8d4", "v1.1": "#8b5cf6", "v1.2": "#ff6b35",
        "v1.3": "#4488ff", "v1.4": "#88ccff", "v1.5": "#f0c040",
        "v1.6": "#ddee33", "v1.7": "#7c3aed", "v2.0": "#22c9a8",
        "v2.1": "#3b82f6", "v2.2": "#c07030", "v2.3": "#d946ef",
        "v2.4": "#e04040", "v2.5": "#f08840", "v2.6": "#f472b6",
        "v2.7": "#eab308", "v2.8": "#f08040", "v3.0": "#6366f1"
    };

    /* attach mouseenter / mouseleave to each card */
    var diffuse = document.getElementById("bgDiffuse");

    CARDS.forEach(function (card) {
        card.addEventListener("mouseenter", function () {
            var ver = card.querySelector(".entry__ver");
            var accent = VERSION_COLORS[ver ? ver.textContent.trim() : ""];
            if (accent) {
                document.body.style.setProperty("--fluid-color-1", accent);
                document.body.style.setProperty("--fluid-color-2", accent);
                document.body.style.setProperty("--fluid-color-3", accent);
            }
            if (accent && diffuse) {
                var rect = card.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var size = Math.max(window.innerWidth, window.innerHeight) * 2.5;
                diffuse.style.setProperty("--diffuse-x", cx + "px");
                diffuse.style.setProperty("--diffuse-y", cy + "px");
                diffuse.style.setProperty("--diffuse-size", size + "px");
                diffuse.style.setProperty("--diffuse-color", accent);
                diffuse.classList.add("bg-diffuse--active");
            }
            var lines = card.querySelectorAll(".entry__type");
            lines.forEach(function (line) {
                var text = line.getAttribute("data-text") || "";
                if (!text) return;
                typeLine(line, text);
            });
        });

        card.addEventListener("mouseleave", function () {
            document.body.style.removeProperty("--fluid-color-1");
            document.body.style.removeProperty("--fluid-color-2");
            document.body.style.removeProperty("--fluid-color-3");
            if (diffuse) {
                diffuse.classList.remove("bg-diffuse--active");
            }
            var lines = card.querySelectorAll(".entry__type");
            lines.forEach(function (line) {
                killType(line);
            });
        });
    });

    function typeLine(el, text) {
        killType(el);          /* cancel any previous typing on this element */
        el.textContent = "";
        el.classList.remove("entry__type--done");
        var i = 0;

        function tick() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                timers[el.uid] = setTimeout(tick, SPEED);
            } else {
                el.classList.add("entry__type--done");
            }
        }
        tick();
    }

    function killType(el) {
        var uid = el.uid;
        if (timers[uid]) {
            clearTimeout(timers[uid]);
            delete timers[uid];
        }
        el.textContent = "";
        el.classList.remove("entry__type--done");
    }

    /* assign a stable uid to each element */
    var uidCounter = 0;
    function ensureUid(el) {
        if (!el.uid) { el.uid = "tw" + (++uidCounter); }
        return el.uid;
    }
    CARDS.forEach(function (card) {
        var lines = card.querySelectorAll(".entry__type");
        lines.forEach(function (line) { ensureUid(line); });
    });
})();

/* ----------------------------------------------------------
   Theme toggle (dark / light)
   ---------------------------------------------------------- */
(function initTheme() {
    var html = document.documentElement;
    var btn = document.getElementById("themeToggle");

    if (!btn) return;

    var saved = localStorage.getItem("zzz-theme");
    if (saved === "light") {
        html.classList.add("light");
        btn.innerHTML = "&#x2600;";
    }

    btn.addEventListener("click", function () {
        var isLight = html.classList.toggle("light");
        btn.innerHTML = isLight ? "&#x2600;" : "&#x263E;";
        localStorage.setItem("zzz-theme", isLight ? "light" : "dark");
    });
})();

/* ----------------------------------------------------------
   Visual settings panel
   ---------------------------------------------------------- */
(function initSettings() {
    var body = document.body;
    var panel = document.getElementById("settingsPanel");
    var btn = document.getElementById("settingsBtn");
    if (!panel || !btn) return;

    var DEFAULTS = {
        glow: 12,
        grid: 4,
        scale: 3,
        diffuse: 18,
        speed: 20,
        fluid: 35
    };

    var sliders = {
        glow:   document.getElementById("setGlow"),
        grid:   document.getElementById("setGrid"),
        scale:  document.getElementById("setScale"),
        diffuse: document.getElementById("setDiffuse"),
        speed:  document.getElementById("setSpeed"),
        fluid:  document.getElementById("setFluid")
    };

    function load() {
        var saved = localStorage.getItem("zzz-settings");
        var vals = saved ? JSON.parse(saved) : {};
        Object.keys(DEFAULTS).forEach(function (k) {
            var v = (vals[k] !== undefined) ? vals[k] : DEFAULTS[k];
            if (sliders[k]) sliders[k].value = v;
            apply(k, v);
        });
    }

    function save() {
        var vals = {};
        Object.keys(sliders).forEach(function (k) {
            vals[k] = parseInt(sliders[k].value, 10);
        });
        localStorage.setItem("zzz-settings", JSON.stringify(vals));
    }

    function apply(key, val) {
        switch (key) {
            case "glow":
                body.style.setProperty("--glow-strength", val);
                break;
            case "grid":
                body.style.setProperty("--grid-strength", val);
                break;
            case "scale":
                body.style.setProperty("--hover-scale", val);
                break;
            case "diffuse":
                body.style.setProperty("--diffuse-strength", val);
                break;
            case "speed":
                body.style.setProperty("--anim-speed", val + "s");
                break;
            case "fluid":
                body.style.setProperty("--fluid-strength", val);
                break;
        }
    }

    Object.keys(sliders).forEach(function (k) {
        if (sliders[k]) {
            sliders[k].addEventListener("input", function () {
                apply(k, parseInt(this.value, 10));
                save();
            });
        }
    });

    var resetBtn = document.getElementById("settingsReset");
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            Object.keys(DEFAULTS).forEach(function (k) {
                sliders[k].value = DEFAULTS[k];
                apply(k, DEFAULTS[k]);
            });
            localStorage.removeItem("zzz-settings");
        });
    }

    btn.addEventListener("click", function () {
        panel.classList.toggle("settings-panel--open");
    });

    document.addEventListener("click", function (e) {
        if (!panel.contains(e.target) && e.target !== btn) {
            panel.classList.remove("settings-panel--open");
        }
    });

    load();
})();
