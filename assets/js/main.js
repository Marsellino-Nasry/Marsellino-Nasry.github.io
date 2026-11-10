/* SARM Security | Marsellino Nasry Mounir
   Progressive enhancement only: the page is fully readable without JavaScript. */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Header state ---------- */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  const toggle = $(".nav-toggle");
  const menu = $("#site-menu");
  const toggleLabel = toggle ? $(".visually-hidden", toggle) : null;
  const toggleIcon = toggle ? $("use", toggle) : null;

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    if (toggleLabel) toggleLabel.textContent = open ? "Close menu" : "Open menu";
    if (toggleIcon) toggleIcon.setAttribute("href", open ? "#i-close" : "#i-menu");
    if (open) {
      const first = $("a", menu);
      if (first) first.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    // Close the overlay if the viewport grows past the mobile breakpoint
    window.matchMedia("(min-width: 1081px)").addEventListener("change", (mq) => { if (mq.matches) setMenu(false); });
  }

  /* ---------- Active section in navigation ---------- */
  const navLinks = $$('.site-nav__list a[href^="#"]:not(.btn)');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => {
            if (a.getAttribute("href") === id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Tools: search + category filter ---------- */
  const toolList = $("#tool-list");
  if (toolList) {
    const tools = $$(".tool", toolList);
    const buttons = $$("[data-filter]");
    const search = $("#tool-search");
    const status = $("#tool-status");
    const empty = $("#tool-empty");
    const reset = $("#tool-reset");
    let category = "all";

    const labelFor = (cat) => {
      const btn = buttons.find((b) => b.dataset.filter === cat);
      return btn ? btn.childNodes[0].textContent.trim() : "";
    };

    function apply() {
      const q = (search ? search.value : "").trim().toLowerCase();
      let shown = 0;
      tools.forEach((tool) => {
        const inCat = category === "all" || tool.dataset.category === category;
        const inText = !q || tool.textContent.toLowerCase().includes(q);
        const visible = inCat && inText;
        tool.hidden = !visible;
        if (visible) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) {
        const scope = category === "all" ? "" : " in " + labelFor(category);
        const term = q ? ' matching "' + q + '"' : "";
        status.textContent = shown === tools.length
          ? "Showing all " + tools.length + " tools."
          : "Showing " + shown + " of " + tools.length + " tools" + scope + term + ".";
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        category = btn.dataset.filter;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
    if (reset) {
      reset.addEventListener("click", () => {
        if (search) search.value = "";
        const all = buttons.find((b) => b.dataset.filter === "all");
        if (all) all.click(); else apply();
        if (search) search.focus();
      });
    }
  }

  /* ---------- Projects filter ---------- */
  const projectList = $("#project-list");
  if (projectList) {
    const pButtons = $$("[data-project-filter]");
    const cards = $$(".project", projectList);
    const minis = $$(".mini", projectList);
    const group = $(".project-list", projectList);
    const pEmpty = $("#project-empty");

    const matches = (el, f) => f === "all" || (el.dataset.projectCategory || "").split(" ").includes(f);

    pButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.dataset.projectFilter;
        pButtons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        let visible = 0;
        cards.forEach((c) => { const m = matches(c, f); c.hidden = !m; if (m) visible += 1; });
        let miniVisible = 0;
        minis.forEach((m) => { const ok = matches(m, f); m.hidden = !ok; if (ok) miniVisible += 1; });
        if (group) group.hidden = miniVisible === 0;
        if (pEmpty) pEmpty.hidden = visible + miniVisible !== 0;
      });
    });
  }

  /* ---------- Contact form (Formspree, endpoint unchanged) ---------- */
  const form = $("#contact-form");
  if (form) {
    const submitBtn = $("#submit-btn");
    const statusEl = $("#form-status");
    const fields = {
      email: { input: $("#email"), error: $("#email-error"), test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      message: { input: $("#message"), error: $("#message-error"), test: (v) => v.trim().length > 0 },
    };

    const setStatus = (text, kind) => {
      statusEl.textContent = text;
      statusEl.className = "form__status" + (kind ? " is-" + kind : "");
    };

    function validate() {
      let firstInvalid = null;
      Object.values(fields).forEach(({ input, error, test }) => {
        const ok = test(input.value.trim());
        input.setAttribute("aria-invalid", String(!ok));
        error.hidden = ok;
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      return firstInvalid;
    }

    Object.values(fields).forEach(({ input, error, test }) => {
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true" && test(input.value.trim())) {
          input.setAttribute("aria-invalid", "false");
          error.hidden = true;
        }
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const invalid = validate();
      if (invalid) {
        setStatus("Check the highlighted fields and try again.", "error");
        invalid.focus();
        return;
      }

      const original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setStatus("", "");

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const email = fields.email.input.value.trim();
          form.reset();
          setStatus("Message sent. I'll reply to " + email + " as soon as I can.", "success");
        } else {
          let detail = "";
          try {
            const data = await response.json();
            if (data && Array.isArray(data.errors)) detail = data.errors.map((e) => e.message).join(", ");
          } catch (_) { /* response was not JSON */ }
          setStatus(
            (detail ? detail + ". " : "Your message wasn't sent. ") +
              "Try again, or email me directly at marsellino.nasry@gmail.com.",
            "error"
          );
        }
      } catch (_) {
        setStatus("Your message wasn't sent because the connection failed. Check your connection and try again, or email marsellino.nasry@gmail.com.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    });
  }

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
