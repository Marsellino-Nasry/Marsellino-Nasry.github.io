/* Marsellino Nasry Mounir — site behaviour
   Progressive enhancement: every page is complete and readable without JavaScript.
   No dependencies, no tracking, no network calls except the contact form on submit. */
(function () {
  "use strict";

  var SITE = {
    email: "marsellino.nasry@gmail.com",
    formMinSeconds: 3,       // submissions faster than this are treated as automated
    formCooldownSeconds: 60, // pause between successful sends from the same browser
    formTimeoutMs: 15000
  };

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js");

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var spriteUse = $('use[href*="icons.svg"]');
  var SPRITE = spriteUse ? spriteUse.getAttribute("href").split("#")[0] : "assets/img/icons.svg";
  var SVGNS = "http://www.w3.org/2000/svg";

  function makeIcon(name, cls) {
    var svg = doc.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", cls || "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = doc.createElementNS(SVGNS, "use");
    use.setAttribute("href", SPRITE + "#" + name);
    svg.appendChild(use);
    return svg;
  }

  /* Shared polite live region for short announcements */
  var live = doc.createElement("p");
  live.className = "visually-hidden";
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  doc.body.appendChild(live);
  function announce(text) {
    live.textContent = "";
    window.setTimeout(function () { live.textContent = text; }, 60);
  }

  /* ------------------------------------------------- Header, progress, top */
  var header = $(".site-header");
  var toTop = $(".to-top");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 900);
    var max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--progress", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var brand = $(".brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------------- Section menu */
  var toggle = $(".nav-toggle");
  var menu = $("#site-menu");
  if (toggle && menu) {
    var label = $(".nav-toggle__label", toggle);
    var icon = $("use", toggle);
    var iconBase = icon ? icon.getAttribute("href").split("#")[0] : "";
    var setMenu = function (open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      doc.body.classList.toggle("is-locked", open);
      if (label) label.textContent = open ? "Close" : "Menu";
      toggle.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
      if (icon) icon.setAttribute("href", iconBase + (open ? "#i-close" : "#i-menu"));
      if (open) { var first = $("a", menu); if (first) first.focus(); }
      else if (returnFocus) toggle.focus();
    };
    toggle.setAttribute("aria-label", "Open section menu");
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true", false); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false, false); }); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = $$("a, button", menu);
      var last = items[items.length - 1];
      if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); toggle.focus(); }
    });
    toggle.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey && toggle.getAttribute("aria-expanded") === "true") {
        e.preventDefault();
        var first = $("a", menu);
        if (first) first.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1200 && toggle.getAttribute("aria-expanded") === "true") setMenu(false, false);
    });
  }

  /* ------------------------------------------- Active section in the nav */
  var navLinks = $$(".site-nav__list a[data-nav]");
  var sections = $$("[data-nav-section]");
  if ("IntersectionObserver" in window && sections.length && navLinks.length && $(".page-home")) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = entry.target.getAttribute("data-nav-section");
        navLinks.forEach(function (a) {
          if (a.getAttribute("data-nav") === key) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------------------------ Tabs
     Markup: [data-tabs] containing [data-tablist] and [data-tab-panel data-tab-label].
     Optional: data-tab-class (button class), data-tab-numbered, and on panels
     data-tab-icon and data-tab-sub. Buttons are generated here, so without JS
     every panel simply shows in sequence. */
  $$("[data-tabs]").forEach(function (box, boxIndex) {
    var list = $("[data-tablist]", box);
    var panels = $$("[data-tab-panel]", box).filter(function (p) { return p.closest("[data-tabs]") === box; });
    if (!list || !panels.length) return;
    var cls = box.getAttribute("data-tab-class") || "tab";
    var numbered = box.hasAttribute("data-tab-numbered");
    var tabs = panels.map(function (panel, i) {
      var id = panel.id || ("panel-" + boxIndex + "-" + i);
      panel.id = id;
      var tab = doc.createElement("button");
      tab.type = "button";
      tab.id = id + "-tab";
      tab.className = cls;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", id);
      if (panel.getAttribute("data-tab-icon")) tab.appendChild(makeIcon(panel.getAttribute("data-tab-icon")));
      if (numbered) {
        var n = doc.createElement("span");
        n.className = "tab__n";
        n.textContent = String(i + 1).padStart(2, "0");
        tab.appendChild(n);
      }
      var lab = doc.createElement("span");
      lab.className = "tab__label";
      lab.textContent = panel.getAttribute("data-tab-label");
      tab.appendChild(lab);
      if (panel.getAttribute("data-tab-sub")) {
        var sub = doc.createElement("span");
        sub.className = "tab__sub";
        sub.textContent = panel.getAttribute("data-tab-sub");
        tab.appendChild(sub);
      }
      list.appendChild(tab);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      return tab;
    });

    function select(index, focus) {
      tabs.forEach(function (t, i) {
        var on = i === index;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle("is-past", i < index);
        var wasHidden = panels[i].hidden;
        panels[i].hidden = !on;
        if (on && wasHidden !== false) panels[i].dispatchEvent(new CustomEvent("tab:shown", { bubbles: true }));
      });
      if (focus) tabs[index].focus({ preventScroll: true });
      if (list.scrollWidth > list.clientWidth + 2) {
        var t = tabs[index];
        if (t.offsetLeft < list.scrollLeft || t.offsetLeft + t.offsetWidth > list.scrollLeft + list.clientWidth) {
          list.scrollLeft = Math.max(0, t.offsetLeft - 16);
        }
      }
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
    var fromHash = panels.findIndex(function (p) { return location.hash === "#" + p.id; });
    select(fromHash >= 0 ? fromHash : 0, false);
  });

  /* ------------------------------------------------------- Graph diagrams
     [data-graph] with data-edges="a>b:class class|tag, ..." and nodes [data-node].
     Connectors are drawn into .graph__svg and redrawn on resize. Focusing or
     hovering a node highlights everything upstream and downstream of it. */
  var graphs = [];

  function parseEdges(str) {
    return (str || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) {
      var tagSplit = s.split("|");
      var main = tagSplit[0];
      var tags = tagSplit[1] ? tagSplit[1].trim().split(/\s+/) : [];
      var parts = main.split(":");
      var ends = parts[0].split(">");
      return { from: ends[0].trim(), to: ends[1].trim(), cls: parts[1] ? parts[1].trim().split(/\s+/) : [], tags: tags };
    });
  }

  function Graph(el) {
    var self = this;
    this.el = el;
    this.svg = $(".graph__svg", el);
    this.edges = parseEdges(el.getAttribute("data-edges"));
    this.dir = el.getAttribute("data-edge-dir") || "auto";
    this.minW = Number(el.getAttribute("data-edges-min")) || 0;
    this.depth = Number(el.getAttribute("data-graph-depth")) || Infinity;
    this.nodes = {};
    $$("[data-node]", el).forEach(function (n) { self.nodes[n.getAttribute("data-node")] = n; });
    this.pinned = null;
    this.detail = el.getAttribute("data-detail-target") ? doc.getElementById(el.getAttribute("data-detail-target")) : null;
    this.defaultDetail = null;
    if (this.detail) {
      var t = $("[data-detail-title]", this.detail), x = $("[data-detail-text]", this.detail);
      if (t && x) this.defaultDetail = { title: t.textContent, text: x.textContent };
    }
    this.bind();
    this.draw();
  }

  Graph.prototype.draw = function () {
    var svg = this.svg;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (window.innerWidth < this.minW || !this.el.offsetParent) { this.el.classList.remove("has-edges"); return; }
    this.el.classList.add("has-edges");
    var box = this.el.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + box.width.toFixed(1) + " " + box.height.toFixed(1));
    var self = this;
    this.edges.forEach(function (e) {
      var a = self.nodes[e.from], b = self.nodes[e.to];
      if (!a || !b || !a.offsetParent || !b.offsetParent) return;
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var A = { l: ra.left - box.left, r: ra.right - box.left, t: ra.top - box.top, b: ra.bottom - box.top };
      var B = { l: rb.left - box.left, r: rb.right - box.left, t: rb.top - box.top, b: rb.bottom - box.top };
      var gapX = Math.max(B.l - A.r, A.l - B.r, 0);
      var gapY = Math.max(B.t - A.b, A.t - B.b, 0);
      var overlapX = !(B.l >= A.r - 2 || B.r <= A.l + 2);
      var horizontal = self.dir === "h" ? !overlapX : (!overlapX && gapX >= gapY);
      var x1, y1, x2, y2, d;
      if (horizontal) {
        if (B.l >= A.r - 2) { x1 = A.r; x2 = B.l; } else { x1 = A.l; x2 = B.r; }
        y1 = (A.t + A.b) / 2; y2 = (B.t + B.b) / 2;
        var cx = (x2 - x1) * 0.5;
        d = "M" + x1 + " " + y1 + " C" + (x1 + cx) + " " + y1 + " " + (x2 - cx) + " " + y2 + " " + x2 + " " + y2;
      } else {
        if (B.t >= A.b - 2) { y1 = A.b; y2 = B.t; } else { y1 = A.t; y2 = B.b; }
        x1 = (A.l + A.r) / 2; x2 = (B.l + B.r) / 2;
        var cy = (y2 - y1) * 0.5;
        d = "M" + x1 + " " + y1 + " C" + x1 + " " + (y1 + cy) + " " + x2 + " " + (y2 - cy) + " " + x2 + " " + y2;
      }
      var p = doc.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      var classes = ["edge"].concat(e.cls.map(function (c) { return "edge--" + c; }));
      if (e.tags.indexOf("atk") !== -1) classes.push("is-path");
      p.setAttribute("class", classes.join(" "));
      p.setAttribute("data-from", e.from);
      p.setAttribute("data-to", e.to);
      svg.appendChild(p);
      var tone = e.cls.filter(function (c) { return c === "blue" || c === "orange" || c === "teal"; })[0] || "blue";
      [[x2, y2]].forEach(function (pt) {
        var c = doc.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", pt[0]); c.setAttribute("cy", pt[1]); c.setAttribute("r", "3");
        c.setAttribute("class", "edge-port edge-port--" + tone);
        c.setAttribute("data-from", e.from); c.setAttribute("data-to", e.to);
        svg.appendChild(c);
      });
    });
    if (this.pinned) this.focus(this.pinned, true);
  };

  Graph.prototype.related = function (id) {
    var edges = this.edges, maxDepth = this.depth;
    function walk(start, dirKey, otherKey) {
      var seen = {}; var stack = [[start, 0]];
      while (stack.length) {
        var item = stack.pop(), n = item[0], d = item[1];
        if (d >= maxDepth) continue;
        edges.forEach(function (e) { if (e[dirKey] === n && !seen[e[otherKey]]) { seen[e[otherKey]] = true; stack.push([e[otherKey], d + 1]); } });
      }
      return seen;
    }
    var down = walk(id, "from", "to"); down[id] = true;
    var up = walk(id, "to", "from"); up[id] = true;
    return { down: down, up: up };
  };

  Graph.prototype.focus = function (id, keep) {
    if (this.el.closest(".env.is-path")) return;
    var rel = this.related(id);
    var el = this.el;
    el.classList.add("is-focus");
    Object.keys(this.nodes).forEach(function (k) {
      this.nodes[k].classList.toggle("is-hot", !!(rel.down[k] || rel.up[k]));
    }, this);
    $$(".edge, .edge-port", this.svg).forEach(function (p) {
      var f = p.getAttribute("data-from"), t = p.getAttribute("data-to");
      var hot = (rel.down[f] && rel.down[t]) || (rel.up[f] && rel.up[t]);
      p.classList.toggle("is-hot", !!hot);
    });
    if (!keep) this.show(id);
  };

  Graph.prototype.clear = function () {
    if (this.pinned) { this.focus(this.pinned, false); return; }
    this.el.classList.remove("is-focus");
    Object.keys(this.nodes).forEach(function (k) { this.nodes[k].classList.remove("is-hot"); }, this);
    $$(".is-hot", this.svg).forEach(function (p) { p.classList.remove("is-hot"); });
    this.show(null);
  };

  Graph.prototype.show = function (id) {
    var node = id ? this.nodes[id] : null;
    var evt = new CustomEvent("graph:select", { detail: { id: id, node: node, graph: this } });
    this.el.dispatchEvent(evt);
    if (!this.detail) return;
    var t = $("[data-detail-title]", this.detail), x = $("[data-detail-text]", this.detail);
    if (!t || !x) return;
    if (node && node.getAttribute("data-title")) {
      t.textContent = node.getAttribute("data-title");
      x.textContent = node.getAttribute("data-text") || "";
    } else if (this.defaultDetail) {
      t.textContent = this.defaultDetail.title;
      x.textContent = this.defaultDetail.text;
    }
  };

  Graph.prototype.bind = function () {
    var self = this;
    Object.keys(this.nodes).forEach(function (id) {
      var n = self.nodes[id];
      n.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") self.focus(id); });
      n.addEventListener("focus", function () { self.focus(id); });
      n.addEventListener("click", function () {
        if (n.tagName !== "BUTTON") return;
        if (self.pinned === id) {
          self.pinned = null; n.classList.remove("is-pinned"); n.removeAttribute("aria-pressed");
          self.clear();
        } else {
          if (self.pinned && self.nodes[self.pinned]) { self.nodes[self.pinned].classList.remove("is-pinned"); self.nodes[self.pinned].removeAttribute("aria-pressed"); }
          self.pinned = id; n.classList.add("is-pinned"); n.setAttribute("aria-pressed", "true");
          self.focus(id);
        }
      });
      n.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && self.pinned) {
          self.nodes[self.pinned].classList.remove("is-pinned"); self.nodes[self.pinned].removeAttribute("aria-pressed");
          self.pinned = null; self.clear();
        }
      });
    });
    this.el.addEventListener("pointerleave", function () { self.clear(); });
    this.el.addEventListener("focusout", function (e) { if (!self.el.contains(e.relatedTarget)) self.clear(); });
  };

  $$("[data-graph]").forEach(function (el) { graphs.push(new Graph(el)); });
  function redrawAll() { graphs.forEach(function (g) { g.draw(); }); }
  var rz;
  window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(redrawAll, 120); });
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(redrawAll, 80); });
    graphs.forEach(function (g) { ro.observe(g.el); });
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(redrawAll);
  window.addEventListener("load", redrawAll);

  /* Dual-Lens toggle */
  $$("[data-lens-toggle]").forEach(function (group) {
    var dl = $(".dl", group.closest(".dl-panel"));
    var chips = $$("[data-lens]", group);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        if (dl) dl.setAttribute("data-lens-mode", chip.getAttribute("data-lens"));
        announce(chip.textContent.trim() + " shown.");
      });
    });
  });

  /* Technology environment: architecture / attack path, layer details */
  $$("[data-env]").forEach(function (env) {
    var chips = $$("[data-env-mode]", env);
    var canvas = $("[data-graph]", env);
    var graph = graphs.filter(function (g) { return g.el === canvas; })[0];
    var side = $(".env__side", env);
    var def = $(".env__default", side), nodeBox = $(".env__node", side);
    function showDefault() { def.hidden = false; nodeBox.hidden = true; }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var mode = chip.getAttribute("data-env-mode");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        env.classList.toggle("is-path", mode === "path");
        if (graph) {
          if (graph.pinned && graph.nodes[graph.pinned]) { graph.nodes[graph.pinned].classList.remove("is-pinned"); graph.nodes[graph.pinned].removeAttribute("aria-pressed"); }
          graph.pinned = null; graph.el.classList.remove("is-focus");
          Object.keys(graph.nodes).forEach(function (k) { graph.nodes[k].classList.remove("is-hot"); });
        }
        showDefault();
        announce(mode === "path" ? "Example attack path highlighted." : "Architecture view.");
      });
    });
    if (canvas) canvas.addEventListener("graph:select", function (e) {
      var n = e.detail.node;
      if (env.classList.contains("is-path") && !n) { showDefault(); return; }
      if (!n) { if (!graph || !graph.pinned) showDefault(); return; }
      $("[data-env-kind]", nodeBox).textContent = env.classList.contains("is-path") && n.hasAttribute("data-step") ? "On the example path" : "Layer";
      $("[data-env-title]", nodeBox).textContent = n.getAttribute("data-title");
      $("[data-env-test]", nodeBox).textContent = n.getAttribute("data-test");
      $("[data-env-attack]", nodeBox).textContent = n.getAttribute("data-attack");
      def.hidden = true; nodeBox.hidden = false;
    });
  });

  /* ------------------------------------------------- Reveal and count-up */
  function countUp(el) {
    var to = Number(el.getAttribute("data-countup"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (!to || reduceMotion) return;
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  function onVisible(el) {
    $$("[data-countup]", el).forEach(countUp);
    if (el.hasAttribute("data-countup")) countUp(el);
  }
  var revealEls = $$("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var vh = window.innerHeight;
    var groups = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var i = groups.get(parent) || 0;
      groups.set(parent, i + 1);
      if (i) el.style.setProperty("--rd", (Math.min(i, 5) * 0.07).toFixed(2) + "s");
      if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add("reveal-pending");
      else { el.classList.add("is-visible"); onVisible(el); }
    });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove("reveal-pending");
        en.target.classList.add("is-visible");
        rio.unobserve(en.target);
        onVisible(en.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { if (el.classList.contains("reveal-pending")) rio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* --------------------------------------------- Filters and tool search */
  $$("[data-filter-list]").forEach(function (list) {
    var key = list.getAttribute("data-filter-list");
    var items = Array.prototype.slice.call(list.children).filter(function (el) { return el.hasAttribute("data-category"); });
    var chips = $$('[data-filter-group="' + key + '"] [data-filter]');
    var search = $('[data-filter-search="' + key + '"]');
    var status = $('[data-filter-status="' + key + '"]');
    var empty = $('[data-filter-empty="' + key + '"]');
    var reset = $('[data-filter-reset="' + key + '"]');
    var nouns = { tools: ["tool", "tools"] };
    var noun = nouns[key] || ["item", "items"];
    var category = "all";
    var limit = Number(list.getAttribute("data-filter-limit")) || 0;
    var moreBox = $('[data-filter-more="' + key + '"]');
    var moreBtn = moreBox ? $("button", moreBox) : null;
    var expanded = false;
    var index = items.map(function (el) {
      return (el.textContent + " " + (el.getAttribute("data-keywords") || "")).toLowerCase().replace(/\s+/g, " ");
    });
    function chipLabel(cat) {
      var chip = chips.filter(function (c) { return c.getAttribute("data-filter") === cat; })[0];
      return chip ? chip.firstChild.textContent.trim() : "";
    }
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var terms = q ? q.split(/\s+/) : [];
      var shown = 0;
      var limited = limit && !expanded && category === "all" && !q;
      items.forEach(function (el, i) {
        var cats = (el.getAttribute("data-category") || "").split(/\s+/);
        var inCat = category === "all" || cats.indexOf(category) !== -1;
        var inText = terms.every(function (t) { return index[i].indexOf(t) !== -1; });
        el.hidden = !(inCat && inText) || (limited && shown >= limit);
        if (!el.hidden) shown += 1;
      });
      if (moreBox) moreBox.hidden = !limited;
      if (empty) empty.hidden = shown !== 0;
      if (status) {
        var msg;
        if (shown === items.length) msg = "Showing all " + items.length + " " + noun[1] + ".";
        else {
          msg = "Showing " + shown + " of " + items.length + " " + noun[1];
          if (category !== "all") msg += " in " + chipLabel(category);
          if (q) msg += ' matching "' + q + '"';
          msg += ".";
        }
        status.textContent = msg;
      }
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        category = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        apply();
      });
    });
    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        expanded = true;
        apply();
        var next = items[limit] && $("a, h3", items[limit]);
        if (next) { next.setAttribute("tabindex", next.tagName === "A" ? "0" : "-1"); next.focus(); }
      });
    }
    if (search) {
      var t;
      search.addEventListener("input", function () { clearTimeout(t); t = setTimeout(apply, 120); });
      search.addEventListener("keydown", function (e) { if (e.key === "Escape") { search.value = ""; apply(); } });
    }
    if (reset) {
      reset.addEventListener("click", function () {
        if (search) search.value = "";
        var all = chips.filter(function (c) { return c.getAttribute("data-filter") === "all"; })[0];
        if (all) all.click(); else apply();
        (search || all || list).focus();
      });
    }
    apply();
  });

  /* ----------------------------------------------------------- Copy email */
  $$("[data-copy]").forEach(function (btn) {
    if (!navigator.clipboard || !window.isSecureContext) return;
    btn.hidden = false;
    var use = $("use", btn);
    var base = use ? use.getAttribute("href").split("#")[0] : "";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
        btn.classList.add("is-done");
        if (use) use.setAttribute("href", base + "#i-check");
        announce("Email address copied to the clipboard.");
        setTimeout(function () {
          btn.classList.remove("is-done");
          if (use) use.setAttribute("href", base + "#i-copy");
        }, 2200);
      }, function () {
        announce("Copying failed. The address is " + btn.getAttribute("data-copy") + ".");
      });
    });
  });

  /* --------------------------------------------------------- Contact form */
  var form = $("#contact-form");
  if (form) {
    form.noValidate = true;
    var loadedAt = Date.now();
    var warnedFast = false;
    var submit = $("[data-submit]", form);
    var statusEl = $("[data-form-status]", form);
    var subject = $('input[name="_subject"]', form);
    var honeypot = $('input[name="_gotcha"]', form);
    var counter = $("[data-count]", form);
    var message = $("#f-message");
    var emailRe = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
    var fields = [
      { el: $("#f-name"), err: $("#f-name-err"), ok: function (v) { return v.length >= 2; } },
      { el: $("#f-email"), err: $("#f-email-err"), ok: function (v) { return emailRe.test(v); } },
      { el: $("#f-topic"), err: $("#f-topic-err"), ok: function (v) { return v.length > 0; } },
      { el: message, err: $("#f-message-err"), ok: function (v) { return v.length >= 20 && v.length <= 4000; } },
      { el: $("#f-consent"), err: $("#f-consent-err"), ok: function () { return $("#f-consent").checked; } }
    ].filter(function (f) { return f.el && f.err; });
    var valueOf = function (el) { return el.type === "checkbox" ? String(el.checked) : el.value.trim(); };
    function check(f) {
      var good = f.ok(valueOf(f.el));
      f.el.setAttribute("aria-invalid", String(!good));
      f.err.hidden = good;
      return good;
    }
    fields.forEach(function (f) {
      var evt = f.el.type === "checkbox" || f.el.tagName === "SELECT" ? "change" : "input";
      f.el.addEventListener(evt, function () { if (f.el.getAttribute("aria-invalid") === "true") check(f); });
      f.el.addEventListener("blur", function () { if (valueOf(f.el) && f.el.type !== "checkbox") check(f); });
    });
    if (message && counter) {
      var updateCount = function () { counter.textContent = message.value.length.toLocaleString("en-GB"); };
      message.addEventListener("input", updateCount);
      updateCount();
    }
    function setStatus(kind, parts) {
      statusEl.className = "form__status" + (kind ? " is-" + kind : "");
      statusEl.textContent = "";
      (parts || []).forEach(function (p) {
        if (typeof p === "string") statusEl.appendChild(doc.createTextNode(p));
        else statusEl.appendChild(p);
      });
    }
    function mailtoLink(text) {
      var a = doc.createElement("a");
      var body = (message ? message.value.trim() : "").slice(0, 1500);
      a.href = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(subject ? subject.value : "Portfolio enquiry") + "&body=" + encodeURIComponent(body);
      a.textContent = text;
      return a;
    }
    function lastSent() { try { return Number(window.localStorage.getItem("contact:lastSent")) || 0; } catch (_) { return 0; } }
    function markSent() { try { window.localStorage.setItem("contact:lastSent", String(Date.now())); } catch (_) { /* storage unavailable */ } }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f.el; });
      if (firstBad) { setStatus("error", ["Check the highlighted fields, then send again."]); firstBad.focus(); return; }
      if (honeypot && honeypot.value) { form.reset(); setStatus("success", ["Message sent."]); return; }
      if (!warnedFast && (Date.now() - loadedAt) / 1000 < SITE.formMinSeconds) {
        warnedFast = true;
        setStatus("error", ["That was very quick. Check your message, then select Send message again."]);
        return;
      }
      var since = (Date.now() - lastSent()) / 1000;
      if (since < SITE.formCooldownSeconds) {
        setStatus("error", ["You sent a message less than a minute ago. Wait " + Math.ceil(SITE.formCooldownSeconds - since) + " seconds before sending another."]);
        return;
      }
      var name = $("#f-name").value.trim();
      var topic = $("#f-topic").value;
      if (subject) subject.value = "Portfolio enquiry: " + topic + " from " + name;
      var original = submit.textContent;
      submit.disabled = true;
      submit.textContent = "Sending…";
      setStatus("", []);
      form.setAttribute("aria-busy", "true");
      var controller = "AbortController" in window ? new AbortController() : null;
      var timer = controller ? setTimeout(function () { controller.abort(); }, SITE.formTimeoutMs) : null;
      fetch(form.action, {
        method: "POST", body: new FormData(form), headers: { Accept: "application/json" },
        signal: controller ? controller.signal : undefined
      }).then(function (res) {
        if (res.ok) {
          var email = $("#f-email").value.trim();
          form.reset();
          if (counter) counter.textContent = "0";
          markSent();
          setStatus("success", ["Message sent. I'll reply to " + email + " as soon as I can."]);
          statusEl.setAttribute("tabindex", "-1");
          statusEl.focus();
          return;
        }
        return res.json().catch(function () { return null; }).then(function (data) {
          var detail = data && Array.isArray(data.errors) ? data.errors.map(function (x) { return x.message; }).join(" ") : "";
          setStatus("error", [(detail ? detail + " " : "The message wasn't sent. ") + "Try again, or ", mailtoLink("email me directly"), "."]);
        });
      }).catch(function (err) {
        var why = err && err.name === "AbortError" ? "The request timed out." : "The connection failed.";
        setStatus("error", [why + " Your message wasn't sent. Check your connection and try again, or ", mailtoLink("email me directly"), "."]);
      }).then(function () {
        if (timer) clearTimeout(timer);
        submit.disabled = false;
        submit.textContent = original;
        form.removeAttribute("aria-busy");
      });
    });
  }

  /* ------------------------------------------------------ CV PDF viewer
     Browsers with a built-in PDF reader get the real document embedded
     (zoom, search, print). Others keep the page images rendered from it. */
  $$("[data-pdf-stage]").forEach(function (stage) {
    var src = stage.getAttribute("data-pdf-src");
    var canEmbed = navigator.pdfViewerEnabled === true && window.matchMedia("(min-width: 900px)").matches;
    if (!src || !canEmbed) return;
    var done = false;
    function embed() {
      if (done) return;
      done = true;
      var frame = doc.createElement("iframe");
      frame.className = "pdfview__frame";
      frame.src = src + "#view=FitH&navpanes=0";
      frame.title = stage.getAttribute("data-pdf-title") || "PDF document";
      frame.setAttribute("loading", "lazy");
      var pages = $(".pdfview__pages", stage);
      if (pages) pages.hidden = true;
      stage.appendChild(frame);
    }
    var panel = stage.closest("[data-tab-panel]");
    if (panel && panel.hidden) panel.addEventListener("tab:shown", embed);
    else embed();
  });

  /* ------------------------------------------- Case-study table of contents */
  var tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var caseSections = tocLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    caseSections.forEach(function (s) { tio.observe(s); });
  }

  /* --------------------------------------------------------------- Misc */
  $$("[data-print]").forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () { window.print(); });
  });
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
