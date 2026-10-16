/* GLP-1 prototype
   Before: screenshots from /before with clickable hotspots.
   After:  screens built live with Anvil components (window.Anvil), loaded from
           https://mendowski.github.io/anvil-design-system/ */

(function () {
  "use strict";
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
  var A = window.Anvil;

  if (!A) {
    document.getElementById("app").innerHTML =
      '<p style="padding:24px;font-family:sans-serif">The Anvil design system didn’t load. Check your connection and refresh.</p>';
    return;
  }

  /* ------------------------------------------------------------------
     BEFORE flow
     Each screen: id, image file, title, image size (w, h), the group it's
     listed under, and its hotspots. A hotspot is a box in image pixels
     [left, top, right, bottom], a label for screen readers, and where it
     goes: another screen's id, "back", or (left out) the next screen.
     The first hotspot is the screen's main action and leads to the next
     screen in file order; the others are shortcuts.
     foot is where the app's tab bar starts, in image pixels. The tab bar
     stays pinned to the bottom of the phone while the screen scrolls.
     ------------------------------------------------------------------ */
  var B = " experience after 60 days.png";
  var CLOSE_DARK = [700, 120, 760, 180];    // the X on the dark explainer overlays
  var RETURN_CM = { box: [32, 2820, 740, 2870], label: "Return to Condition Management Home", to: "b-cm" };
  var BEFORE = [
    { id: "b-home", file: "000-current" + B, title: "Home", w: 780, h: 4128, foot: 3950, group: "Finding GLP-1 info",
      hot: [{ box: [150, 3950, 310, 4075], label: "Programs" }] },
    { id: "b-programs", file: "001-current" + B, title: "Programs", w: 780, h: 1690, foot: 1510,
      hot: [{ box: [32, 230, 748, 730], label: "Condition Management" }] },
    { id: "b-cm", file: "002-current" + B, title: "Condition Management", w: 780, h: 3162, foot: 2982,
      hot: [{ box: [660, 110, 748, 194], label: "Menu" }] },
    { id: "b-menu", file: "003-current" + B, title: "Condition Management menu", w: 780, h: 1688,
      hot: [{ box: [40, 256, 740, 360], label: "GLP-1 medication for weight loss" },
            { box: [660, 80, 720, 140], label: "Close menu", to: "back" }] },

    { id: "b-tracker", file: "004-current" + B, title: "Requirements tracker", w: 780, h: 3372, foot: 3194, group: "Tracking requirements",
      hot: [{ box: [32, 1190, 748, 1470], label: "Weigh-ins" },
            { box: [64, 1790, 716, 1980], label: "Schedule or view sessions details", to: "b-coach" },
            { box: [64, 2330, 716, 2520], label: "Do a lesson", to: "b-lesson" },
            { box: [64, 2536, 716, 2726], label: "Track food", to: "b-lesson" },
            RETURN_CM] },
    { id: "b-weigh", file: "005-current" + B, title: "Weigh-in", w: 780, h: 1688,
      hot: [{ box: CLOSE_DARK, label: "Close" }] },
    { id: "b-coach", file: "006-current" + B, title: "Coaching", w: 780, h: 1688,
      hot: [{ box: CLOSE_DARK, label: "Close" }] },
    { id: "b-lesson", file: "007-current" + B, title: "Lesson or food log", w: 780, h: 1688,
      hot: [{ box: CLOSE_DARK, label: "Close" }] },
    { id: "b-progress", file: "008-current" + B, title: "Tracker in progress", w: 780, h: 3372, foot: 3194,
      hot: [{ box: [32, 1190, 748, 1470], label: "Weigh-ins" },
            { box: [64, 1790, 716, 1980], label: "Schedule or view sessions details" },
            { box: [64, 2330, 716, 2520], label: "Do a lesson" },
            { box: [64, 2536, 716, 2726], label: "Track food" },
            RETURN_CM] },
    { id: "b-done", file: "009-current" + B, title: "Requirements complete", w: 780, h: 2216, foot: 2038,
      hot: [{ box: [32, 1800, 680, 1860], label: "Return to Condition Management Home", to: "b-cm" }] }
  ];
  /* ------------------------------------------------------------------
     Small building blocks
     ------------------------------------------------------------------ */
  function StatusBar(props) {
    return h("div", { className: "status" + (props.inverted ? " status--inverted" : "") + (props.clear ? " status--clear" : ""), "aria-hidden": "true" },
      h("span", null, "9:41"),
      h("svg", { width: 72, height: 14, viewBox: "0 0 72 14", fill: "currentColor" },
        // signal
        h("rect", { x: 0, y: 9, width: 3, height: 4, rx: 1 }),
        h("rect", { x: 5, y: 6.5, width: 3, height: 6.5, rx: 1 }),
        h("rect", { x: 10, y: 4, width: 3, height: 9, rx: 1 }),
        h("rect", { x: 15, y: 1, width: 3, height: 12, rx: 1 }),
        // wifi
        h("path", { d: "M30 3.2a10 10 0 0 1 13 0l-1.4 1.5a8 8 0 0 0-10.2 0zM32.4 5.9a6.4 6.4 0 0 1 8.2 0l-1.4 1.5a4.4 4.4 0 0 0-5.4 0zM34.8 8.6a2.8 2.8 0 0 1 3.4 0L36.5 10.4z" }),
        // battery
        h("rect", { x: 46.5, y: 1.5, width: 22, height: 11, rx: 3.5, fill: "none", stroke: "currentColor", opacity: .4 }),
        h("rect", { x: 48.5, y: 3.5, width: 18, height: 7, rx: 2 }),
        h("rect", { x: 69.5, y: 5, width: 1.6, height: 4, rx: .8, opacity: .4 })));
  }

  function TopBar(props) {
    return h("div", { className: "as-top" },
      props.onBack ? h(A.IconButton, { icon: "arrow-left", label: "Back", onClick: props.onBack }) : null);
  }

  // Focused-task header: Back, the page title and Close (Anvil GlobalHeader).
  function Focused(props) {
    return h(A.GlobalHeader, { type: "focused", layout: "mobile", title: props.title, onBack: props.onBack || null, onClose: props.onClose || null });
  }

  function Foot(props) {
    return h("div", { className: "as-foot" + (props.sticky ? " as-foot--sticky" : "") }, props.children);
  }

  function Primary(props) {
    return h(A.Button, { variant: "primary", className: "full", onClick: props.onClick, disabled: props.disabled }, props.children);
  }

  function Skip(props) {
    return h("div", { className: "center" }, h(A.Button, { variant: "tertiary", onClick: props.onClick }, props.children || "Skip for now"));
  }

  function Link(props) {
    return h("a", { href: "#", className: props.className, onClick: function (e) { e.preventDefault(); if (props.onClick) props.onClick(); } }, props.children);
  }

  // Card spot image: the Card draws the circle, so pass only the artwork URL.
  // The circle color comes from a spot-* class (see prototype.css).
  function cardSpot(name) {
    return { type: "spot", src: A.Illustration.url("spot", name), alt: "" };
  }

  // Titles inside cards use the Heading 4 text style.
  function cardTitle(t) {
    return h("span", { className: "heading-heading-4" }, t);
  }

  // Status tag. Tones map to Anvil's tag tokens.
  function Tag(props) {
    return h("span", { className: "tag tag--" + (props.tone || "neutral") + (props.dot ? " tag--dot" : "") }, props.children);
  }

  // A tappable row or card that moves the flow on.
  function Tap(props) {
    return h("button", { type: "button", className: "tap " + (props.className || ""), onClick: props.onClick, "aria-label": props.label }, props.children);
  }

  // Bottom sheet over a dimmed copy of the screen it opened from.
  function Sheet(props) {
    return h("div", { className: "sheet-wrap" },
      h("div", { className: "sheet-under", "aria-hidden": "true" }, h(StatusBar), props.under || null),
      h("div", { className: "sheet-dim" }),
      h("section", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "sheet-title" },
        h("div", { className: "sheet-head" },
          h("span", { className: "sheet-spacer" }),
          h("h2", { id: "sheet-title", className: "heading-heading-4" }, props.title),
          h(A.IconButton, { icon: "close", label: "Close", onClick: props.onClose })),
        h("div", { className: "sheet-body" }, props.children)));
  }

  // Floating tab bar on the signed-in screens.
  function TabBar(props) {
    var tabs = [
      { key: "home", icon: "home", label: "Home" },
      { key: "visits", icon: "calendar", label: "Visits" },
      { key: "health", icon: "heart-pulse", label: "My health" },
      { key: "learning", icon: "library", label: "Learning" }
    ];
    return h("nav", { className: "tabbar", "aria-label": "App" },
      h("div", { className: "tabbar-pill" },
        tabs.map(function (t) {
          var cur = t.key === props.current;
          return h("a", {
            key: t.key, href: "#", "aria-current": cur ? "page" : undefined,
            onClick: function (e) { e.preventDefault(); var f = props.on && props.on[t.key]; if (f) f(); }
          },
            h(A.Icon, { name: t.icon, size: 24, variant: cur ? "active" : "default" }),
            t.label);
        })));
  }

  function SectionLabel(props) {
    return h("div", { className: "sec-label" },
      h("h2", { className: "heading-sections" }, props.children),
      props.action || null);
  }

  /* ------------------------------------------------------------------
     AFTER: shared state
     session.day is the GLP-1 day screen people last came from, and session.n
     the day they last slid the tracker to, so sheets open on top of it and
     logging returns to it. session.keep says to reopen on session.n.
     session.toast is a confirmation to show once on that screen.
     ------------------------------------------------------------------ */
  var session = { day: "day1", n: 1, keep: false, toast: null };
  function noopTo() { return function () {}; }

  // Cycle dates: day 1 is April 13, 2026.
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dateOf(d) { var t = new Date(2026, 3, 12 + d); return MONTHS[t.getMonth()] + " " + t.getDate(); }

  // What was logged on each day of the cycle. Shots are weekly.
  var LOGGED = { 1: "weight", 3: "lesson", 4: "coach", 9: "weight", 11: "food", 17: "weight", 19: "lesson", 25: "weight", 29: "food", 30: "weight" };
  var SHOTS = [7, 14, 21, 28, 35];
  var ACT_ICON = { weight: "weight", lesson: "library", coach: "chat", food: "food", shot: "injection" };
  var ACT_LABEL = { weight: "Weigh-in", lesson: "Lesson", coach: "Coaching", food: "Food log" };

  // Day 29's food log came in after day 29's screen, so it shows from day 30 on.
  function loggedBy(day, d, strict) {
    if (!LOGGED[d]) return false;
    if (d === 29 && day === 29) return false;
    return strict ? (d < day || (day === 30 && d === 30)) : d <= day;
  }

  // The four GLP-1 day screens in the flow, and the day each one opens on.
  var DAYS = { day1: { n: 1 }, day7: { n: 7 }, day29: { n: 29 }, day30: { n: 30 } };

  // What the GLP-1 page shows on any day of the cycle (Figma "Updated tracker
  // colors and page states"). kind sets the page and tracker colors:
  // default, shot, warning (day 29, a task missing) or complete (day 30).
  function dayInfo(n) {
    var shot = SHOTS.indexOf(n) >= 0;
    if (n === 30) return { n: n, kind: "complete", sub: "Today is the last day of your cycle", med: "Injection log",
      focus: { tone: "success", title: "You’ve completed the GLP-1 coverage requirements", body: "Tirzepatide 15 mg will be mailed to you within 5–7 days." }, forYou: "meal" };
    if (n === 29) return { n: n, kind: "warning", sub: "Tomorrow is the last day of your GLP-1 cycle",
      focus: { tone: "warning", title: "You’re missing one food log or a lesson", body: "Complete your task to get your refill on time.", go: "track" }, forYou: "meal" };
    if (shot) return { n: n, kind: "shot", sub: "Today is your shot day",
      focus: { tone: "shot", title: "Today is your injection day", body: "We suggest that you apply today’s injection on your right thigh.", go: "inject" }, forYou: "feel" };
    var left = nextShot(n) - n;
    return { n: n, kind: "default", sub: left + (left === 1 ? " day" : " days") + " left to your next shot",
      focus: { tone: "info", title: "Book a visit with your coach", body: "A visit with your coach improves outcomes.", icon: "video" }, forYou: "meal" };
  }

  // Page background for each kind of day, as Anvil tokens.
  var PAGE_BG = { "default": "--background-base", warning: "--background-base", shot: "--background-status-critical-subdued", complete: "--background-status-success-subdued" };

  /* ------------------------------------------------------------------
     AFTER: shared pieces
     ------------------------------------------------------------------ */
  // Card with a colored edge, for "Actions to take" and "Today's focus".
  function FocusCard(props) {
    var inner = [
      h("span", { key: "t", className: "heading-heading-4 focus-title" }, props.title),
      props.body ? h("span", { key: "b", className: "body-small-default focus-body" }, props.icon ? h(A.Icon, { name: props.icon, size: 16 }) : null, props.body) : null,
      props.children ? h(React.Fragment, { key: "c" }, props.children) : null
    ];
    var cls = "focus focus--" + (props.tone || "info");
    return props.onClick
      ? h(Tap, { className: cls, onClick: props.onClick }, inner)
      : h("div", { className: cls }, inner);
  }

  // Toast for a few seconds after something new is logged.
  function Toast(props) {
    var st = useState(props.text), text = st[0], setText = st[1];
    useEffect(function () {
      if (!text) return;
      var t = setTimeout(function () { setText(null); }, 4000);
      return function () { clearTimeout(t); };
    }, [text]);
    if (!text) return null;
    return h("div", { className: "toast", role: "status" },
      h(A.Icon, { name: "check-circle", size: 24 }),
      h("span", { className: "body-strong" }, text),
      h(A.IconButton, { icon: "close", label: "Dismiss", onClick: function () { setText(null); } }));
  }

  // The 30-day tracker (Figma "Day-activity"). It scrolls sideways and the
  // day in the middle is the selected day. While it moves, onMove gets the
  // position as a fractional day number, and onSelect the nearest day.
  var TRK_PITCH = 32;
  function Tracker(props) {
    var day = props.day, ref = useRef(null);
    var cb = useRef(props); cb.current = props;

    function centerOf(n) { return (n - 1) * TRK_PITCH; }
    // Glide to a day. Snapping is paused while it moves so the browser
    // doesn't pull it back halfway.
    var anim = useRef(0);
    function scrollToDay(n, smooth) {
      var el = ref.current; if (!el) return;
      cancelAnimationFrame(anim.current);
      var from = el.scrollLeft, to = centerOf(n), dist = to - from;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!smooth || reduce || Math.abs(dist) < 1) { el.scrollLeft = to; return; }
      var dur = Math.min(700, 250 + Math.abs(dist) * 0.8), t0 = null;
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.scrollLeft = from + dist * e;
        if (k < 1) anim.current = requestAnimationFrame(step);
        else { el.style.scrollSnapType = ""; el.style.scrollBehavior = ""; }
      }
      anim.current = requestAnimationFrame(step);
    }

    // Start centered on the day the page opened on.
    useEffect(function () {
      var el = ref.current; if (!el) return;
      el.style.scrollBehavior = "auto";
      el.style.scrollSnapType = "none";
      el.scrollLeft = centerOf(props.start);
      el.style.scrollBehavior = "";
      el.style.scrollSnapType = "";
      if (cb.current.onMove) cb.current.onMove(props.start);
    }, []);

    // Report the position as it scrolls.
    useEffect(function () {
      var el = ref.current; if (!el) return;
      var last = null;
      function onScroll() {
        var f = Math.max(1, Math.min(30, el.scrollLeft / TRK_PITCH + 1));
        if (cb.current.onMove) cb.current.onMove(f);
        var n = Math.round(f);
        if (n !== last) { last = n; if (cb.current.onSelect) cb.current.onSelect(n); }
      }
      el.addEventListener("scroll", onScroll, { passive: true });
      return function () { el.removeEventListener("scroll", onScroll); };
    }, []);

    // Swipe with a mouse or trackpad: drag sideways to scroll. Touch screens
    // swipe natively. A drag doesn't count as a tap on a day.
    useEffect(function () {
      var el = ref.current; if (!el) return;
      var startX = 0, startLeft = 0, down = false, moved = false;
      function onDown(e) {
        if (e.pointerType === "touch" || e.button !== 0) return;
        down = true; moved = false; startX = e.clientX; startLeft = el.scrollLeft;
      }
      function onMove(e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 4) {
          moved = true;
          el.classList.add("is-dragging");
          if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        }
        if (moved) el.scrollLeft = startLeft - dx;
      }
      function onUp() {
        if (!down) return;
        down = false;
        if (!el.classList.contains("is-dragging")) return;
        el.classList.remove("is-dragging");
        var n = Math.max(1, Math.min(30, Math.round(el.scrollLeft / TRK_PITCH + 1)));
        scrollToDay(n, true);
      }
      function onClick(e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      el.addEventListener("click", onClick, true);
      return function () {
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("click", onClick, true);
      };
    }, []);

    var info = dayInfo(day);
    var items = [];
    for (var d = 1; d <= 37; d++) {
      var shot = SHOTS.indexOf(d) >= 0;
      var act = shot ? "shot" : (loggedBy(day, d) ? LOGGED[d] : null);
      var icon = act ? h(A.Icon, { key: "i", name: ACT_ICON[act], size: 16 }) : h("span", { key: "i", className: "trk-gap" });
      if (d === day) {
        items.push(h("span", { key: d, className: "trk-day trk-today trk-today--" + info.kind, "aria-current": "date", "aria-label": "Day " + d + ", selected" },
          h(A.Icon, { name: "location-pin", size: 16, variant: "active" }),
          act ? h(A.Icon, { name: ACT_ICON[act], size: 16 }) : null));
        continue;
      }
      var when = d < day ? "is-past" : d > 30 ? "is-next" : "is-future";
      var cls = "trk-day " + when + (shot ? " is-shot" : "");
      var content = [h("span", { key: "dot", className: "trk-dot" }), icon];
      items.push(d <= 30 && props.live
        ? h("button", { key: d, type: "button", className: cls + " is-link", "aria-label": "Day " + d, onClick: (function (n) { return function () { scrollToDay(n, true); }; })(d) }, content)
        : h("span", { key: d, className: cls, "aria-hidden": "true" }, content));
    }
    return h("div", { className: "trk trk--" + info.kind, ref: ref, role: "group", tabIndex: 0, "aria-label": "Your 30-day cycle. Swipe or use the arrow keys to see other days." }, items);
  }

  /* ------------------------------------------------------------------
     AFTER screens: Home and My health (Figma 000, 001, 008, 009)
     ------------------------------------------------------------------ */
  function Home(p) {
    var next = p.next_refill;
    var care = [
      { spot: "primary-care", title: "Primary care", sub: "Schedule a visit" },
      { spot: "mental-health", title: "Mental health", sub: "View options", bg: "green" },
      { spot: "dermatology", title: "Dermatology", sub: "Upload a photo", bg: "aqua" },
      { spot: "nutrition", title: "Nutrition", sub: "Pick a dietitian", bg: "berry" }
    ];
    var health = p.to(next ? "health-next" : "health");
    return h(React.Fragment, null,
      h("div", { className: "home-hero" },
        h(StatusBar, { inverted: true, clear: true }),
        h("div", { className: "home-icons" },
          h(A.IconButton, { icon: "profile", label: "Profile" }),
          h(A.IconButton, { icon: "mail", label: "Messages", badge: 2 })),
        h("h1", { className: "home-q" }, "How can we help you today?"),
        h("label", { className: "home-search" },
          h("span", { className: "home-search-mark", "aria-hidden": "true" }, h(A.Icon, { name: "ai-sparkles", size: 16 })),
          h("input", { type: "search", "aria-label": "Ask a question or search" }),
          h(A.Icon, { name: "arrow-right", size: 16 }))),
      h("div", { className: "as-body home-body" },
        h("div", { className: "pills", role: "list" },
          [["calendar", "Get care"], ["medicine", "Medications"], ["food", "Food log"]].map(function (c) {
            return h("button", { key: c[1], type: "button", className: "pill", role: "listitem" }, h(A.Icon, { name: c[0], size: 16 }), c[1]);
          })),
        h(SectionLabel, null, "Actions to take"),
        next
          ? h("div", { className: "action-card" },
              h("h3", { className: "heading-heading-4", style: { marginBottom: 4 } }, "Get ready to start your GLP-1 requirements for your next refill"),
              h(A.Button, { variant: "tertiary", onClick: health }, "View program details"))
          : h("div", { className: "action-card" },
              h("div", { className: "action-head" },
                h("h3", { className: "heading-heading-4" }, "Your GLP-1 benefit is ready"),
                h(Tag, { tone: "info" }, "Enrolled")),
              h("p", { className: "body-small-default action-note" }, h(A.Icon, { name: "video", size: 16 }), "Sally will schedule your first prescriber visit within 24 hours."),
              h(A.Button, { variant: "tertiary", onClick: health }, "View program details")),
        next ? null : h(React.Fragment, null,
          h(SectionLabel, null, "Upcoming visits"),
          h(Tap, { className: "visit", label: "Video visit with Peter Brennan, MD, April 30 at 4:00 PM" },
            h("span", { className: "visit-date" }, h("span", null, "Apr"), h("strong", null, "30")),
            h("span", { className: "visit-info" },
              h("span", { className: "body-small-strong visit-time" }, "4:00 PM ", h(A.Icon, { name: "video", size: 16 })),
              h("span", { className: "heading-heading-4" }, "Peter Brennan, MD"),
              h("span", { className: "body-small-default subdued" }, "Primary care visit")),
            h(A.Icon, { name: "arrow-right", size: 16 }))),
        h(SectionLabel, { action: h(A.Button, { variant: "tertiary", size: "small" }, "View all") }, "Virtual care options"),
        h("div", { className: "urgent" },
          h(Tag, { tone: "critical", dot: true }, "Available 24/7"),
          h("h3", { className: "heading-heading-4" }, "Urgent care"),
          h("p", { className: "body-small-default" }, "Connect with a provider now")),
        h("div", { className: "care-grid" },
          care.map(function (c) {
            return h("div", { key: c.title, className: "care-tile" },
              h(A.Illustration, { name: c.spot, size: 48, background: (c.bg || "purple") + "-subdued", alt: "" }),
              h("h3", { className: "heading-heading-4" }, c.title),
              h("p", { className: "body-small-default" }, c.sub));
          })),
        h(SectionLabel, null, "More"),
        h("div", { className: "stack", style: { gap: 12, marginBottom: 0 } },
          h(Tap, { className: "row-link" }, h("span", { className: "row-ico" }, h(A.Icon, { name: "alert-lightbulb", size: 16 })), h("span", null, "Explore plan benefits"), h(A.Icon, { name: "arrow-right", size: 16 })),
          h(Tap, { className: "row-link" }, h("span", { className: "row-ico" }, h(A.Icon, { name: "help", size: 16 })), h("span", null, "Contact Member Support"), h(A.Icon, { name: "arrow-right", size: 16 })))),
      h(TabBar, { current: "home", on: { health: health } }));
  }

  function MyHealth(p) {
    var next = p.next_refill;
    var snap = [
      { icon: "blood-pressure", label: "Blood pressure", v: "118/76", u: "mmHg", trend: "line-arrow-up", t: "13% from last week", when: "Today" },
      { icon: "blood-sugar", label: "Blood sugar", v: "102", u: "mg/dL", trend: "minus", t: "Stable", when: "March 13, 2026" },
      { icon: "steps", label: "Steps", v: "8,412", u: "steps", trend: "line-arrow-down", t: "4% from last week", when: "Today" }
    ];
    return h(React.Fragment, null,
      h("div", { className: "page-title" }, h("h1", { className: "heading-heading-4" }, "My health")),
      h("div", { className: "as-body as-body--sections" },
        h(SectionLabel, { action: h(A.Button, { variant: "tertiary", size: "small" }, "View all") }, "Health snapshot"),
        h("div", { className: "snap-row" },
          snap.map(function (s) {
            return h("div", { key: s.label, className: "snap" },
              h("p", { className: "body-small-default snap-label" }, h(A.Icon, { name: s.icon, size: 16 }), s.label),
              h("p", { className: "snap-v" }, h("strong", null, s.v), " ", s.u),
              h("p", { className: "body-small-default snap-t" }, h(A.Icon, { name: s.trend, size: 16 }), s.t),
              h("p", { className: "body-small-default subdued" }, s.when));
          })),
        h(SectionLabel, null, "Care team"),
        h("div", { className: "team" },
          [["jane-brennan", "Dr. Jane Brennan", "Primary care"], ["sally-reeves", "Sally Reeves", "Care guide"]].map(function (m) {
            return h("div", { key: m[1], className: "member" },
              h("img", { className: "avatar", src: "images/" + m[0] + ".jpg", alt: "", width: 56, height: 56 }),
              h("div", null, h("p", { className: "heading-heading-4" }, m[1]), h("p", { className: "body-small-default subdued" }, m[2])));
          })),
        h(SectionLabel, null, next ? "Programs" : "Medications"),
        h("div", { className: "stack stack--nav" },
          h(Tap, { className: "med", onClick: p.to(next ? "day30" : "day1"), label: "GLP-1 for weight loss: Tirzepatide, 15 mg" },
            h("p", { className: "body-small-default" }, next ? "GLP-1 for weight loss program" : "GLP-1 for weight loss"),
            h("p", { className: "heading-heading-4" }, "Tirzepatide, 15 mg"),
            next ? h(Tag, { tone: "branded" }, "Ready to start on May 14") : h(Tag, { tone: "warning" }, "Complete between Apr 13 – May 13"),
            h("p", { className: "body-default subdued" }, "Your discount applies after you complete 4 weigh-ins, 1 coaching session, and 4 food logs or lessons."),
            h("span", { className: "tap-go" }, h(A.Icon, { name: "arrow-right", size: 16 }))),
          h("div", { className: "med" },
            h("p", { className: "body-small-default" }, "Blood pressure"),
            h("p", { className: "heading-heading-4" }, "Lisinopril, 10 mg"),
            h(Tag, { tone: "success" }, "Active"),
            h("p", { className: "body-default subdued" }, "Next refill: May 13, 2026")))),
      h(TabBar, { current: "health", on: { home: p.to(next ? "home-next" : "home") } }));
  }

  /* ------------------------------------------------------------------
     AFTER screens: the GLP-1 page, one per tracker day (Figma 002-005)
     ------------------------------------------------------------------ */
  function GlpDay(p) {
    var live = !p.under;
    var start = useRef(p.under || session.keep ? session.n : DAYS[p.dayId].n).current;
    var sl = useState(start), sel = sl[0], setSel = sl[1];
    var cfg = dayInfo(sel);
    var toast = useState(live ? session.toast : null)[0];
    var rootRef = useRef(null), colors = useRef(null);
    useEffect(function () {
      if (!live) return;
      session.day = p.dayId;
      session.keep = false;
      session.toast = null;
    }, [p.dayId]);
    useEffect(function () { session.n = sel; }, [sel]);

    // Slide the page color with the tracker: a solid color that moves in
    // sideways, with a soft edge, as you go from one kind of day to the next.
    function paint(f) {
      var root = rootRef.current; if (!root) return;
      var page = root.closest(".as"); if (!page) return;
      if (!colors.current) {
        var cs = getComputedStyle(page), c = {};
        Object.keys(PAGE_BG).forEach(function (k) { c[k] = cs.getPropertyValue(PAGE_BG[k]).trim(); });
        colors.current = c;
      }
      var a = Math.floor(f), b = Math.min(30, a + 1), t = f - a;
      var ca = colors.current[dayInfo(a).kind], cb = colors.current[dayInfo(b).kind];
      if (ca === cb || t < 0.001) { page.style.background = t > 0.999 ? cb : ca; return; }
      var edge = (1 - t) * 140 - 20;
      page.style.background = "linear-gradient(90deg, " + ca + " " + (edge - 20).toFixed(1) + "%, " + cb + " " + (edge + 20).toFixed(1) + "%)";
    }

    var track = p.to("track"), inject = p.to("inject"), symptoms = p.to("symptoms");
    var focus = cfg.focus;
    var tools = [["stethoscope", "Visit prep", null], ["chat", "Coaching", track], ["weight", "Weight", track], ["meal", "Food log", track], ["library", "Lessons", track]];
    return h("div", { className: "glp", ref: rootRef },
      h(Focused, { title: "GLP-1 for weight loss", onBack: p.to(sel === 30 ? "health-next" : "health") }),
      h("div", { className: "as-body glp-body" },
        h("div", { className: "center" },
          h("h1", { className: "heading-heading-2" }, "Day " + cfg.n + " of 30"),
          h("p", { className: "body-small-default", style: { marginTop: 4 } }, cfg.sub)),
        h(Tracker, { day: sel, start: start, live: live, onSelect: setSel, onMove: paint }),
        h("div", { className: "glp-actions" },
          [["medicine", cfg.med || "Medication", inject], ["plus-circle", "Track", track], ["medical-info", "Symptoms", symptoms]].map(function (a) {
            return h("button", { key: a[1], type: "button", className: "glp-action", onClick: a[2] }, h(A.Icon, { name: a[0], size: 24 }), h("span", { className: "body-small-default" }, a[1]));
          })),
        h(SectionLabel, null, "Today’s focus"),
        h(FocusCard, { tone: focus.tone, title: focus.title, body: focus.body, icon: focus.icon, onClick: focus.go ? p.to(focus.go) : null }),
        h(SectionLabel, null, "Your tools"),
        h("div", { className: "tools" },
          tools.map(function (t) {
            return h("button", { key: t[1], type: "button", className: "tool", onClick: t[2] || undefined }, h(A.Icon, { name: t[0], size: 16 }), h("span", { className: "body-small-default" }, t[1]));
          })),
        h(SectionLabel, { action: h(A.Button, { variant: "tertiary", size: "small" }, "View all") }, "For you"),
        cfg.forYou === "feel"
          ? h(FocusCard, { tone: "plain", title: "How are you feeling?", body: "Let us know how you’re feeling after your shot.", onClick: symptoms })
          : h(FocusCard, { tone: "plain", title: "Picked for you this week", body: "Check all nutritious meals picked for your stage", onClick: function () {} },
              h("span", { className: "meal" },
                h("img", { src: "images/meal-garlic-chicken.jpg", alt: "", width: 48, height: 48 }),
                h("span", null,
                  h("span", { className: "body-strong meal-name" }, "Garlic Paprika Chicken and Spinach"),
                  h("span", { className: "body-small-default subdued" }, "Dinner · 30 min")))),
        h("div", { style: { height: 24 } }),
        live && toast ? h(Toast, { text: toast }) : null));
  }

  // The GLP-1 page for the last day people saw, for under a sheet.
  function UnderDay() { return h(GlpDay, { dayId: session.day, to: noopTo, under: true }); }

  // Logging something new: go back to the day with a toast.
  function logged(p, text) {
    return function () { session.toast = text; session.keep = true; p.to(session.day)(); };
  }

  /* ------------------------------------------------------------------
     AFTER screens: sheets on the GLP-1 page (Figma 006, 100-102)
     ------------------------------------------------------------------ */
  function nextShot(day) { for (var i = 0; i < SHOTS.length; i++) if (SHOTS[i] >= day) return SHOTS[i]; return 35; }

  function Injection(p) {
    var day = session.n, next = nextShot(day);
    var past = SHOTS.filter(function (s) { return s < day; });
    var last = past.length ? past[past.length - 1] : 0, prev = last - 7;
    return h(Sheet, { title: "Injection site", onClose: p.back, under: h(UnderDay) },
      h("div", { className: "inject-art" }, h("img", { src: "images/injection-site.png", alt: "", width: 698, height: 339 })),
      h("p", { className: "suggest body-default" }, h(A.Icon, { name: "check-circle", variant: "active", size: 24 }),
        next === day ? "Suggested: right thigh, today" : "Suggested: right thigh on " + dateOf(next)),
      h("ul", { className: "log" },
        h("li", null, h(A.Icon, { name: "check", size: 16 }), h("span", null, "Last shot completed: left arm"), h("span", null, dateOf(last))),
        h("li", null, h(A.Icon, { name: "check", size: 16 }), h("span", null, "Shot completed"), h("span", null, dateOf(prev)))));
  }

  // One Track sheet: empty at the start of a cycle, then a list of what's been logged.
  function Track(p) {
    var day = session.n;
    var rows = [
      { title: "Weight-in", kind: "weight", go: "weighins" },
      { title: "Coaching", kind: "coach" },
      { title: "Food log", kind: "food", go: "food" },
      { title: "Lessons", kind: "lesson", go: "lessons" }
    ];
    return h(Sheet, { title: "Track", onClose: p.back, under: h(UnderDay) },
      h("p", { className: "body-default subdued", style: { marginBottom: 16 } }, "Complete 4 weigh-ins, 1 coaching session, and 4 food logs or lessons in a month to receive your discount."),
      h("div", { className: "stack", style: { gap: 12, marginBottom: 0 } },
        rows.map(function (r) {
          var items = [];
          for (var d = 1; d <= 30; d++) if (LOGGED[d] === r.kind && loggedBy(day, d, true)) items.push(d);
          items.reverse();
          var body = [
            h("span", { key: "c", className: "track-main" },
              h("span", { className: "heading-heading-4" }, r.title),
              items.length ? h("span", { className: "req-items" },
                items.map(function (d) {
                  return h("span", { key: d, className: "req-item body-small-default" }, h(A.Icon, { name: "check", size: 16 }), h("span", null, ACT_LABEL[r.kind]), h("span", null, dateOf(d)));
                })) : null),
            h(A.Icon, { key: "a", name: "arrow-right", size: 16 })
          ];
          // Prominent nav list item, built from Anvil tokens (not an Anvil component yet).
          return h(Tap, { key: r.title, className: "track-row", onClick: r.go ? p.to(r.go) : undefined }, body);
        })));
  }

  function Weighins(p) {
    return h(Sheet, { title: "Weigh-ins", onClose: p.back, under: h(UnderDay) },
      h("p", { className: "body-default subdued", style: { marginBottom: 16 } }, "These sync automatically toward your requirements."),
      h("div", { className: "synced" },
        h("span", null,
          h("span", { className: "heading-heading-4" }, "Teladoc Health scale"),
          h("span", { className: "body-small-default synced-row" }, h(A.Icon, { name: "refresh", size: 16 }), "Connected, synced today")),
        h(A.Icon, { name: "check", size: 24 })),
      h("div", { className: "callout" },
        h("h3", { className: "heading-heading-4" }, "No scale?"),
        h("p", { className: "body-default" }, "Weigh in at a pharmacy kiosk or log manually instead."),
        h(A.Button, { variant: "tertiary", onClick: p.next }, "Log manually this week")));
  }

  function Manual(p) {
    var w = useState("201.8"), weight = w[0], setWeight = w[1];
    var u = useRef("Pounds");
    function submit() {
      var unit = u.current === "Kilograms" ? "kg" : "lbs";
      logged(p, "Weight logged: " + (weight || "0") + " " + unit)();
    }
    return h(Sheet, { title: "Weigh-ins", onClose: p.back, under: h(UnderDay) },
      h("h3", { className: "heading-heading-2", style: { marginBottom: 8 } }, "Enter your weight manually"),
      h("p", { className: "body-default subdued", style: { marginBottom: 16 } }, "If you can’t use your Teladoc Health scale, weigh yourself on another scale and enter it here."),
      h("p", { className: "body-small-default req-note" }, "*Required"),
      h("div", { className: "row-2" },
        h(A.TextInput, { label: "Weight*", value: weight, onChange: function (e) { setWeight(e.target.value); }, inputMode: "decimal" }),
        h(Select, { label: "Units*", defaultValue: "Pounds", options: ["Pounds", "Kilograms"], onChange: function (v) { u.current = v; } })),
      h("div", { style: { marginTop: 32 } }, h(Primary, { onClick: submit }, "Submit")));
  }

  /* ------------------------------------------------------------------
     AFTER screens: food log and lessons (Figma 200, 300)
     ------------------------------------------------------------------ */
  // Full nutrition facts, shown when "View more nutrition information" is open (Figma 201).
  var NUTRITION_FACTS = [
    { bold: true, rows: [["Calories", "240"]] },
    { bold: true, rows: [["Total fat", "3 g"], ["Saturated fat", "1 g"], ["Trans fat", "0 g"]] },
    { rows: [["Cholesterol", "35 mg"]] },
    { rows: [["Sodium", "850 mg"]] },
    { bold: true, rows: [["Total carbohydrate", "22 g"], ["Dietary fiber", "4 g"], ["Total sugars", "6 g"]] },
    { bold: true, end: true, rows: [["Protein", "11 g"]] },
    { rows: [["Vitamin D", "0 mcg"], ["Calcium", "320 mg"], ["Iron", "1.6 mg"], ["Potassium", "510 mg"]] }
  ];

  function FoodLog(p) {
    var more = useState(false), open = more[0], setOpen = more[1];
    return h(React.Fragment, null,
      h("div", { className: "food-head" },
        h(A.IconButton, { icon: "arrow-left", label: "Back", onClick: p.back }),
        h("h1", { className: "heading-heading-4" }, "Edit food detail"),
        h("span", { className: "food-trash" }, h(A.IconButton, { icon: "trash", label: "Delete" }))),
      h("div", { className: "as-body", style: { paddingTop: 8 } },
        h("div", { className: "food-hero" },
          h("img", { src: "images/food-blueberries.jpg", alt: "", width: 40, height: 40 }),
          h("h2", { className: "heading-heading-1" }, "Blueberries")),
        h("div", { className: "form" },
          h("div", { className: "row-2" },
            h(Select, { ariaLabel: "Meal", defaultValue: "Breakfast", options: ["Breakfast", "Lunch", "Dinner", "Snack"] }),
            h(A.TextInput, { defaultValue: "5/12 at 10:10 AM", "aria-label": "Date and time" })),
          h("div", { className: "qty-row" },
            h(A.TextInput, { defaultValue: "1", inputMode: "decimal", "aria-label": "Amount" }),
            h(Select, { ariaLabel: "Unit", defaultValue: "cup", options: ["cup", "oz", "g", "handful"] }))),
        open
          ? h("h2", { className: "heading-heading-2", style: { margin: "24px 0 12px" } }, "Nutrition")
          : h(SectionLabel, null, "Nutrition"),
        h("div", { className: "nutri" },
          [["Calories", "240", ""], ["Carbs", "22", "g"], ["Protein", "11", "g"], ["Fat", "3", "g"]].map(function (n) {
            return h("div", { key: n[0] }, h("p", { className: "body-small-default subdued" }, n[0]), h("p", { className: "nutri-v" }, h("strong", null, n[1]), n[2] ? " " + n[2] : ""));
          })),
        h("div", { style: { margin: "12px 0 16px" } },
          h(A.Button, { variant: "tertiary", icon: "right", iconName: open ? "line-arrow-up" : "line-arrow-down", "aria-expanded": open, onClick: function () { setOpen(!open); } }, open ? "View less nutrition information" : "View more nutrition information")),
        open ? h("div", { className: "facts" },
          NUTRITION_FACTS.map(function (g, k) {
            return h("div", { key: k, className: "facts-group" + (g.end ? " facts-group--end" : "") },
              g.rows.map(function (r, n) {
                return h("p", { key: n, className: n === 0 && g.bold ? "body-strong facts-row" : "body-default facts-row" }, h("span", null, r[0]), h("span", null, r[1]));
              }));
          })) : null,
        h("div", { className: "anvil-field" + (open ? "" : " food-note"), style: { paddingTop: 16 } },
          h("div", { className: "anvil-field__labels" }, h("label", { className: "anvil-field__label", htmlFor: "food-note" }, "Note")),
          h("textarea", { id: "food-note", className: "textarea", rows: 3, placeholder: "How did this food make you feel? Any additional notes?" })),
        h("p", { className: "heading-heading-4", style: { margin: "24px 0 8px" } }, "Meal photo"),
        h("img", { className: "meal-photo", src: "images/meal-photo.jpg", alt: "Yogurt bowl with blueberries and granola", width: 711, height: 712 }),
        h(Foot, { sticky: true }, h(Primary, { onClick: logged(p, "Food logged: Blueberries") }, "Save"))));
  }

  var LESSONS = [
    { img: "lesson-compounded", tag: "Weight management", title: "Compounded GLP-1 drugs: What you need to know", body: "The growing popularity of GLP-1 medications for weight loss has led to shortages of the drugs…" },
    { img: "lesson-exercise", tag: "Fitness", title: "5 tips to help you not hate exercise", body: "You probably know exercise is one of the best things you can do for your health…" },
    { img: "lesson-therapy", tag: "Mental health", title: "Starting therapy: A beginner’s guide", body: "While starting therapy is a brave step toward better health, it can feel overwhelming…" }
  ];

  function Lessons(p) {
    return h(React.Fragment, null,
      h(Focused, { title: "Lessons", onBack: p.back }),
      h("div", { className: "as-body", style: { paddingTop: 8 } },
        h(SectionLabel, null, "Featured"),
        h("img", { className: "lesson-hero", src: "images/lesson-featured.jpg", alt: "", width: 718, height: 403 }),
        h("p", { className: "body-small-default subdued", style: { marginTop: 12 } }, "Weight management"),
        h("a", { href: "#", className: "lesson-title heading-heading-4", onClick: function (e) { e.preventDefault(); } }, "GLP-1 medication and weight loss"),
        h("p", { className: "body-default", style: { marginTop: 8 } }, "Providers have been using GLP-1 drugs to treat type 2 diabetes since 2005…"),
        h(SectionLabel, null, "Additional lessons"),
        h("div", { className: "lesson-list" },
          LESSONS.map(function (l) {
            return h("div", { key: l.img, className: "lesson" },
              h("img", { src: "images/" + l.img + ".jpg", alt: "", width: 236, height: 132 }),
              h("div", null,
                h("p", { className: "body-small-default subdued" }, l.tag),
                h("a", { href: "#", className: "lesson-title heading-heading-4", onClick: function (e) { e.preventDefault(); } }, l.title),
                h("p", { className: "body-small-default", style: { marginTop: 8 } }, l.body)));
          })),
        h(Foot, { sticky: true }, h(Primary, { onClick: logged(p, "Lesson completed") }, "Completed"))));
  }

  /* ------------------------------------------------------------------
     AFTER screens: side effects (Figma 400-403)
     ------------------------------------------------------------------ */
  function Chips(props) {
    return h("div", { className: "chips" + (props.row ? " chips--row" : ""), role: "group", "aria-labelledby": props.labelId },
      props.options.map(function (o) {
        return h("button", {
          key: o, type: "button", className: "chip", "aria-pressed": props.value === o,
          onClick: function () { props.onChange(o); }
        }, o);
      }));
  }

  var SYMPTOMS = ["Feeling nauseous", "Feeling full quickly", "Bloating or gas", "Stomach discomfort or cramping", "Occasional vomiting"];

  function Symptoms(p) {
    var s = useState(""), symptom = s[0], setSymptom = s[1];
    var v = useState(""), severity = v[0], setSeverity = v[1];
    var endRef = useRef(null);
    useEffect(function () {
      if ((symptom || severity) && endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [symptom, severity]);
    return h("div", { className: "chat" },
      h(Focused, { title: "Symptom checker", onBack: p.back, onClose: function () { session.keep = true; p.to(session.day)(); } }),
      h("div", { className: "as-body chat-body" },
        h("div", { className: "chat-hello" },
          h("span", { className: "spark", "aria-hidden": "true" }, h(A.Icon, { name: "ai-sparkles", size: 24 })),
          h("h1", { className: "heading-heading-1 as-title center" }, "How are you feeling?")),
        h("fieldset", { className: "radios" },
          h("legend", { className: "heading-heading-4" }, "Common symptoms"),
          SYMPTOMS.map(function (o) {
            return h("label", { key: o, className: "radio" },
              h("input", { type: "radio", name: "symptom", value: o, checked: symptom === o, onChange: function () { setSymptom(o); setSeverity(""); } }),
              h("span", { className: "radio-dot", "aria-hidden": "true" }),
              h("span", { className: "body-default" }, o));
          })),
        symptom ? h(React.Fragment, null,
          h("p", { className: "bubble" }, symptom),
          h("h2", { className: "heading-heading-4" }, "Here’s what helps:"),
          h("ul", { className: "helps body-small-default" },
            h("li", null, h(A.Icon, { name: "meal", size: 16 }), "Eat small, low-fat meals"),
            h("li", null, h(A.Icon, { name: "clock", size: 16 }), "Sip water between meals"),
            h("li", null, h(A.Icon, { name: "moon", size: 16 }), "Don’t lie down right after eating")),
          h("h2", { id: "sev", className: "heading-heading-4", style: { marginTop: 24 } }, "Log severity to help us flag if this needs a nurse"),
          h(Chips, { row: true, labelId: "sev", options: ["Mild", "Tolerable", "Severe"], value: severity, onChange: setSeverity })) : null,
        severity ? h("p", { className: "bubble" }, severity) : null,
        severity === "Severe" ? h(React.Fragment, null,
          h("div", { className: "banner banner--critical", role: "alert" },
            h(A.Icon, { name: "alert-triangle", size: 24 }),
            h("div", null,
              h("p", { className: "heading-heading-4" }, "This needs attention now"),
              h("p", { className: "body-default" }, "Persistent severe pain can be a sign of pancreatitis."))),
          h("div", { className: "chat-actions" },
            h(A.Button, { variant: "secondary", className: "full", onClick: p.next }, "Call care team now"),
            h(Skip, { onClick: p.next }, "Message nurse line"))) : null,
        severity && severity !== "Severe" ? h("div", { className: "banner banner--success", role: "status" },
          h(A.Icon, { name: "check-circle", size: 24 }),
          h("div", null,
            h("p", { className: "heading-heading-4" }, "Logged for your care team"),
            h("p", { className: "body-default" }, "Sally will see this at your next check-in. Tell us if it gets worse."))) : null,
        h("div", { ref: endRef, className: "chat-end" })),
      h("div", { className: "ask" },
        h("label", { className: "ask-field" },
          h("input", { type: "text", placeholder: "Ask a question…", "aria-label": "Ask a question" }),
          h("span", { className: "ask-send", "aria-hidden": "true" }, h(A.Icon, { name: "line-arrow-up", size: 16 })))));
  }

  function Sms(p) {
    var msgs = [
      { me: false, t: "Hi, James. I’m here to help. You told me you’re feeling nauseous and that it’s been pretty intense. That sounds really uncomfortable. Would you like me to walk you through some options, or would you prefer to talk with a nurse right now?" },
      { me: true, t: "How did you get my number?" },
      { me: false, t: "Good question! You’re getting this message because you’re a Teladoc Health member. We can help with symptom guidance or connect you with a care team member, whatever feels best for you." },
      { me: false, t: "I’m sorry you’re not feeling well. I’m happy to help however I can. Would you like to speak with a nurse now, or would you prefer to try some self-care tips first?" },
      { me: true, t: "I’d like to speak with a nurse." }
    ];
    // The text app is outside Teladoc's app, so it uses the dark theme's tokens.
    return h("div", { className: "sms", "data-theme": "core-dark" },
      h(StatusBar, { clear: true }),
      h("div", { className: "sms-head" },
        h("button", { type: "button", className: "sms-back", "aria-label": "Back to the app", onClick: p.to("home-next") }, h(A.Icon, { name: "arrow-left", size: 16 })),
        h(A.Connector, { size: 48, className: "sms-avatar" }),
        h("span", { className: "sms-name" }, "Teladoc Health")),
      h("div", { className: "sms-list", role: "log", "aria-label": "Text messages" },
        msgs.map(function (m, n) {
          return h("p", { key: n, className: "sms-msg" + (m.me ? " sms-msg--me" : "") }, m.t);
        })),
      h("div", { className: "sms-compose", "aria-hidden": "true" },
        h("span", { className: "sms-plus" }, h(A.Icon, { name: "plus", size: 16 })),
        h("span", { className: "sms-field" }, "Text message")));
  }

  // Select, built from Anvil's field and input styles (Anvil has no Select component yet).
  var selectId = 0;
  function Select(props) {
    var idRef = useRef("sel-" + (++selectId));
    var st = useState(props.defaultValue || "");
    var value = st[0], setValue = st[1];
    var control = h("div", { className: "anvil-input select" + (value ? "" : " is-placeholder") },
      h("select", {
        id: idRef.current, className: "anvil-input__native", value: value,
        "aria-label": props.label ? undefined : props.ariaLabel,
        onChange: function (e) { setValue(e.target.value); if (props.onChange) props.onChange(e.target.value); }
      },
        h("option", { value: "", disabled: true }, props.placeholder || "Select"),
        props.options.map(function (o) { return h("option", { key: o, value: o }, o); })),
      h("span", { className: "anvil-input__icon" }, h(A.Icon, { name: "caret-down" })));
    if (!props.label) return control;
    return h("div", { className: "anvil-field" },
      h("div", { className: "anvil-field__labels" },
        h("label", { className: "anvil-field__label", htmlFor: idRef.current }, props.label)),
      control);
  }

  /* ------------------------------------------------------------------
     AFTER flow, in Figma file order. The symptom checker folds Figma
     400-402 into one live screen. day is the GLP-1 day a sheet opens on
     when you jump to it from the screen list.
     ------------------------------------------------------------------ */
  function dayScreen(id) { return function (p) { return h(GlpDay, Object.assign({}, p, { dayId: id })); }; }
  var AFTER = [
    { id: "home", title: "Home", render: Home, group: "Finding GLP-1 info", noStatus: true },
    { id: "health", title: "My health", render: MyHealth },

    { id: "day1", title: "Day 1 of 30", render: dayScreen("day1"), group: "Tracking requirements" },
    { id: "day7", title: "Day 7: shot day", render: dayScreen("day7") },
    { id: "day29", title: "Day 29: a task is missing", render: dayScreen("day29") },
    { id: "day30", title: "Day 30: requirements met", render: dayScreen("day30") },
    { id: "inject", title: "Injection site", render: Injection, sheet: true, day: "day30" },
    { id: "track-done", title: "Track: completed tasks", render: Track, sheet: true, day: "day30" },

    { id: "home-next", title: "Home", render: function (p) { return h(Home, Object.assign({}, p, { next_refill: true })); }, group: "Next refill", noStatus: true },
    { id: "health-next", title: "My health", render: function (p) { return h(MyHealth, Object.assign({}, p, { next_refill: true })); } },

    { id: "track", title: "Track", render: Track, sheet: true, day: "day1", group: "Logging activity" },
    { id: "weighins", title: "Weigh-ins", render: Weighins, sheet: true, day: "day30" },
    { id: "manual", title: "Enter your weight", render: Manual, sheet: true, day: "day30" },
    { id: "food", title: "Food log", render: FoodLog, day: "day30" },
    { id: "lessons", title: "Lessons", render: Lessons, day: "day30" },

    { id: "symptoms", title: "Symptom checker", render: Symptoms, bg: "gradient", day: "day30", group: "Side effects" },
    { id: "sms", title: "Text from Teladoc Health", render: Sms, noStatus: true }
  ];
  /* ------------------------------------------------------------------
     Screens in the phone
     ------------------------------------------------------------------ */
  function pct(v, total) { return (v / total * 100) + "%"; }

  function BeforeScreen(props) {
    var s = props.screen;
    var rv = useState(false), reveal = rv[0], setReveal = rv[1];
    useEffect(function () {
      if (!reveal) return;
      var t = setTimeout(function () { setReveal(false); }, 1000);
      return function () { clearTimeout(t); };
    }, [reveal]);

    // A box in image pixels, as percentages of the part of the image it sits in
    // (the scrolling part, or the pinned tab bar from y0 to y1).
    function box(b, y0, y1) {
      return { left: pct(b[0], s.w), top: pct(b[1] - y0, y1 - y0), width: pct(b[2] - b[0], s.w), height: pct(b[3] - b[1], y1 - y0) };
    }
    function go(t) {
      if (t === "back") return props.back;
      if (t) return props.to(t);
      return props.next;
    }
    function spots(inFoot, y0, y1) {
      return (s.hot || []).map(function (spot, n) {
        var f = go(spot.to);
        if (!f || (s.foot ? (spot.box[1] >= s.foot) !== inFoot : inFoot)) return null;
        return h("button", { key: n, className: "hotspot", style: box(spot.box, y0, y1), "aria-label": spot.label, onClick: f });
      });
    }
    var img = h("img", { src: "before/" + s.file, alt: "Old design: " + s.title, width: s.w, height: s.h, draggable: false });
    return h("div", {
      className: "shot" + (reveal ? " reveal" : ""),
      onClick: function (e) { if (!e.target.closest(".hotspot")) setReveal(true); }
    },
      s.foot
        ? h(React.Fragment, null,
            h("div", { className: "shot-main", style: { aspectRatio: s.w + " / " + s.foot } }, img, spots(false, 0, s.foot)),
            h("div", { className: "shot-foot", style: { aspectRatio: s.w + " / " + (s.h - s.foot) } },
              h("img", { src: "before/" + s.file, alt: "", "aria-hidden": "true", draggable: false, style: { marginTop: "-" + pct(s.foot, s.w) } }),
              spots(true, s.foot, s.h)))
        : h(React.Fragment, null, img, spots(false, 0, s.h)));
  }

  function AfterScreen(props) {
    var s = props.screen;
    var cls = "as" + (s.bg ? " as--" + s.bg : "") + (s.sheet ? " as--sheet" : "");
    return h("div", { className: cls },
      s.noStatus || s.sheet ? null : h(StatusBar, { clear: s.bg === "gradient" }),
      h(s.render, { next: props.next, back: props.back, to: props.to }));
  }

  /* ------------------------------------------------------------------
     Page
     ------------------------------------------------------------------ */
  function readHash() {
    var m = /^#(before|after)(?:\/(\d+))?$/.exec(location.hash);
    if (!m) return null;
    return { mode: m[1], index: Math.max(0, (parseInt(m[2] || "1", 10) || 1) - 1) };
  }


  /* ------------------------------------------------------------------
     Mini case study, shown under the prototype
     ------------------------------------------------------------------ */
  var STATS = [
    { n: "5x", l: "GLP-1 program discoverability" },
    { n: "4 taps → Home", l: "GLP-1 moved from a Condition Management menu to the homepage" },
    { n: "4 zones", l: "in the homepage framework defined with engineering and product" },
    { n: "~2x", l: "enrollment when a care team member guided members through the app (~60-member test)" }
  ];
  var DECISIONS = [
    { t: "Simplify the homepage with engineering and product",
      p: ["GLP-1 sat four taps deep: Programs, then Condition Management, then its menu, then “GLP-1 medication for weight loss.” I brought engineering and product together in workshops to simplify the homepage, and together we defined Teladoc Health’s four-zone homepage framework. It gives programs like GLP-1 a clear place on Home, as an action to take, and in My health next to the member’s other medications."],
      screen: 1 },
    { t: "Show the cycle as a timeline",
      p: ["Members had no timeline and no clear start or end to their cycle. The GLP-1 page now opens on a 30-day tracker that marks today, shows what’s been logged and when the next shot is due. It warns when a task is missing near the end of the cycle, and confirms when the requirements are met."],
      screen: 3 },
    { t: "Make the requirements impossible to miss",
      p: ["I chose a basic dashboard that worked end to end over a bigger one that did many things halfway. One Track sheet lists the four requirements and everything logged toward them, and each row leads straight to logging a weigh-in, a food log or a lesson. A short confirmation appears when something new is logged."],
      screen: 8 },
    { t: "Let members enter their weight by hand",
      p: ["Members who were traveling, had a scale that wouldn’t connect, or weighed over the scale’s 440 lb limit couldn’t complete a weigh-in, and lost their medication. Clinical and product agreed that self-reported weight would count, so I put it inside the existing weigh-in flow. It went live in October 2026."],
      screen: 13 }
  ];

  function CaseStudy(props) {
    return h("article", { className: "case", "aria-labelledby": "case-title" },
      h("header", { className: "case-head" },
        h("p", { className: "heading-eyebrow case-eyebrow" }, "Mini case study"),
        h("h2", { id: "case-title", className: "heading-heading-1 case-h" }, "Making the GLP-1 program easy to find"),
        h("p", { className: "body-default case-lede" },
          "Members whose plans covered GLP-1 medication for weight loss had trouble finding the program: it sat four taps deep in a Condition Management menu. Those who found it often didn’t know they had monthly requirements to meet until their prescription was denied at the pharmacy. I brought engineering and product together in workshops that simplified the homepage and defined Teladoc Health’s four-zone homepage framework, which improved GLP-1 program discoverability 5x."),
        h("p", { className: "body-small-default case-meta" },
          h("strong", null, "Role: "), "Lead Product Designer · ",
          h("strong", null, "Team: "), "Chronic Care Management · ",
          h("strong", null, "Timeline: "), "Jan 2026 – Q2 2027 releases · ",
          h("strong", null, "Built with: "), "Anvil design system")),

      h("ul", { className: "case-stats" },
        STATS.map(function (s, n) {
          return h("li", { key: n, className: "case-stat" },
            h("span", { className: "case-num" }, s.n),
            h("span", { className: "body-small-default case-label" }, s.l));
        })),

      h("section", { className: "case-sec" },
        h("h3", { className: "heading-heading-2 case-h" }, "The problem"),
        h("ul", { className: "case-list body-default" },
          h("li", null, h("strong", null, "Hard to find. "), "GLP-1 information sat four taps deep, under Programs, Condition Management and its menu, behind a homepage crowded with other content."),
          h("li", null, h("strong", null, "Found out at the pharmacy. "), "Members had monthly requirements to keep their discount, and many learned about them only when their prescription was denied."),
          h("li", null, h("strong", null, "No help in the app. "), "There was no timeline, no way to see progress and no clear start or end to the cycle."))),

      h("section", { className: "case-sec" },
        h("h3", { className: "heading-heading-2 case-h" }, "Key decisions"),
        h("ol", { className: "case-decisions" },
          DECISIONS.map(function (d, n) {
            return h("li", { key: n, className: "case-decision" },
              h("h4", { className: "heading-heading-3 case-h" }, (n + 1) + ". " + d.t),
              d.p.map(function (t, k) { return h("p", { key: k, className: "body-default" }, t); }),
              d.screen ? h("p", { className: "body-small-default" },
                h("a", { href: "#after/" + d.screen, onClick: props.onShow }, "See it in the prototype ↑")) : null);
          }))),

      h("section", { className: "case-callout" },
        h("p", { className: "heading-eyebrow case-eyebrow" }, "By the numbers"),
        h("h3", { className: "case-callout-h" }, "5x GLP-1 program discoverability"),
        h("p", { className: "body-default" }, "Workshops with engineering and product simplified the homepage and defined a four-zone framework, so GLP-1 shows up on Home and in My health instead of four taps deep. And when a care team member walked members through the requirements, enrollment roughly doubled.")));
  }

  function App() {
    var start = readHash() || { mode: "before", index: 0 };
    var init = useRef(false);
    if (!init.current) {
      init.current = true;
      var first = start.mode === "after" && AFTER[Math.min(start.index, AFTER.length - 1)];
      if (first && first.day) { session.day = first.day; session.n = DAYS[first.day].n; }
    }
    var ms = useState(start.mode), mode = ms[0], setMode = ms[1];
    var ps = useState({ before: start.mode === "before" ? start.index : 0, after: start.mode === "after" ? start.index : 0 });
    var pos = ps[0], setPos = ps[1];
    var hs = useState({ before: [], after: [] }), trail = hs[0], setTrail = hs[1];
    var screenRef = useRef(null);

    var flow = mode === "before" ? BEFORE : AFTER;
    var i = Math.min(pos[mode], flow.length - 1);
    var last = i === flow.length - 1;

    function go(n, remember) {
      n = Math.max(0, Math.min(flow.length - 1, n));
      // Jumping straight to a sheet opens it on its usual GLP-1 day.
      if (!remember && mode === "after" && flow[n].day) { session.day = flow[n].day; session.n = DAYS[flow[n].day].n; }
      // Coming back to the GLP-1 page from one of its sheets or screens
      // reopens it on the day the tracker was on.
      session.keep = !!(mode === "after" && remember && flow[i].day);
      var next = Object.assign({}, pos); next[mode] = n; setPos(next);
      var t = Object.assign({}, trail);
      t[mode] = remember ? trail[mode].concat([i]).slice(-20) : [];
      setTrail(t);
    }
    function indexOf(id) {
      for (var k = 0; k < flow.length; k++) if (flow[k].id === id) return k;
      return -1;
    }
    // In-screen actions: next screen, back to where you came from, or a screen by id.
    function to(id) { return function () { var k = indexOf(id); if (k >= 0) go(k, true); }; }
    function back() {
      var t = trail[mode];
      session.keep = !!(mode === "after" && flow[i].day);
      if (t.length) {
        var prev = t[t.length - 1];
        var p2 = Object.assign({}, pos); p2[mode] = prev; setPos(p2);
        var t2 = Object.assign({}, trail); t2[mode] = t.slice(0, -1); setTrail(t2);
      } else go(i - 1);
    }
    function switchTo(m) { setMode(m); }

    // Keep the URL in sync so you can link straight to a screen, e.g. #after/3
    useEffect(function () {
      var hash = "#" + mode + "/" + (i + 1);
      if (location.hash !== hash) history.replaceState(null, "", hash);
      if (screenRef.current) screenRef.current.scrollTop = 0;
    }, [mode, i]);

    useEffect(function () {
      function onHash() { var r = readHash(); if (r) { setMode(r.mode); setPos(function (p) { var n = Object.assign({}, p); n[r.mode] = r.index; return n; }); } }
      function onKey(e) {
        if (e.target.closest && e.target.closest("input, select, textarea")) return;
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }
      window.addEventListener("hashchange", onHash);
      window.addEventListener("keydown", onKey);
      return function () { window.removeEventListener("hashchange", onHash); window.removeEventListener("keydown", onKey); };
    });

    var screenProps = {
      next: last ? null : function () { go(i + 1, true); },
      back: i > 0 || trail[mode].length ? back : null,
      to: to
    };
    var screen = mode === "before"
      ? h(BeforeScreen, Object.assign({ key: "b" + i, screen: flow[i] }, screenProps))
      : h(AfterScreen, Object.assign({ key: "a" + i, screen: flow[i] }, screenProps));

    return h("main", { className: "page" },
      h("header", { className: "intro" },
        h("p", { className: "heading-eyebrow" }, "Teladoc Health · GLP-1 · Mini case study"),
        h("h1", { className: "heading-heading-1" }, "GLP-1 medication, before and after Anvil"),
        h("p", { className: "body-default" }, "Click through the original GLP-1 experience, then switch to the redesign built with the Anvil design system. Tap each screen’s main button to move forward. The story behind it is below.")),

      h("div", { className: "stage" },
        h("section", { className: "panel panel--left", "aria-label": "Version" },
          h("div", { className: "switch", role: "group", "aria-label": "Version" },
            h("button", { type: "button", "aria-pressed": mode === "before", onClick: function () { switchTo("before"); } }, "Before", h("small", null, "Original")),
            h("button", { type: "button", "aria-pressed": mode === "after", onClick: function () { switchTo("after"); } }, "After", h("small", null, "Anvil"))),
          h("p", { className: "body-small-default about" }, mode === "before"
            ? "The original experience: " + BEFORE.length + " screens, shown as screenshots. Click anywhere to see where to tap."
            : "The redesign: " + AFTER.length + " screens, built live with Anvil components, tokens and illustrations. Tap a day in the tracker, log your weight or check a symptom.")),

        h("div", { className: "device" },
          h("div", { className: "phone" },
            h("div", { className: "screen", ref: screenRef, tabIndex: -1 }, screen)),
          h("div", { className: "nav-row" },
            h(A.Button, { variant: "tertiary", icon: "left", iconName: "arrow-left", disabled: i === 0, onClick: function () { go(i - 1); } }, "Previous"),
            h("span", { className: "counter", "aria-live": "polite" }, (i + 1) + " of " + flow.length),
            last
              ? h(A.Button, { variant: "tertiary", icon: "right", iconName: "reload", onClick: function () { go(0); } }, "Start over")
              : h(A.Button, { variant: "tertiary", icon: "right", iconName: "arrow-right", onClick: function () { go(i + 1); } }, "Next"))),

        h("nav", { className: "panel panel--right", "aria-label": "Screens" },
          h("div", null,
            h("p", { className: "heading-sections panel-label" }, mode === "before" ? "Original screens" : "Redesigned screens"),
            h("ol", { className: "steps" },
              flow.map(function (s, n) {
                return h(React.Fragment, { key: n },
                  s.group ? h("li", { className: "steps-group", "aria-hidden": "true" }, s.group) : null,
                  h("li", null,
                    h("button", { type: "button", "aria-current": n === i ? "step" : undefined, onClick: function () { go(n); } },
                      h("span", { className: "num" }, n + 1), s.title)));
              }))))),

      h(CaseStudy, { onShow: function () { window.scrollTo({ top: 0, behavior: "smooth" }); } }));
  }

  ReactDOM.createRoot(document.getElementById("app")).render(h(App));
})();
