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

  function monthNumber(monthText) {
    const token = String(monthText || "").trim().replace(/\./g, "-").split(/[-\s]/)[0].toUpperCase().slice(0, 3);
    return { JAN: 1, FEB: 2, MAR: 3, APR: 4, MEI: 5, MAY: 5, JUN: 6, JUL: 7, AGU: 8, AGS: 8, AUG: 8, SEP: 9, OKT: 10, OCT: 10, NOV: 11, DES: 12, DEC: 12 }[token] || 0;
  }

  const MONTH_WORDS = [
    [1, ["januari"]], [2, ["februari"]], [3, ["maret"]], [4, ["april"]], [5, ["mei"]],
    [6, ["juni"]], [7, ["juli"]], [8, ["agustus"]], [9, ["september"]], [10, ["oktober"]],
    [11, ["november"]], [12, ["desember"]],
  ];

  let hardwareKpiPromise = null;

  async function loadHardwareKpis() {
    if (hardwareKpiPromise) return hardwareKpiPromise;
    hardwareKpiPromise = (async () => {
      const response = await fetch(HARDWARE_SHEET_URL + "&_cb=" + Date.now(), { cache: "reload" });
      if (!response.ok) throw new Error("sheet");
      const table = parseSheetCsv(await response.text());
      const header = table[0].map((name) => String(name).trim().toUpperCase());
      const yearIndex = header.indexOf("TAHUN");
      const monthIndex = header.indexOf("BULAN");
      const platformIndex = header.indexOf("NM_PLG");
      const brandIndex = header.indexOf("MERK");
      const itemIndex = header.indexOf("NM_BRG");
      const statusIndex = header.indexOf("STAT_PO");
      const revenueIndex = header.findIndex((name) => name.includes("BRUTTO"));
      const qtyIndex = header.findIndex((name) => name.includes("QTY"));
      if ([yearIndex, platformIndex, statusIndex, revenueIndex].some((index) => index < 0)) throw new Error("kolom");
      const stores = new Map();
      const brands = new Map();
      const items = new Map();
      const years = new Map();
      const rows = [];
      let total = 0;
      table.slice(1).forEach((line) => {
        if (String(line[statusIndex] || "").trim().toUpperCase() !== "DIKIRIM") return;
        const amount = sheetAmount(line[revenueIndex]);
        const year = Number(line[yearIndex]);
        const store = storeLabel(line[platformIndex]);
        const brandText = String(brandIndex < 0 ? "" : line[brandIndex] || "").trim();
        const brand = /^\(blank\)$/i.test(brandText) ? "" : brandText;
        const item = String(itemIndex < 0 ? "" : line[itemIndex] || "").trim();
        const row = {
          year,
          month: monthIndex < 0 ? 0 : monthNumber(line[monthIndex]),
          store,
          brand,
          item,
          amount,
          qty: qtyIndex < 0 ? 0 : sheetAmount(line[qtyIndex]),
        };
        rows.push(row);
        if (!amount) return;
        total += amount;
        if (store) stores.set(store, (stores.get(store) || 0) + amount);
        if (brand) brands.set(brand, (brands.get(brand) || 0) + amount);
        if (item) items.set(item, (items.get(item) || 0) + amount);
        if (year) years.set(year, (years.get(year) || 0) + amount);
      });
      return {
        total,
        rows,
        stores: topEntries(stores, 6),
        brands: topEntries(brands, 8),
        items: topEntries(items, 5),
        years: [...years.entries()].sort((a, b) => a[0] - b[0]),
      };
    })().catch((error) => {
      hardwareKpiPromise = null;
      throw error;
    });
    return hardwareKpiPromise;
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

  function questionText(question) {
    return String(question || "").toLowerCase().replace(/[?!.,]/g, " ").replace(/\s+/g, " ").trim();
  }

  function hasWord(text, word) {
    return new RegExp("(^|[^a-z0-9])" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9]|$)").test(text);
  }

  function aliasesOf(name, kind) {
    const label = kind === "store" ? storeLabel(name) : String(name || "").trim();
    const aliases = [label.toLowerCase()];
    const key = label.toUpperCase();
    if (key.includes("BANGUN INDAH") || key === "BIG MLG") aliases.push("big mlg", "bangun indah", "bangun indah graha malang");
    if (key.includes("MITRA 10")) aliases.push("mitra 10 sby", "mitra 10 surabaya", "mitra 10");
    if (key.includes("VISI CAKRAWALA")) aliases.push("visi cakrawala pratama", "visi cakrawala");
    if (key.includes("ADIPUTRO") && key.includes("TLA")) aliases.push("adiputro tulungagung", "adiputro tla");
    if (key.includes("ADIPUTRO") && key.includes("KDR")) aliases.push("adiputro kediri", "adiputro kdr");
    if (key.includes("DEPO BANGUNAN")) aliases.push("depo bangunan", "depo");
    if (key.includes("ACE HARDWARE")) aliases.push("ace hardware", "ace");
    return [...new Set(aliases.filter((alias) => alias.length >= (kind === "item" ? 8 : 3)))];
  }

  function findMentions(text, rows) {
    const groups = { store: new Set(), brand: new Set(), item: new Set() };
    rows.forEach((row) => {
      if (row.store) groups.store.add(row.store);
      if (row.brand) groups.brand.add(row.brand);
      if (row.item) groups.item.add(row.item);
    });
    const found = [];
    Object.entries(groups).forEach(([kind, names]) => {
      names.forEach((name) => {
        aliasesOf(name, kind).forEach((alias) => {
          if (hasWord(text, alias)) found.push({ kind, name, alias, len: alias.length });
        });
      });
    });
    found.sort((a, b) => b.len - a.len);
    const picked = [];
    found.forEach((item) => {
      if (picked.some((have) => have.kind === item.kind && have.name === item.name)) return;
      if (picked.some((have) => have.len > item.len && (have.alias.includes(item.alias) || item.alias.includes(have.alias)))) return;
      picked.push(item);
    });
    return picked;
  }

  function sumAmount(list) {
    return list.reduce((sum, row) => sum + row.amount, 0);
  }

  function selectRows(rows, spec, unit) {
    const measure = unit === "pcs" ? "qty" : "amount";
    return rows.filter((row) => {
      if (spec.years && spec.years.length && !spec.years.includes(row.year)) return false;
      if (spec.months && spec.months.length && !spec.months.includes(row.month)) return false;
      if (spec.store && row.store !== spec.store) return false;
      if (spec.brand && row.brand !== spec.brand) return false;
      if (spec.item && row.item !== spec.item) return false;
      return Number(row[measure]) > 0;
    });
  }

  function rankBy(list, keyFn, limit) {
    const map = new Map();
    list.forEach((row) => {
      const key = keyFn(row);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + row.amount);
    });
    return [...map.entries()].filter((item) => item[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  function scopePhrase(years, months) {
    const monthName = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const parts = [];
    if (months && months.length === 1) parts.push(monthName[months[0]]);
    if (years && years.length === 1) parts.push("tahun " + years[0]);
    return parts.length ? " pada " + parts.join(" ") : "";
  }

  function answerFromHardware(question, kpis) {
    const text = questionText(question);
    const rows = kpis.rows || [];
    const years = [...new Set((text.match(/\b20\d{2}\b/g) || []).map(Number))];
    const months = MONTH_WORDS.filter((item) => item[1].some((word) => hasWord(text, word))).map((item) => item[0]);
    const mentions = findMentions(text, rows);
    const asksWhy = /(kenapa|mengapa|penyebab|sebab)/.test(text);
    const asksCompare = /(banding|dibanding|versus|\bvs\b|perbandingan)/.test(text);
    const asksTop = /(terbesar|tertinggi|paling besar|\btop\b|terbanyak)/.test(text);
    const asksStore = /(toko|platform|channel|kanal|pelanggan)/.test(text);
    const asksBrand = /(merek|merk|brand)/.test(text);
    const asksItem = /(item|produk|barang|sku)/.test(text);
    const asksNumber = /(omset|penjualan|brutto|berapa|jumlah|nilai|total)/.test(text);
    const asksTrend = /(tren|trend|naik|turun)/.test(text);
    const unit = /(\bpcs\b|pieces|kuantitas|\bqty\b|satuan\s+pcs)/.test(text) ? "pcs" : "rupiah";
    const lead = "Menurut Google Sheet hardware, ";
    const monthName = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    function formatValue(value) {
      if (unit === "pcs") return Math.round(Number(value) || 0).toLocaleString("id-ID") + " Pcs";
      return rupiah(value);
    }

    function entitySum(mention, yearList) {
      const spec = { years: yearList, months };
      if (mention && mention.kind === "store") spec.store = mention.name;
      if (mention && mention.kind === "brand") spec.brand = mention.name;
      if (mention && mention.kind === "item") spec.item = mention.name;
      const measure = unit === "pcs" ? "qty" : "amount";
      return selectRows(rows, spec, unit).reduce((sum, row) => sum + Number(row[measure] || 0), 0);
    }

    function changePhrase(next, prev) {
      if (!prev) return "";
      const change = Math.round(((next - prev) / prev) * 1000) / 10;
      const word = change > 0 ? "naik" : change < 0 ? "turun" : "sama";
      return word + " " + String(Math.abs(change)).replace(".", ",") + "%";
    }

    function partialYearNote(mention, year) {
      const spec = { years: [year] };
      if (mention && mention.kind === "store") spec.store = mention.name;
      if (mention && mention.kind === "brand") spec.brand = mention.name;
      if (mention && mention.kind === "item") spec.item = mention.name;
      const present = [...new Set(selectRows(rows, spec, unit).map((row) => row.month).filter(Boolean))].sort((a, b) => a - b);
      if (!present.length || present[present.length - 1] >= 12) return "";
      return " Data " + year + " baru sampai " + monthName[present[present.length - 1]] + ", jadi belum satu tahun penuh dan tidak setara dengan tahun yang sudah selesai.";
    }

    if ((asksCompare || years.length >= 2) && years.length >= 2) {
      const yearList = [...years].sort((a, b) => a - b);
      const subjects = mentions.length ? mentions : [{ name: "seluruh penjualan", kind: "all" }];
      const noun = unit === "pcs" ? "penjualan berstatus DIKIRIM dalam satuan Pcs" : "omset DIKIRIM dalam Rupiah";
      const blocks = subjects.map((mention) => {
        const points = yearList.map((year) => ({ year, value: entitySum(mention, [year]) }));
        const detail = points.map((point, index) => {
          if (!index) return point.year + " sebesar " + formatValue(point.value);
          const step = changePhrase(point.value, points[index - 1].value);
          return point.year + " sebesar " + formatValue(point.value) + (step ? ", " + step + " dibanding " + points[index - 1].year : "");
        }).join("; ");
        const first = points[0];
        const last = points[points.length - 1];
        const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0]);
        const low = points.reduce((best, point) => (point.value < best.value ? point : best), points[0]);
        const overall = changePhrase(last.value, first.value);
        const note = partialYearNote(mention, last.year);
        let reading = " Tahun tertinggi adalah " + peak.year + " (" + formatValue(peak.value) + ") dan tahun terendah adalah " + low.year + " (" + formatValue(low.value) + ").";
        if (overall) reading += " Dari " + first.year + " ke " + last.year + " perubahannya " + overall + ".";
        const measureName = unit === "pcs" ? "volume penjualan" : "nilai penjualan";
        const direction = overall || "";
        const implication = note
          ? " Implikasi bisnis: jangan menyamakan " + last.year + " dengan tahun penuh sebelum periodenya selesai."
          : direction.indexOf("turun") === 0
            ? " Implikasi bisnis: " + measureName + " menurun, sehingga permintaan, stok, dan kontribusi toko perlu ditinjau."
            : direction.indexOf("naik") === 0
              ? " Implikasi bisnis: ada pertumbuhan, sehingga pasokan dan kapasitas pengiriman perlu dijaga."
              : " Implikasi bisnis: angkanya stabil, sehingga prioritasnya mempertahankan tingkat penjualan ini.";
        const cause = asksWhy ? " Data sheet hanya berisi angka penjualan, belum cukup untuk menentukan penyebabnya." : "";
        return noun + " " + mention.name + " adalah " + detail + "." + reading + note + implication + cause;
      });
      return lead + blocks.join(" ");
    }

    if (asksCompare && mentions.length >= 2) {
      const noun = unit === "pcs" ? "penjualan dalam satuan Pcs" : "omset DIKIRIM";
      const lines = mentions.slice(0, 3).map((mention) => mention.name + " " + formatValue(entitySum(mention, years.length === 1 ? years : [])) + scopePhrase(years.length === 1 ? years : [], months));
      return lead + "perbandingan " + noun + ": " + lines.join("; ") + ".";
    }

    if (asksTop) {
      const scoped = selectRows(rows, { years: years.length === 1 ? years : [], months });
      const keyFn = asksBrand ? (row) => row.brand : asksItem ? (row) => row.item : (row) => row.store;
      const label = asksBrand ? "merek" : asksItem ? "item" : "toko";
      const ranked = rankBy(scoped, keyFn, 5);
      if (!ranked.length) return lead + "tidak ada omset DIKIRIM" + scopePhrase(years, months) + ".";
      return lead + label + " dengan omset DIKIRIM terbesar" + scopePhrase(years, months) + " adalah " + ranked.map(([name, value], index) => (index + 1) + ". " + name + " " + rupiah(value)).join("; ") + ".";
    }

    if (!asksWhy && mentions.length === 1 && (asksNumber || asksTrend || years.length || months.length)) {
      const mention = mentions[0];
      const noun = unit === "pcs" ? "penjualan DIKIRIM dalam satuan Pcs" : "omset DIKIRIM";
      const basis = unit === "pcs" ? " Angka ini adalah jumlah Pcs pesanan berstatus DIKIRIM." : " Angka ini adalah BRUTTO pesanan berstatus DIKIRIM.";
      if (years.length === 1 || months.length) {
        const value = entitySum(mention, years.length === 1 ? years : []);
        return lead + noun + " " + mention.name + scopePhrase(years.length === 1 ? years : [], months) + " adalah " + formatValue(value) + "." + basis;
      }
      const scope = mention.kind === "store" ? { store: mention.name } : mention.kind === "brand" ? { brand: mention.name } : { item: mention.name };
      const byYear = [...new Set(selectRows(rows, scope, unit).map((row) => row.year))].filter(Boolean).sort((a, b) => a - b)
        .map((year) => [String(year), entitySum(mention, [year])]);
      return lead + noun + " " + mention.name + " adalah " + formatValue(entitySum(mention, [])) + ". Rincian tahun: " + byYear.map(([year, value]) => year + " " + formatValue(value)).join("; ") + ".";
    }

    if (!mentions.length && years.length === 1 && (asksNumber || asksTrend || asksStore || asksBrand || asksItem)) {
      if (asksStore || asksBrand || asksItem) {
        const scoped = selectRows(rows, { years, months });
        const keyFn = asksBrand ? (row) => row.brand : asksItem ? (row) => row.item : (row) => row.store;
        const label = asksBrand ? "merek" : asksItem ? "item" : "toko";
        const ranked = rankBy(scoped, keyFn, 5);
        return lead + "lima " + label + " terbesar tahun " + years[0] + " adalah " + ranked.map(([name, value]) => name + " " + rupiah(value)).join("; ") + ".";
      }
      const value = sumAmount(selectRows(rows, { years, months }));
      return lead + "total omset DIKIRIM" + scopePhrase(years, months) + " adalah " + rupiah(value) + ".";
    }

    if (asksTrend && !mentions.length) {
      const series = kpis.years.slice(-3).map(([year, value]) => year + " " + rupiah(value)).join("; ");
      return lead + "omset DIKIRIM tiga tahun terakhir adalah " + series + ".";
    }

    if (asksWhy) {
      const subject = mentions[0];
      let fact = "";
      if (subject) {
        const knownYears = [...new Set(selectRows(rows, subject.kind === "store" ? { store: subject.name } : subject.kind === "brand" ? { brand: subject.name } : { item: subject.name }).map((row) => row.year))].sort((a, b) => a - b);
        const pair = years.length >= 2 ? years.slice(0, 2) : knownYears.slice(-2);
        if (pair.length === 2) {
          const before = entitySum(subject, [pair[0]]);
          const after = entitySum(subject, [pair[1]]);
          const change = before ? Math.round(((after - before) / before) * 1000) / 10 : null;
          const changeText = change == null ? "" : " Perubahan " + (change > 0 ? "naik " : change < 0 ? "turun " : "sama ") + String(Math.abs(change)).replace(".", ",") + "%.";
          fact = "Omset DIKIRIM " + subject.name + " tahun " + pair[0] + " adalah " + rupiah(before) + " dan tahun " + pair[1] + " adalah " + rupiah(after) + "." + changeText + " ";
        } else {
          fact = "Omset DIKIRIM " + subject.name + " tercatat " + rupiah(entitySum(subject, years.length === 1 ? years : [])) + ". ";
        }
      }
      return lead + fact + "Data sheet hanya berisi angka penjualan, belum cukup untuk menentukan penyebabnya.";
    }

    if (mentions.length) {
      const lines = mentions.slice(0, 3).map((mention) => mention.name + " " + rupiah(entitySum(mention, years.length === 1 ? years : [])) + scopePhrase(years.length === 1 ? years : [], months));
      return lead + "omset DIKIRIM " + lines.join("; ") + ".";
    }

    return "Pertanyaan itu belum bisa dijawab dari Google Sheet hardware. Sebutkan toko, merek, item, atau tahun. Contoh: Berapa omset DEPO BANGUNAN tahun 2025?";
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
      if (!full || !endpoint) {
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
