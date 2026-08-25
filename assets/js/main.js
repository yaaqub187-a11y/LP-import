(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el, i) {
        el.style.setProperty("--i", i % 6);
        io.observe(el);
      });
    }
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    btn.addEventListener("click", function () {
      var isOpen = item.getAttribute("data-open") === "true";
      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.setAttribute("data-open", "false");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Testimonial scroller ---------- */
  var track = document.querySelector(".testi-track");
  var prevBtn = document.querySelector(".testi-btn.prev");
  var nextBtn = document.querySelector(".testi-btn.next");
  if (track && prevBtn && nextBtn) {
    var scrollByCard = function (dir) {
      var card = track.querySelector(".testi-card");
      var gap = 24;
      var amount = card ? card.getBoundingClientRect().width + gap : 320;
      track.scrollBy({ left: dir * amount, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };
    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
  }

  /* ---------- Cost calculator ----------
     Illustrative estimate only — see disclaimer in the UI. Figures are
     simplified approximations of PL customs/excise/VAT treatment for a
     vehicle imported from outside the EU, meant to show the shape of the
     total cost, not to be a binding quote. */
  var calcForm = document.getElementById("calc-form");
  if (calcForm) {
    var priceInput = document.getElementById("calc-price");
    var engineInputs = calcForm.querySelectorAll('input[name="engine"]');
    var totalEl = document.getElementById("calc-total");
    var rowAuction = document.getElementById("row-auction");
    var rowTransport = document.getElementById("row-transport");
    var rowDuty = document.getElementById("row-duty");
    var rowExcise = document.getElementById("row-excise");
    var rowVat = document.getElementById("row-vat");
    var rowService = document.getElementById("row-service");

    var USD_PLN = 4.0;
    var TRANSPORT_USD = 1450;
    var AUCTION_FEE = 0.06;
    var CUSTOMS_DUTY = 0.10;
    var SERVICE_FEE_USD = 1200;
    var VAT = 0.23;
    var EXCISE_RATES = { small: 0.031, large: 0.186, ev: 0 };

    function pln(n) {
      return n.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) + " zł";
    }

    function currentEngineRate() {
      var checked = calcForm.querySelector('input[name="engine"]:checked');
      var key = checked ? checked.value : "small";
      return EXCISE_RATES[key] || 0;
    }

    function recalc() {
      var price = parseFloat(priceInput.value);
      if (isNaN(price) || price <= 0) price = 0;

      var auctionFee = price * AUCTION_FEE;
      var cif = price + auctionFee + TRANSPORT_USD;
      var duty = cif * CUSTOMS_DUTY;
      var exciseBase = cif + duty;
      var excise = exciseBase * currentEngineRate();
      var vatBase = cif + duty + excise;
      var vat = vatBase * VAT;
      var totalUsd = cif + duty + excise + vat + SERVICE_FEE_USD;
      var totalPln = totalUsd * USD_PLN;

      totalEl.textContent = price > 0 ? pln(totalPln) : "0 zł";
      rowAuction.textContent = pln((price + auctionFee) * USD_PLN);
      rowTransport.textContent = pln(TRANSPORT_USD * USD_PLN);
      rowDuty.textContent = pln(duty * USD_PLN);
      rowExcise.textContent = pln(excise * USD_PLN);
      rowVat.textContent = pln(vat * USD_PLN);
      rowService.textContent = pln(SERVICE_FEE_USD * USD_PLN);
    }

    priceInput.addEventListener("input", recalc);
    engineInputs.forEach(function (el) { el.addEventListener("change", recalc); });
    recalc();
  }

  /* ---------- Contact form (client-side only demo) ---------- */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var successBox = contactForm.querySelector(".form-success");

    function setError(field, message) {
      var wrap = field.closest(".field");
      wrap.classList.toggle("has-error", Boolean(message));
      var err = wrap.querySelector(".form-error");
      if (err) err.textContent = message || "";
    }

    function validate() {
      var valid = true;
      var name = contactForm.querySelector("#f-name");
      var phone = contactForm.querySelector("#f-phone");
      var email = contactForm.querySelector("#f-email");

      if (!name.value.trim()) { setError(name, "Podaj imię i nazwisko."); valid = false; }
      else setError(name, "");

      var phoneDigits = phone.value.replace(/\D/g, "");
      if (phoneDigits.length < 9) { setError(phone, "Podaj poprawny numer telefonu."); valid = false; }
      else setError(phone, "");

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (email.value.trim() && !emailOk) { setError(email, "Podaj poprawny adres e-mail."); valid = false; }
      else setError(email, "");

      return valid;
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      // No backend is wired up yet — this simply confirms receipt in the UI.
      // Point the fetch() call below at your form endpoint / CRM webhook.
      successBox.classList.add("is-visible");
      contactForm.reset();
      successBox.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
