# Proiect WEB – GitHub Projects (HTML/CSS/JS + PHP Proxy)

Un site tip portofoliu (CV) care afișează automat proiectele de pe GitHub, cu căutare, sortare și filtrare după limbaj.  
Pentru a evita limitările din browser (CORS / rate limit), proiectele sunt încărcate printr-un mic **proxy PHP** (`repos.php`) care apelează GitHub API folosind un token stocat local.

## Funcționalități
- Layout modern (Hero + secțiuni info)
- Listare proiecte GitHub (dinamic)
- Căutare după nume / descriere
- Sortare:
  - cele mai recente (updated)
  - cele mai apreciate (stars)
- Filtrare după limbaj (ex: JavaScript, HTML etc.)
- Buton „Load More”
- Posibilitate de a ascunde repo-uri (listă `HIDE_REPOS`)
- Proiecte demo/inventate (fallback) adăugate în listă

## Tehnologii folosite
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **PHP (cURL)** – pentru proxy către GitHub API
- **GitHub REST API**

---

## Structura proiectului (recomandată)
```text
Proiect_Burnete_Alexandru/
  proiect.html
  proiect.css
  proiect.js
  repos.php
  api/
    config.php       
  profil/
    poza_Burnete_Alexandru.jpg
```

---

## Rulare locală (XAMPP)
### 1) Pune proiectul în `htdocs`
Copiază folderul proiectului în:
`C:\xampp\htdocs\Proiect_Burnete_Alexandru\`

Pornește **Apache** din XAMPP.

### 2) Configurează token-ul GitHub (local)
Creează fișierul:
`api/config.php`

Conținut:
```php
<?php
define('GITHUB_TOKEN', 'TOKEN_UL_TAU_AICI');
```

> Nu pune token-ul în HTML/JS și nu îl publica.

### 3) Deschide proiectul în browser
Accesează:
`http://localhost/Proiect_Burnete_Alexandru/proiect.html`

### 4) Test proxy (opțional)
`http://localhost/Proiect_Burnete_Alexandru/repos.php?username=AlexandruBurnete`

Dacă totul este OK, trebuie să primești o listă JSON cu repo-urile tale.

---

## Securitate (IMPORTANT)
Token-ul GitHub trebuie să rămână privat.

Adaugă în `.gitignore`:
```gitignore
api/config.php
```

Dacă ai postat token-ul în mod accidental, revocă-l imediat din GitHub și creează unul nou.

---

## Personalizare
### Schimbă utilizatorul GitHub
În `proiect.js`:
```js
const username = "AlexandruBurnete";
```

### Ascunde repo-uri din listă
În `proiect.js`:
```js
const HIDE_REPOS = new Set([
  "Proiect_WEB_Burnete_Alexandru",
  "labwork02",
]);
```

### Proiecte demo/inventate
În `proiect.js`, editează `getFallbackProjects()` pentru a adăuga/edita proiectele demo.

---

## Troubleshooting
### 1) Pagina nu afișează proiecte
- verifică să rulezi pagina prin `http://localhost/...`, nu prin `file://`
- verifică în DevTools → Network (Fetch/XHR) request-ul către `repos.php`
- verifică dacă `repos.php?username=...` returnează JSON

### 2) Eroare PHP `curl_init() undefined`
Activează cURL în `php.ini`:
- găsește `;extension=curl`
- scoate `;` → `extension=curl`
- restart Apache

---

## Autor
- **Alexandru Burnete**
- GitHub: https://github.com/AlexandruBurnete
