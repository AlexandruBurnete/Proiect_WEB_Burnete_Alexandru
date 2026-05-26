console.log("script.js loaded ✅");
const username = "AlexandruBurnete";
const API_URL = `https://api.github.com/users/${username}/repos?per_page=100`;

const projectsEl = document.getElementById("projects");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const filtersEl = document.getElementById("filters");
const loadMoreContainer = document.getElementById("load-more-container");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let allRepos = [];
let activeLanguage = "all";
let currentPage = 1;
const itemsPerPage = 6;

function showLoading() {
  statusEl.innerHTML = `<div class="loading"></div><div>Se încarcă proiectele din GitHub...</div>`;
  if (loadMoreContainer) loadMoreContainer.style.display = "none";
}

function showMessage(message) {
  statusEl.textContent = message;
}

function showError(message) {
  statusEl.innerHTML = `
    <div style="color: var(--danger); text-align: center; padding: 20px;">
      <p>⚠️ ${message}</p>
      <button class="btn secondary" onclick="loadRepos()" style="margin-top: 10px;">Reîncarcă</button>
    </div>
  `;
}

function getFallbackProjects() {
  return [
    {
      name: "Portfolio Web Dynamic",
      description: "Portofoliu personal cu integrare GitHub API.",
      language: "HTML",
      stargazers_count: 5,
      forks_count: 1,
      html_url: "#",
      fork: false,
      updated_at: new Date().toISOString()
    },
    {
      name: "Calculator App",
      description: "Aplicație de calculator realizată cu JavaScript.",
      language: "JavaScript",
      stargazers_count: 2,
      forks_count: 0,
      html_url: "#",
      fork: false,
      updated_at: new Date().toISOString()
    },
    {
      name: "To-Do List",
      description: "Aplicație pentru gestionarea sarcinilor zilnice.",
      language: "JavaScript",
      stargazers_count: 3,
      forks_count: 0,
      html_url: "#",
      fork: false,
      updated_at: new Date().toISOString()
    },
    {
      name: "Weather Dashboard",
      description: "Dashboard meteo cu interfață modernă.",
      language: "CSS",
      stargazers_count: 1,
      forks_count: 0,
      html_url: "#",
      fork: false,
      updated_at: new Date().toISOString()
    },
    {
      name: "Landing Page",
      description: "Pagină responsivă pentru prezentare.",
      language: "HTML",
      stargazers_count: 4,
      forks_count: 0,
      html_url: "#",
      fork: false,
      updated_at: new Date().toISOString()
    }
  ];
}

function renderFilters(repos) {
  const languages = ["all", ...new Set(repos.map(r => r.language).filter(Boolean))];
  filtersEl.innerHTML = languages.map(lang => `
    <button class="${lang === activeLanguage ? "active" : ""}" data-lang="${lang}">
      ${lang === "all" ? "Toate" : lang}
    </button>
  `).join("");

  filtersEl.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeLanguage = btn.dataset.lang;
      currentPage = 1;
      renderFilters(getFilteredRepos());
      renderProjects();
    });
  });
}

function getFilteredRepos() {
  const q = searchInput.value.toLowerCase().trim();
  let repos = [...allRepos];

  repos = repos.filter(repo => !repo.fork);

  if (activeLanguage !== "all") {
    repos = repos.filter(repo => repo.language === activeLanguage);
  }

  if (q) {
    repos = repos.filter(repo =>
      repo.name.toLowerCase().includes(q) ||
(repo.description || "Fără descriere disponibilă").toLowerCase().includes(q)    );
  }

  if (sortSelect.value === "stars") {
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else {
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  return repos;
}

function renderProjects() {
  const repos = getFilteredRepos();
  const end = itemsPerPage * currentPage;
  const visibleRepos = repos.slice(0, end);

  if (!repos.length) {
    projectsEl.innerHTML = `
      <p style="grid-column: 1/-1; text-align:center; color: var(--muted); padding: 40px;">
        Nu am găsit proiecte care să corespundă filtrului selectat.
      </p>`;
    if (loadMoreContainer) loadMoreContainer.style.display = "none";
    return;
  }

  projectsEl.innerHTML = visibleRepos.map(repo => {
    const desc = repo.description || "Fără descriere disponibilă";
    const lang = repo.language || "Nespecificat";
    const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString("ro-RO") : "";

    return `
      <article class="project-card">
        <div class="card-top">
          <h3>${repo.name}</h3>
          <span class="updated">Updated: ${updated}</span>
        </div>

        <p>${desc}</p>

        <div class="meta">
          <span class="badge">💻 ${lang}</span>
          <span class="badge">⭐ ${repo.stargazers_count ?? 0}</span>
          <span class="badge">🍴 ${repo.forks_count ?? 0}</span>
          ${repo.private ? `<span class="badge">🔒 Private</span>` : `<span class="badge">🌍 Public</span>`}
        </div>

        <div class="card-actions">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Vezi codul</a>
          ${repo.homepage ? `<a class="ghost" href="${repo.homepage}" target="_blank" rel="noopener noreferrer">Demo</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  if (loadMoreContainer) {
    loadMoreContainer.style.display = end < repos.length ? "block" : "none";
  }
}

async function loadRepos() {
  try {
    showLoading();

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Eroare API: ${response.status}`);
    }

    const repos = await response.json();
    const githubRepos = repos.filter(repo => !repo.fork);

    if (githubRepos.length < 5) {
      showMessage("Ai prea puține proiecte pe GitHub, așa că afișăm și proiecte locale.");
      allRepos = [...githubRepos, ...getFallbackProjects()];
    } else {
      allRepos = githubRepos;
      showMessage(`S-au încărcat ${githubRepos.length} proiecte din GitHub.`);
    }

    renderFilters(allRepos);
    renderProjects();
  } catch (error) {
    console.error(error);
    showError("Ups! Nu am putut încărca proiectele momentan. Se afișează proiecte locale.");
    allRepos = getFallbackProjects();
    renderFilters(allRepos);
    renderProjects();
  }
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderProjects();
});

sortSelect.addEventListener("change", () => {
  currentPage = 1;
  renderProjects();
});

loadRepos();