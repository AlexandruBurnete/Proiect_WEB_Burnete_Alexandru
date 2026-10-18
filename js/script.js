/* =========================================================

/* Escapare text pentru innerHTML (previne injectarea de HTML) */
const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- 1. Meniu hamburger ---------- */
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  if (!hamburger || !navMenu) return;

  const setOpen = open => {
    hamburger.classList.toggle("active", open);
    navMenu.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Închide meniul" : "Deschide meniul");
  };

  hamburger.addEventListener("click", () => setOpen(!navMenu.classList.contains("active")));
  navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- 2. Animații la scroll (IntersectionObserver) ---------- */
let revealObserver = null;

function initReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    return;
  }
  revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

function observeReveal(el) {
  if (revealObserver) revealObserver.observe(el);
  else el.classList.add("visible");
}

/* ---------- 3. Formular de contact cu validare ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const rules = {
    name: v => /^[\p{L} ]{2,}$/u.test(v) || "Numele trebuie să aibă minim 2 caractere: doar litere și spații.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Introdu o adresă de email validă, de exemplu nume@domeniu.ro.",
    phone: v => v === "" || /^[0-9 \-()+]+$/.test(v) || "Telefonul poate conține doar cifre, spații, - și parantezele ( ).",
    message: v => (v.length >= 10 && v.length <= 1000) || "Mesajul trebuie să aibă între 10 și 1000 de caractere."
  };

  const counter = document.getElementById("counter");
  const success = document.getElementById("formSuccess");

  function validateField(name) {
    const input = form.elements[name];
    const result = rules[name](input.value.trim());
    const field = input.closest(".field");
    document.getElementById(`${name}-error`).textContent = result === true ? "" : result;
    field.classList.toggle("invalid", result !== true);
    field.classList.toggle("valid", result === true && input.value.trim() !== "");
    input.setAttribute("aria-invalid", String(result !== true));
    return result === true;
  }

  Object.keys(rules).forEach(name => {
    form.elements[name].addEventListener("input", () => { success.hidden = true; validateField(name); });
    form.elements[name].addEventListener("blur", () => validateField(name));
  });

  form.elements.message.addEventListener("input", e => {
    const n = e.target.value.length;
    counter.textContent = `${n} / 1000`;
    counter.classList.toggle("over", n > 1000);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const results = Object.keys(rules).map(validateField);   // validează toate câmpurile
    if (results.every(Boolean)) {
      success.hidden = false;
      form.reset();
      counter.textContent = "0 / 1000";
      form.querySelectorAll(".field").forEach(f => f.classList.remove("valid", "invalid"));
    } else {
      form.querySelector(".invalid input, .invalid textarea")?.focus();
    }
  });
}

/* ---------- 4. Proiecte GitHub: încărcare, filtrare, sortare, Load More ---------- */
function initProjects() {
  const projectsEl = document.getElementById("projects");
  if (!projectsEl) return;

const API_URL =
  "https://api.github.com/users/AlexandruBurnete/repos?per_page=100&sort=updated";  const itemsPerPage = 6;
  const statusEl = document.getElementById("status");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const filtersEl = document.getElementById("filters");
  const loadMoreContainer = document.getElementById("load-more-container");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  let allRepos = [];
  let activeLanguage = "all";
  let currentPage = 1;

  function showLoading() {
    statusEl.innerHTML = `<div class="loading" aria-hidden="true"></div><div>Se încarcă proiectele din GitHub...</div>`;
    loadMoreContainer.hidden = true;
  }

  function showError(message) {
    statusEl.innerHTML = `
      <div style="color:var(--danger);padding:12px 0">
        <p>⚠️ ${esc(message)}</p>
        <button class="btn secondary" type="button" id="retryBtn">Încearcă din nou</button>
      </div>`;
    document.getElementById("retryBtn").addEventListener("click", loadRepos);
  }

  function renderFilters() {
    const languages = ["all", ...new Set(allRepos.map(r => r.language).filter(Boolean))];
    filtersEl.innerHTML = languages.map(lang => `
      <button type="button" class="${lang === activeLanguage ? "active" : ""}" data-lang="${esc(lang)}"
              aria-pressed="${lang === activeLanguage}">
        ${lang === "all" ? "Toate" : esc(lang)}
      </button>`).join("");
  }

  filtersEl.addEventListener("click", e => {
    const btn = e.target.closest("button[data-lang]");
    if (!btn) return;
    activeLanguage = btn.dataset.lang;
    currentPage = 1;
    renderFilters();          // butoanele se refac din TOATE repo-urile, deci nu dispar
    renderProjects();
  });

  function getFilteredRepos() {
    const q = searchInput.value.toLowerCase().trim();
    let repos = allRepos.filter(r => !r.fork);

    if (activeLanguage !== "all") repos = repos.filter(r => r.language === activeLanguage);
    if (q) {
      repos = repos.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q));
    }
    repos.sort(sortSelect.value === "stars"
      ? (a, b) => b.stargazers_count - a.stargazers_count
      : (a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return repos;
  }

  function renderProjects() {
    const repos = getFilteredRepos();
    const visible = repos.slice(0, itemsPerPage * currentPage);

    if (!repos.length) {
      projectsEl.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">
        Niciun proiect nu corespunde filtrelor. Șterge căutarea sau alege „Toate”.</p>`;
      loadMoreContainer.hidden = true;
      return;
    }

    projectsEl.innerHTML = visible.map(repo => {
      const desc = repo.description || "Fără descriere disponibilă";
      const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString("ro-RO") : "";
      return `
        <article class="project-card reveal">
          <div class="card-top">
            <h3>${esc(repo.name)}</h3>
            <span class="updated">${esc(updated)}</span>
          </div>
          <p>${esc(desc)}</p>
          <div class="meta">
            <span class="badge">💻 ${esc(repo.language || "Nespecificat")}</span>
            <span class="badge">⭐ ${repo.stargazers_count ?? 0}</span>
            <span class="badge">🍴 ${repo.forks_count ?? 0}</span>
          </div>
          <div class="card-actions">
            <a href="${esc(repo.html_url)}" target="_blank" rel="noopener noreferrer">Vezi codul</a>
            ${repo.homepage ? `<a class="ghost" href="${esc(repo.homepage)}" target="_blank" rel="noopener noreferrer">Demo</a>` : ""}
          </div>
        </article>`;
    }).join("");

    projectsEl.querySelectorAll(".reveal").forEach(observeReveal);
    loadMoreContainer.hidden = visible.length >= repos.length;
  }

  async function loadRepos() {
    showLoading();
    try {
      const response = await fetch(API_URL);
      if (response.status === 404) throw new Error("Utilizatorul GitHub nu a fost găsit.");
      if (response.status === 403 || response.status === 429) throw new Error("Limita de cereri către GitHub a fost atinsă. Încearcă mai târziu.");
      if (!response.ok) throw new Error(`Serverul a răspuns cu eroarea ${response.status}.`);

      const repos = await response.json();
      if (!Array.isArray(repos)) throw new Error("Răspuns neașteptat de la server.");

      allRepos = repos;
      statusEl.textContent = `${repos.filter(r => !r.fork).length} proiecte încărcate din GitHub.`;
      renderFilters();
      renderProjects();
    } catch (error) {
      console.error(error);
      projectsEl.innerHTML = "";
      filtersEl.innerHTML = "";
      const msg = error instanceof TypeError
        ? "Nu m-am putut conecta. Verifică conexiunea la internet și că serverul rulează."
        : error.message;
      showError(`Ups! Nu am putut încărca proiectele. ${msg}`);
    }
  }

  loadMoreBtn.addEventListener("click", () => { currentPage++; renderProjects(); });
  searchInput.addEventListener("input", () => { currentPage = 1; renderProjects(); });
  sortSelect.addEventListener("change", () => { currentPage = 1; renderProjects(); });

  loadRepos();
}

/* ---------- Pornire ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initReveal();
  initContactForm();
  initProjects();
});
