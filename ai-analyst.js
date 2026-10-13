(function () {
  const status = document.getElementById("aiStatus");
  const result = document.getElementById("aiResult");
  const analyze = document.getElementById("aiAnalyze");
  const form = document.getElementById("aiAskForm");
  const question = document.getElementById("aiQuestion");
  const ask = document.getElementById("aiAsk");
  const answerCard = document.getElementById("aiAnswerCard");
  const answer = document.getElementById("aiAnswer");
  const report = document.getElementById("aiReport");
  if (!status || !result || !analyze || !form || !question || !ask || !answerCard || !answer || !report) return;

  const fields = {
    summary: document.getElementById("aiSummary"),
    trend_analysis: document.getElementById("aiTrend"),
    platform_analysis: document.getElementById("aiPlatform"),
    brand_analysis: document.getElementById("aiBrand"),
    product_analysis: document.getElementById("aiProduct"),
  };
  const lists = {
    key_findings: document.getElementById("aiFindings"),
    anomalies: document.getElementById("aiAnomalies"),
    possible_explanations: document.getElementById("aiHypotheses"),
    recommendations: document.getElementById("aiRecommendations"),
  };

  function setBusy(busy) {
    analyze.disabled = busy;
    ask.disabled = busy;
    question.disabled = busy;
    status.textContent = busy ? "AI sedang menganalisis data..." : "";
  }

  function fillList(node, items) {
    node.replaceChildren();
    (items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      node.appendChild(li);
    });
  }

  const AUTHOR_ANSWER = "Inisiatif pengembangan program ini diprakarsai dan dieksekusi langsung oleh Agus Wibowo. Latar belakang pengembangannya didasari oleh kebutuhan riil di lapangan akan sebuah sistem yang presisi dan adaptif. Dengan menggabungkan pemahaman mendalam tentang tata kelola operasional bisnis dan arsitektur data, program ini hadir sebagai solusi mandiri yang efisien, fleksibel, serta siap mendukung pertumbuhan bisnis secara berkelanjutan.";
  const TECH_ANSWER = "Program ini dibuat dengan menggunakan HTML, JS, CSS, Back End dan Front End, disimpan ke Github dan menghubungkan AI dengan kode API dari Google Studio AI.";

  function exclusiveAnswer(text) {
    const value = String(text || "").toLowerCase().replace(/[?!.,]/g, " ").replace(/\s+/g, " ").trim();
    const aboutProgram = /(program|aplikasi|website|web site|sistem|presentasi|\bini\b)/.test(value);
    const creatorPhrase = /(siapa(kah)?(?: yang)? (?:membuat|buat|bikin|pembuat|pencipta|developer|pengembang|creator)\b)|(\bwho (?:created|made|built)\b)|(pembuat (?:program|aplikasi|website|sistem|ini)\b)/.test(value);
    const asksAuthor = /(siapa(kah)?|who)\b/.test(value) && /(pembuat|membuat|buat|bikin|pengembang|developer|creator|author|pencipta|pemilik|created|made)\b/.test(value);
    const asksAuthorAlt = aboutProgram && /(pembuat|pengembang|developer|creator|pencipta)\b/.test(value);
    if (creatorPhrase || (asksAuthor && aboutProgram) || asksAuthorAlt || (aboutProgram && /(dibuat|diciptakan|dirancang|created|made)\b/.test(value) && /(siapa|who)/.test(value))) {
      return AUTHOR_ANSWER;
    }
    const asksTech = aboutProgram && (
      /(teknologi|tech stack|bahasa pemrograman|framework|\btools?\b)/.test(value)
      || /(dibuat|buat|dikembangkan|bikin).{0,40}(menggunakan|memakai|pakai|pake|dengan)/.test(value)
      || /(menggunakan|memakai|pakai|pake) apa/.test(value)
    );
    if (asksTech) return TECH_ANSWER;
    return "";
  }

  function showAnswer(text) {
    answer.textContent = text;
    answerCard.hidden = false;
    report.hidden = true;
    result.hidden = false;
  }

  function render(data) {
    fields.summary.textContent = data.summary || "";
    fields.trend_analysis.textContent = data.trend_analysis || "";
    fields.platform_analysis.textContent = data.platform_analysis || "";
    fields.brand_analysis.textContent = data.brand_analysis || "";
    fields.product_analysis.textContent = data.product_analysis || "";
    fillList(lists.key_findings, data.key_findings);
    fillList(lists.anomalies, data.anomalies);
    fillList(lists.possible_explanations, data.possible_explanations);
    fillList(lists.recommendations, data.recommendations);
    answerCard.hidden = true;
    report.hidden = false;
    result.hidden = false;
  }

  const HARDWARE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7qoh1IPk8xqANOa5lsMr3dQz4izqXUuGjWp8KFGEuCF9wGZn5L-_u-xJjCCijN4u5qTlsEySdoHkU/pub?output=csv";

  function storeLabel(name) {
    const text = String(name || "").trim();
    const key = text.toUpperCase();
    if (key.includes("BANGUN INDAH GRAHA MALANG")) return "BIG MLG";
    if (key.includes("MITRA 10 SURABAYA")) return "Mitra 10 SBY";
    if (key.includes("VISI CAKRAWALA")) return "Visi Cakrawala";
    if (key.includes("ADIPUTRO TULUNGAGUNG")) return "Adiputro TLA";
    if (key.includes("ADIPUTRO KEDIRI")) return "Adiputro KDR";
    return text;
  }

  function sheetAmount(value) {
    let text = String(value || "").trim().replace(/Rp|IDR/gi, "").replace(/\s/g, "");
    if (!text || text === "-" || text === "—") return 0;
    if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
    else if (/^\d{1,3}(,\d{3})+$/.test(text)) text = text.replace(/,/g, "");
    else text = text.replace(/,/g, "");
    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  }

  function parseSheetCsv(source) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const input = String(source).replace(/^\uFEFF/, "");
    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      if (quoted) {
        if (ch === '"') {
          if (input[i + 1] === '"') { cell += '"'; i += 1; }
          else quoted = false;
        } else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((item) => item.some((value) => String(value).trim() !== ""));
  }

  function rupiah(value) {
    return "Rp " + Math.round(Number(value) || 0).toLocaleString("id-ID");
  }

  function topEntries(map, limit) {
    return [...map.entries()].filter((item) => item[0] && item[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  async function loadHardwareKpis() {
    const response = await fetch(HARDWARE_SHEET_URL + "&_cb=" + Date.now(), { cache: "reload" });
    if (!response.ok) throw new Error("sheet");
    const table = parseSheetCsv(await response.text());
    const header = table[0].map((name) => String(name).trim().toUpperCase());
    const yearIndex = header.indexOf("TAHUN");
    const platformIndex = header.indexOf("NM_PLG");
    const brandIndex = header.indexOf("MERK");
    const itemIndex = header.indexOf("NM_BRG");
    const statusIndex = header.indexOf("STAT_PO");
    const revenueIndex = header.findIndex((name) => name.includes("BRUTTO"));
    if ([yearIndex, platformIndex, statusIndex, revenueIndex].some((index) => index < 0)) throw new Error("kolom");
    const stores = new Map();
    const brands = new Map();
    const items = new Map();
    const years = new Map();
    let total = 0;
    table.slice(1).forEach((line) => {
      if (String(line[statusIndex] || "").trim().toUpperCase() !== "DIKIRIM") return;
      const amount = sheetAmount(line[revenueIndex]);
      if (!amount) return;
      const year = Number(line[yearIndex]);
      const store = storeLabel(line[platformIndex]);
      const brand = String(brandIndex < 0 ? "" : line[brandIndex] || "").trim();
      const item = String(itemIndex < 0 ? "" : line[itemIndex] || "").trim();
      total += amount;
      if (store) stores.set(store, (stores.get(store) || 0) + amount);
      if (brand && !/^\(blank\)$/i.test(brand)) brands.set(brand, (brands.get(brand) || 0) + amount);
      if (item) items.set(item, (items.get(item) || 0) + amount);
      if (year) years.set(year, (years.get(year) || 0) + amount);
    });
    return {
      total,
      stores: topEntries(stores, 6),
      brands: topEntries(brands, 8),
      items: topEntries(items, 5),
      years: [...years.entries()].sort((a, b) => a[0] - b[0]),
    };
  }

  function shareText(value, total) {
    if (!total) return "0%";
    return (Math.round((value / total) * 1000) / 10).toFixed(1).replace(".", ",") + "%";
  }

  function reportFromHardware(kpis) {
    const storeLine = kpis.stores.map(([name, value]) => name + " " + rupiah(value) + " (" + shareText(value, kpis.total) + ")").join("; ");
    const brandLine = kpis.brands.map(([name, value]) => name + " " + rupiah(value)).join("; ");
    const itemLine = kpis.items.map(([name, value]) => name + " " + rupiah(value)).join("; ");
    const yearLine = kpis.years.slice(-3).map(([year, value]) => year + " " + rupiah(value)).join("; ");
    const leader = kpis.stores[0];
    const topBrand = kpis.brands[0];
    const findings = [];
    if (leader) findings.push(leader[0] + " adalah toko terbesar dengan pangsa " + shareText(leader[1], kpis.total) + ".");
    if (topBrand) findings.push(topBrand[0] + " adalah merek dengan omset DIKIRIM terbesar.");
    if (kpis.stores[1]) findings.push("Toko berikutnya adalah " + kpis.stores[1][0] + ".");
    return {
      summary: "Analisis dihitung dari Google Sheet hardware. Total omset DIKIRIM " + rupiah(kpis.total) + ". Toko terbesar: " + (leader ? leader[0] : "-") + ". Merek terbesar: " + (topBrand ? topBrand[0] : "-") + ".",
      key_findings: findings,
      trend_analysis: yearLine ? "Omset DIKIRIM tiga tahun terakhir: " + yearLine + "." : "Belum ada tahun yang bisa dibandingkan.",
      platform_analysis: storeLine ? "Enam toko terbesar menurut NM_PLG: " + storeLine + "." : "Tidak ada data toko.",
      brand_analysis: brandLine ? "Merek pada sheet: " + brandLine + "." : "Tidak ada data merek.",
      product_analysis: itemLine ? "Lima item dengan omset tertinggi: " + itemLine + "." : "Tidak ada data item.",
      anomalies: ["Tidak ditemukan anomali yang signifikan berdasarkan data yang tersedia."],
      possible_explanations: ["Perbedaan omset antar toko dapat berasal dari cakupan cabang dan campuran merek, bukan dari data di luar Google Sheet hardware."],
      recommendations: leader ? ["Jaga pasokan merek utama dan kurangi ketergantungan pada " + leader[0] + " dengan menguatkan toko berikutnya."] : [],
    };
  }

  function answerFromHardware(question, kpis) {
    const text = String(question || "").toLowerCase();
    const named = [...kpis.stores, ...kpis.brands].find(([name]) => text.includes(name.toLowerCase()));
    if (named) return "Menurut Google Sheet hardware, omset DIKIRIM " + named[0] + " adalah " + rupiah(named[1]) + ".";
    const leader = kpis.stores[0];
    const topBrand = kpis.brands[0];
    return "Menurut Google Sheet hardware, total omset DIKIRIM adalah " + rupiah(kpis.total) + ". Toko terbesar: " + (leader ? leader[0] + " (" + rupiah(leader[1]) + ")" : "-") + ". Merek terbesar: " + (topBrand ? topBrand[0] + " (" + rupiah(topBrand[1]) + ")" : "-") + ".";
  }

  function analystEndpoint() {
    const host = location.hostname;
    if (host === "127.0.0.1" || host === "localhost" || host.endsWith("workers.dev")) {
      return new URL("api/analyst", location.href).href;
    }
    return "";
  }

  async function run(text, full) {
    setBusy(true);
    result.hidden = true;
    const preset = full ? "" : exclusiveAnswer(text);
    if (preset) {
      status.textContent = "";
      showAnswer(preset);
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
      return;
    }
    const endpoint = analystEndpoint();
    try {
      if (!endpoint) {
        const kpis = await loadHardwareKpis();
        status.textContent = "";
        if (full) render(reportFromHardware(kpis));
        else showAnswer(answerFromHardware(text, kpis));
        return;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, full: Boolean(full) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        console.error("AI Analyst gagal", response.status, data && data.error ? data.error : data);
        status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
        return;
      }
      status.textContent = "";
      if (!full && data.answer) showAnswer(data.answer);
      else render(data);
    } catch (error) {
      console.error("AI Analyst gagal", error);
      status.textContent = "AI Analyst sedang tidak dapat digunakan. Silakan coba lagi.";
    } finally {
      analyze.disabled = false;
      ask.disabled = false;
      question.disabled = false;
    }
  }

  analyze.addEventListener("click", () => {
    run("Buat analisis eksekutif penjualan hardware dari KPI Google Sheet hardware yang tersedia.", true);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = question.value.trim();
    if (!text) return;
    run(text, false);
  });
})();
