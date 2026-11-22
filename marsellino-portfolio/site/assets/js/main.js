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

  /* ---------------------------------------------------------------- Header */
  var header = $(".site-header");
  var toTop = $(".to-top");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var skip = $(".brand");
      if (skip) skip.focus({ preventScroll: true });
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
      if (open) {
        var first = $("a", menu);
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };
    toggle.setAttribute("aria-label", "Open section menu");
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true", false);
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false, false); });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    // Keep keyboard focus inside the open menu (header controls + menu links)
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
  }

  /* ------------------------------------------- Active section in the nav */
  var navLinks = $$(".site-nav__list a[data-nav]");
  var sections = $$("[data-nav-section]");
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
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
     Markup: a container with [data-tablist] and sibling/descendant [data-tab-panel data-tab-label].
     Buttons are generated here so the page shows every panel when JS is off. */
  $$("[data-tabs], [data-lens]").forEach(function (box, boxIndex) {
    var list = $("[data-tablist]", box);
    var panels = $$("[data-tab-panel]", box);
    if (!list || !panels.length) return;
    var isLens = box.hasAttribute("data-lens");
    var tabs = panels.map(function (panel, i) {
      var id = panel.id || ("panel-" + boxIndex + "-" + i);
      panel.id = id;
      var tab = doc.createElement("button");
      tab.type = "button";
      tab.id = id + "-tab";
      tab.className = isLens ? "lens__tab" : "lifecycle__tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", id);
      if (!isLens) {
        var n = doc.createElement("span");
        n.className = "lifecycle__n";
        n.textContent = String(i + 1).padStart(2, "0");
        tab.appendChild(n);
      }
      tab.appendChild(doc.createTextNode(panel.getAttribute("data-tab-label")));
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
        panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus({ preventScroll: true });
      // keep the selected tab visible inside a horizontally scrolling strip, without moving the page
      if (list.scrollWidth > list.clientWidth) {
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
        var horizontal = isLens || window.matchMedia("(max-width: 959px)").matches;
        if (e.key === (horizontal ? "ArrowRight" : "ArrowDown")) next = (i + 1) % tabs.length;
        if (e.key === (horizontal ? "ArrowLeft" : "ArrowUp")) next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });

    var fromHash = panels.findIndex(function (p) { return location.hash === "#" + p.id; });
    select(fromHash >= 0 ? fromHash : 0, false);
  });

  /* --------------------------------------------- Filters and tool search */
  $$("[data-filter-list]").forEach(function (list) {
    var key = list.getAttribute("data-filter-list");
    var items = Array.prototype.slice.call(list.children).filter(function (el) { return el.hasAttribute("data-category"); });
    var chips = $$('[data-filter-group="' + key + '"] [data-filter]');
    var search = $('[data-filter-search="' + key + '"]');
    var status = $('[data-filter-status="' + key + '"]');
    var empty = $('[data-filter-empty="' + key + '"]');
    var reset = $('[data-filter-reset="' + key + '"]');
    var nouns = { tools: ["tool", "tools"], projects: ["project", "projects"], creds: ["credential", "credentials"], timeline: ["entry", "entries"] };
    var noun = nouns[key] || ["item", "items"];
    var category = "all";
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
      items.forEach(function (el, i) {
        var cats = (el.getAttribute("data-category") || "").split(/\s+/);
        var inCat = category === "all" || cats.indexOf(category) !== -1;
        var inText = terms.every(function (t) { return index[i].indexOf(t) !== -1; });
        el.hidden = !(inCat && inText);
        if (!el.hidden) shown += 1;
      });
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
    if (!navigator.clipboard || !window.isSecureContext) return; // leave hidden where unsupported
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
    form.noValidate = true; // JS validation replaces the browser's; without JS the browser validates
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
    function lastSent() {
      try { return Number(window.localStorage.getItem("contact:lastSent")) || 0; } catch (_) { return 0; }
    }
    function markSent() {
      try { window.localStorage.setItem("contact:lastSent", String(Date.now())); } catch (_) { /* storage unavailable */ }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f.el; });
      if (firstBad) {
        setStatus("error", ["Check the highlighted fields, then send again."]);
        firstBad.focus();
        return;
      }

      // Spam protection: honeypot (silently accept), timing, cooldown
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
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
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
