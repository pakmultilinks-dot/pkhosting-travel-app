/* PK Hosting and Travel.pk app logic. No payments and no bookings happen here. */
(function () {
  "use strict";

  /* ---------- View switching ---------- */
  var views = { home: "view-home", hosting: "view-hosting", travel: "view-travel" };
  function showView(name) {
    Object.keys(views).forEach(function (k) {
      document.getElementById(views[k]).classList.toggle("active", k === name);
    });
    document.querySelectorAll(".navbtn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-nav") === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll("[data-nav]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      showView(el.getAttribute("data-nav"));
    });
  });
  document.querySelectorAll("[data-scroll]").forEach(function (el) {
    el.addEventListener("click", function () {
      var t = document.getElementById(el.getAttribute("data-scroll"));
      if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });

  /* ---------- Domain prices ---------- */
  var DOMAIN_PRICES = {
    ".com": { price: "Rs 3,299 /yr", term: "1 year", was: "Rs 3,762" },
    ".pk": { price: "Rs 3,899 /2yr", term: "2 years", was: "Rs 5,460" },
    ".com.pk": { price: "Rs 3,899 /2yr", term: "2 years", was: "Rs 5,460" },
    ".org.pk": { price: "Rs 3,899 /2yr", term: "2 years", was: "Rs 5,460" },
    ".net.pk": { price: "Rs 3,899 /2yr", term: "2 years", was: "Rs 5,460" }
  };
  var domainForm = document.getElementById("domain-form");
  domainForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("domain-name").value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    var ext = document.getElementById("domain-ext").value;
    var out = document.getElementById("domain-result");
    if (!name) {
      out.hidden = false;
      out.textContent = "Type a domain name first, for example mybusiness.";
      return;
    }
    var p = DOMAIN_PRICES[ext];
    out.hidden = false;
    out.innerHTML = "<strong>" + name + ext + "</strong> - " + p.price + " (" + p.term + ", was " + p.was + ", Black Friday price). " +
      "Check live availability for this name on pkhosting.com.";
  });

  /* ---------- Plan price toggle ---------- */
  var toggleFirst = document.getElementById("toggle-first");
  var toggleRenew = document.getElementById("toggle-renew");
  function setPeriod(period) {
    toggleFirst.classList.toggle("active", period === "first");
    toggleRenew.classList.toggle("active", period === "renew");
    document.querySelectorAll(".plan-now").forEach(function (el) {
      el.textContent = period === "first" ? el.getAttribute("data-first") : el.getAttribute("data-renew");
    });
    document.querySelectorAll(".plan-was").forEach(function (el) {
      el.textContent = period === "first" ? el.getAttribute("data-was-first") : el.getAttribute("data-was-renew");
    });
    document.querySelectorAll(".plan-note").forEach(function (el) {
      el.textContent = period === "first" ? el.getAttribute("data-note-first") : el.getAttribute("data-note-renew");
    });
  }
  toggleFirst.addEventListener("click", function () { setPeriod("first"); });
  toggleRenew.addEventListener("click", function () { setPeriod("renew"); });

  /* ---------- Order modal (information only) ---------- */
  var orderModal = document.getElementById("order-modal");
  var orderPlan = document.getElementById("order-plan");
  document.querySelectorAll("[data-order]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var plan = btn.getAttribute("data-order");
      var card = btn.closest(".plan-card");
      var price = card.querySelector(".plan-now").textContent;
      orderPlan.innerHTML = "<strong>" + plan + "</strong> - " + price + " per year.";
      document.getElementById("order-title").textContent = "Order " + plan;
      orderModal.hidden = false;
    });
  });
  document.getElementById("order-close").addEventListener("click", function () { orderModal.hidden = true; });
  orderModal.addEventListener("click", function (e) { if (e.target === orderModal) { orderModal.hidden = true; } });

  /* ---------- Flight search ---------- */
  var CITY_NAMES = { LHE: "Lahore", ISB: "Islamabad", KHI: "Karachi", DXB: "Dubai", IST: "Istanbul", BKK: "Bangkok", KUL: "Kuala Lumpur", GYD: "Baku", JED: "Jeddah" };
  /* Verified live fares, checked November 2026. */
  var VERIFIED_FARES = [
    { from: "LHE", to: "DXB", date: "2026-11-24", flights: 11, offers: 30, fromPrice: "Rs108,251" },
    { from: "ISB", to: "DXB", date: "2026-11-24", flights: 13, offers: 27, fromPrice: "Rs104,098" },
    { from: "LHE", to: "DXB", date: "2026-12-10", flights: 18, offers: 36, fromPrice: "Rs109,790" }
  ];
  var flightForm = document.getElementById("flight-form");
  var flightResults = document.getElementById("flight-results");
  flightForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var from = document.getElementById("flight-from").value;
    var to = document.getElementById("flight-to").value;
    var date = document.getElementById("flight-date").value;
    var pax = document.getElementById("flight-pax").value;
    if (from === to) {
      flightResults.innerHTML = '<div class="info-box"><strong>Pick two different cities.</strong> From and To cannot be the same city.</div>';
      return;
    }
    var matches = VERIFIED_FARES.filter(function (f) { return f.from === from && f.to === to; });
    var html = "";
    if (matches.length === 0) {
      html = '<div class="info-box"><strong>No stored fare for ' + CITY_NAMES[from] + ' to ' + CITY_NAMES[to] + '.</strong><br>' +
        'Live fares change daily, so we do not show a guessed price for this route. Check travel.pk for current options, or ask the Travel.pk team on +92 42 3569 2952.</div>';
    } else {
      html = '<p><strong>Results for ' + CITY_NAMES[from] + ' to ' + CITY_NAMES[to] + ', ' + pax + ' passenger' + (pax > 1 ? 's' : '') + '.</strong> Fares checked live in November 2026. Live fares change daily.</p>';
      matches.forEach(function (f) {
        var perPerson = f.fromPrice;
        html += '<div class="fare-card"><h3>' + CITY_NAMES[from] + ' to ' + CITY_NAMES[to] + ' - ' + f.date + '</h3>' +
          '<p class="fare-price">From ' + perPerson + '</p>' +
          '<p class="fare-meta">' + f.flights + ' flights, ' + f.offers + ' offers. Price is per person, one way, in PKR. Baggage, change and refund rules vary by fare, check them before payment.</p>' +
          '<button class="btn btn-blue" type="button" data-book="' + CITY_NAMES[from] + ' to ' + CITY_NAMES[to] + ' on ' + f.date + '">Book with the team</button></div>';
      });
      html += '<p class="fineprint">The cheapest-looking fare is not always the least expensive journey. Compare departure time, connections and total duration alongside price.</p>';
    }
    flightResults.innerHTML = html;
    bindBookButtons();
  });

  /* ---------- Booking modal (information only) ---------- */
  var bookModal = document.getElementById("book-modal");
  function bindBookButtons() {
    document.querySelectorAll("[data-book]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("book-route").innerHTML = "<strong>Route:</strong> " + btn.getAttribute("data-book") + ".";
        bookModal.hidden = false;
      });
    });
  }
  document.getElementById("book-close").addEventListener("click", function () { bookModal.hidden = true; });
  bookModal.addEventListener("click", function (e) { if (e.target === bookModal) { bookModal.hidden = true; } });

  /* ---------- Packages (12, all tailored quote) ---------- */
  var PACKAGES = [
    { name: "Hunza Valley Tour", note: "Valleys, forts and mountain views." },
    { name: "Skardu and Deosai Tour", note: "Lakes, cold desert and high plateau." },
    { name: "Dubai City Break", note: "City, shopping and desert safari." },
    { name: "Istanbul Explorer", note: "Historic city, Bosphorus and bazaars." },
    { name: "Bangkok and Pattaya Tour", note: "City, food and beaches." },
    { name: "Kuala Lumpur Getaway", note: "City towers and island trips." },
    { name: "Baku City Tour", note: "Old town and Caspian waterfront." },
    { name: "Maldives Island Escape", note: "Island resort stay and clear water." },
    { name: "Umrah Package", note: "Flights, stays and ground arrangements." },
    { name: "Northern Areas Family Tour", note: "Hunza, Skardu and Naran in one trip." },
    { name: "Murree and Galiyat Weekend", note: "Hills, pine forests and cool air." },
    { name: "Neelum Valley Tour", note: "Green valley, rivers and villages." }
  ];
  var pkgGrid = document.getElementById("pkg-grid");
  PACKAGES.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "pkg-card";
    card.innerHTML = "<h3>" + p.name + "</h3><p>" + p.note + "</p>" +
      '<p class="pkg-price">Tailored quote</p>' +
      '<button class="btn btn-blue" type="button" data-book="' + p.name + '">Ask the team for a quote</button>';
    pkgGrid.appendChild(card);
  });
  bindBookButtons();

  /* ---------- Escape closes modals ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { orderModal.hidden = true; bookModal.hidden = true; }
  });
})();
