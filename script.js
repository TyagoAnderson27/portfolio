(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nome = PERFIL.nome;
  const zap = String(PERFIL.whatsapp || "").replace(/\D/g, "");
  const msg = encodeURIComponent("Olá, " + nome.split(" ")[0] + "! Vi seu portfólio e gostaria de conversar.");
  const zapLink = zap ? "https://wa.me/" + zap + "?text=" + msg : "";

  // Nome, rodapé e título
  $("#marca").textContent = nome.toLowerCase().replace(/\s+/g, "_");
  $("#pNome").textContent = nome;
  $("#rodape").textContent = nome + ". Portfólio feito à mão com HTML, CSS e JavaScript.";
  document.title = nome + " | Técnico em mecatrônica e desenvolvedor de sistemas";

  // Botões de contato (o que não estiver preenchido é ocultado)
  const cZap = $("#cZap"); if (zapLink) cZap.href = zapLink; else cZap.hidden = true;
  const cEmail = $("#cEmail"); if (PERFIL.email) cEmail.href = "mailto:" + PERFIL.email; else cEmail.hidden = true;
  const cGit = $("#cGit"); if (PERFIL.github) cGit.href = PERFIL.github; else cGit.hidden = true;
  const cLin = $("#cLin"); if (PERFIL.linkedin) cLin.href = PERFIL.linkedin; else cLin.hidden = true;

  // Projetos
  const box = $("#listaProjetos");
  if (!PROJETOS.length) {
    box.innerHTML = '<div class="vazio"><p>Os primeiros projetos entram aqui em breve.</p>' +
      (PERFIL.github ? '<p>Enquanto isso, o código está no <a href="' + esc(PERFIL.github) + '" target="_blank" rel="noopener">GitHub</a>.</p>' : "") + "</div>";
  } else {
    box.dataset.qtd = PROJETOS.length;
    box.innerHTML = PROJETOS.map((p) => {
      const links = (p.site ? '<a href="' + esc(p.site) + '" target="_blank" rel="noopener">Ver projeto no ar</a>' : "") +
        (p.codigo ? '<a href="' + esc(p.codigo) + '" target="_blank" rel="noopener">Ver código</a>' : "");
      return '<article class="projeto">' +
        (p.imagem ? '<img src="' + esc(p.imagem) + '" alt="Captura de tela do projeto ' + esc(p.titulo) + '" loading="lazy">' : "") +
        '<div class="projeto-corpo"><h3>' + esc(p.titulo) + "</h3><p>" + esc(p.resumo) + "</p>" +
        (p.tecnologias && p.tecnologias.length ? '<p class="tec">' + p.tecnologias.map(esc).join(", ") + "</p>" : "") +
        (links ? '<div class="links">' + links + "</div>" : "") + "</div></article>";
    }).join("");
    box.querySelectorAll(".projeto img").forEach((img) => img.addEventListener("error", () => img.remove()));
  }

  // Luz de status
  if (PERFIL.disponivel) {
    $("#lampadaTxt").textContent = "Aberto a oportunidades";
    setTimeout(() => $("#lampada").classList.add("acesa"), 500);
  }

  // Quadros: abrem ao clicar e fecham ao clicar de novo, em "Fechar" ou com Esc
  const pilulas = Array.from(document.querySelectorAll(".pilula[data-painel]"));
  const quadros = Array.from(document.querySelectorAll(".quadro"));
  function fechar(devolverFoco) {
    quadros.forEach((q) => { q.hidden = true; q.classList.remove("abrindo"); });
    pilulas.forEach((p) => p.setAttribute("aria-expanded", "false"));
    $("#dica").hidden = false;
    history.replaceState(null, "", location.pathname + location.search);
    if (devolverFoco) devolverFoco.focus();
  }
  function abrir(id, rolar) {
    const q = $("#painel-" + id), p = pilulas.find((x) => x.dataset.painel === id);
    if (!q || !p) return;
    quadros.forEach((x) => { x.hidden = x !== q; x.classList.remove("abrindo"); });
    pilulas.forEach((x) => x.setAttribute("aria-expanded", String(x === p)));
    $("#dica").hidden = true;
    q.classList.add("abrindo");
    history.replaceState(null, "", "#" + id);
    if (rolar) q.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "nearest" });
    q.focus({ preventScroll: true });
  }
  pilulas.forEach((p) => p.addEventListener("click", () => {
    if (p.getAttribute("aria-expanded") === "true") fechar(p); else abrir(p.dataset.painel, true);
  }));
  document.querySelectorAll(".fechar").forEach((b) => b.addEventListener("click", () => {
    const q = b.closest(".quadro");
    fechar(pilulas.find((x) => "painel-" + x.dataset.painel === q.id));
  }));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const aberto = quadros.find((q) => !q.hidden);
    if (aberto) fechar(pilulas.find((x) => "painel-" + x.dataset.painel === aberto.id));
  });
  if (location.hash && $("#painel-" + location.hash.slice(1))) abrir(location.hash.slice(1), false);

  // Chuva de código (fundo). Em "reduzir movimento" fica um quadro parado.
  const cv = $("#chuva"), ctx = cv.getContext("2d");
  const letras = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789".split("");
  const TAM = 16;
  let colunas = [], timer = null;
  function medir() {
    cv.width = innerWidth; cv.height = innerHeight;
    const n = Math.ceil(cv.width / TAM);
    colunas = Array.from({ length: n }, () => Math.floor(Math.random() * -(cv.height / TAM)));
    ctx.fillStyle = "#030d08"; ctx.fillRect(0, 0, cv.width, cv.height);
  }
  function quadro() {
    ctx.fillStyle = "rgba(3, 13, 8, .09)"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = TAM + "px monospace";
    for (let i = 0; i < colunas.length; i++) {
      const y = colunas[i] * TAM;
      if (y > 0) {
        ctx.fillStyle = Math.random() > .97 ? "#c9ffe0" : "#1f9a58";
        ctx.fillText(letras[Math.floor(Math.random() * letras.length)], i * TAM, y);
      }
      if (y > cv.height && Math.random() > .975) colunas[i] = 0;
      colunas[i]++;
    }
  }
  function iniciarChuva() {
    medir();
    if (reduz) { for (let k = 0; k < 140; k++) quadro(); return; }
    clearInterval(timer); timer = setInterval(quadro, 60);
  }
  document.addEventListener("visibilitychange", () => {
    if (reduz) return;
    if (document.hidden) { clearInterval(timer); timer = null; } else if (!timer) timer = setInterval(quadro, 60);
  });
  let redim; window.addEventListener("resize", () => { clearTimeout(redim); redim = setTimeout(iniciarChuva, 200); });
  iniciarChuva();
})();