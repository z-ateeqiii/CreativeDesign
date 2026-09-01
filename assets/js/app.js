/* ============================================================
   Creative Nails — catalogue logic
   Vanilla JS, no dependencies. Renders cards from SERVICES,
   handles filters, per-card carousels and the gallery lightbox.
   ============================================================ */

(function () {
  'use strict';

  var IMG_DIR = 'assets/images/';

  /* WhatsApp — the one place to change the booking number.
     WA_NUMBER is digits only, in full international form (no +, spaces or dashes). */
  var WA_NUMBER  = '201032279348';
  var WA_DISPLAY = '+20 10 32279348';

  var WA_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
      '<path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>' +
      '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.69 8.23-8.24 8.23z"/>' +
    '</svg>';

  /* ----------------------------------------------------------
     Data — edit here to add, reprice or re-photograph a service.
     images[]  : first entry is the cover photo
     price     : current price in EGP
     was       : original price (optional) -> renders a sale badge
     cats[]    : filter buckets (promotions is added automatically
                 for anything with a `was` price)
     ---------------------------------------------------------- */
  var SERVICES = [
    {
      id: 'hard-gel-extension',
      title: 'Hard Gel with Extension',
      category: 'Extensions',
      price: 1100,
      cats: ['extensions'],
      images: [
        'Hard gel with extension.png',
        'Hard gel with extension2.png',
        'Hard gel with extension3.png',
        'Hard gel with extensionn.png',
        'Hard gel with extension form.png'
      ]
    },
    {
      id: 'gel-polish-natural',
      title: 'Gel Polish on Natural Nails',
      category: 'Gel Polish',
      price: 850,
      cats: ['gel'],
      images: ['Gel polish on natural nails.png']
    },
    {
      id: 'cat-eye',
      title: 'X_gel with Design — Cat Eye',
      category: 'Designs',
      price: 1100,
      cats: ['designs', 'gel'],
      images: [
        'X_gel With Design Cat Eye 🖤🖤.png',
        'X_gel With Design Cat Eye 🖤🖤2.png'
      ]
    },
    {
      id: 'cat-eye-silver-gold',
      title: 'X_gel Cat Eye — Silver & Gold',
      category: 'Designs',
      price: 700,
      was: 900,
      cats: ['designs', 'gel'],
      images: ['X_gel With Design Cat Eye Silver and Gold.png']
    },
    {
      id: 'creativenails-design',
      title: 'creativenalis Design',
      category: 'Signature',
      price: 1250,
      was: 1400,
      tag: 'Signature',
      desc: 'The full Creative Nails look — manicure, gel & classic nail art, custom designs and hand care, all in one set.',
      cats: ['designs'],
      images: [
        'creativenalis Design.png',
        'creativenalis Design2.png',
        'creativenalis Design3.png',
        'creativenalis Design4.png',
        'creativenalis Design5.png',
        'creativenalis Design6.png',
        'creativenalis Design7.png',
        'creativenalis Design8.png',
        'creativenalis Design9.png',
        'creativenalis Design10.png'
      ]
    },
    {
      id: 'combo-bundle',
      title: 'Hard Gel, Gel Polish, Classic Polish & Design',
      category: 'Bundle',
      price: 700,
      tag: 'Bundle',
      desc: 'Four services combined in a single appointment.',
      cats: ['gel', 'designs', 'extensions'],
      images: ['Hard gel, gel polish, classic polish, design.png']
    },
    {
      id: 'hard-gel-promo',
      title: 'Hard Gel with Extension — Full Designs',
      category: 'Extensions',
      price: 700,
      was: 800,
      tag: 'Promo · Full Designs',
      desc: 'Promotional 250 EL tier of the hard gel extension set, with full designs included.',
      cats: ['extensions', 'designs'],
      images: ['Hard gel with extension form.png']
    }
  ];

  /* ---------------------------------------------------------- */

  var grid     = document.getElementById('grid');
  var emptyMsg = document.getElementById('empty');
  var chips    = Array.prototype.slice.call(document.querySelectorAll('.chip'));

  var lb       = document.getElementById('lightbox');
  var lbImg    = document.getElementById('lbImg');
  var lbTitle  = document.getElementById('lbTitle');
  var lbCount  = document.getElementById('lbCount');
  var lbPrev   = document.getElementById('lbPrev');
  var lbNext   = document.getElementById('lbNext');
  var lbClose  = document.getElementById('lbClose');
  var lbBook   = document.getElementById('lbBook');

  var lbItem   = null;   // service currently open in the lightbox
  var lbIndex  = 0;      // photo index within that service
  var lastFocus = null;  // element to restore focus to on close

  /* helpers -------------------------------------------------- */

  function src(file) {
    // Filenames contain spaces, commas and emoji — encode for a valid URL.
    return encodeURI(IMG_DIR + file);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function money(n) {
    return 'EGP ' + n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* Builds a wa.me link with the enquiry already typed out for the
     customer. `photo` (1-based) is added when they ask from the gallery,
     so Lilo knows exactly which design they mean. */
  function waLink(item, photo) {
    var msg;
    if (!item) {
      msg = 'Hi Lilo! I found Creative Nails online and I would like to ask about your nail services.';
    } else {
      msg = 'Hi Lilo! I would like to book *' + item.title + '* (' + money(item.price) + ')'
          + ' from the Creative Nails catalogue.';
      if (photo) msg += '\nI like photo ' + photo + ' of this set.';
      msg += '\nIs it available?';
    }
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function isPromo(item) {
    return typeof item.was === 'number' && item.was > item.price;
  }

  function catsOf(item) {
    var c = item.cats.slice();
    if (isPromo(item) && c.indexOf('promotions') === -1) c.push('promotions');
    return c;
  }

  /* card rendering ------------------------------------------- */

  function buildCard(item) {
    var multi = item.images.length > 1;
    var card  = document.createElement('article');

    card.className = 'card';
    card.dataset.cats = catsOf(item).join(' ');
    card.dataset.id = item.id;

    var slides = item.images.map(function (file, i) {
      return '<div class="card__slide">' +
               '<img src="' + src(file) + '" alt="' + esc(item.title) + ' — photo ' + (i + 1) + '"' +
                    (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') +
                    ' decoding="async" data-file="' + esc(file) + '">' +
             '</div>';
    }).join('');

    var badges = '';
    if (isPromo(item)) badges += '<span class="badge badge--sale">Save ' + (item.was - item.price) + '</span>';
    if (item.tag)      badges += '<span class="badge badge--tag">' + esc(item.tag) + '</span>';

    var arrows = multi
      ? '<button class="car__nav car__nav--prev" aria-label="Previous photo">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
        '</button>' +
        '<button class="car__nav car__nav--next" aria-label="Next photo">' +
          '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>' +
        '</button>'
      : '';

    var dots = multi
      ? '<div class="car__dots">' + item.images.map(function (_, i) {
          return '<span class="car__dot' + (i === 0 ? ' is-active' : '') + '"></span>';
        }).join('') + '</div>'
      : '';

    var countPill = multi
      ? '<span class="count-pill">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M21 7v12a2 2 0 0 1-2 2H7"/></svg>' +
          '<span class="count-pill__n">' + item.images.length + '</span>' +
        '</span>'
      : '';

    var priceRow = '<span class="price"><small>EGP</small>' +
        item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      '</span>' +
      (isPromo(item) ? '<span class="price--was">' + money(item.was) + '</span>' : '');

    card.innerHTML =
      '<div class="card__media" role="button" tabindex="0" aria-label="Open gallery for ' + esc(item.title) + '">' +
        '<div class="card__slides">' + slides + '</div>' +
        (badges ? '<div class="badges">' + badges + '</div>' : '') +
        countPill +
        arrows +
        dots +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__text">' +
          '<p class="card__cat">' + esc(item.category) + '</p>' +
          '<h3 class="card__title">' + esc(item.title) + '</h3>' +
          (item.desc ? '<p class="card__desc">' + esc(item.desc) + '</p>' : '') +
          '<div class="card__price">' + priceRow + '</div>' +
        '</div>' +
        '<a class="wa" href="' + esc(waLink(item)) + '" target="_blank" rel="noopener"' +
           ' aria-label="Ask about ' + esc(item.title) + ' on WhatsApp"' +
           ' title="Ask about this on WhatsApp">' +
          WA_ICON +
        '</a>' +
      '</div>';

    wireCard(card, item);
    return card;
  }

  /* per-card carousel + interactions -------------------------- */

  function wireCard(card, item) {
    var media  = card.querySelector('.card__media');
    var track  = card.querySelector('.card__slides');
    var dots   = Array.prototype.slice.call(card.querySelectorAll('.car__dot'));
    var prev   = card.querySelector('.car__nav--prev');
    var next   = card.querySelector('.car__nav--next');
    var index  = 0;

    function render() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
    }

    function go(step) {
      var n = card.querySelectorAll('.card__slide').length;
      if (!n) return;
      index = (index + step + n) % n;
      render();
    }

    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); go(-1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); go(1); });

    /* Drop any photo that fails to load (e.g. an empty/corrupt file)
       so the carousel never shows a broken frame. */
    card.querySelectorAll('.card__slide img').forEach(function (img) {
      img.addEventListener('error', function () {
        var file  = img.dataset.file;
        var slide = img.parentNode;
        var pos   = Array.prototype.indexOf.call(track.children, slide);

        slide.remove();
        var at = item.images.indexOf(file);
        if (at > -1) item.images.splice(at, 1);

        // keep dots and index consistent with what is left
        if (dots.length) {
          var lastDot = dots.pop();
          if (lastDot) lastDot.remove();
        }
        var n = track.children.length;
        if (n === 0) { media.style.display = 'none'; return; }
        if (pos <= index) index = Math.max(0, index - 1);
        if (index >= n) index = n - 1;

        var pill = card.querySelector('.count-pill__n');
        if (pill) pill.textContent = String(n);
        if (n < 2) {
          var strip = card.querySelector('.car__dots');
          if (strip) strip.remove();
          if (prev) prev.remove();
          if (next) next.remove();
          var badgePill = card.querySelector('.count-pill');
          if (badgePill) badgePill.remove();
        }
        render();
      });
    });

    /* swipe on the card carousel */
    var startX = 0, startY = 0, swiping = false;
    media.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });

    media.addEventListener('touchend', function (e) {
      if (!swiping) return;
      swiping = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
        e.preventDefault();          // swipe moved the carousel, not the lightbox
      }
    });

    /* open the lightbox at the photo currently on screen */
    media.addEventListener('click', function () { openLightbox(item, index); });
    media.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item, index);
      }
    });

    /* WhatsApp enquiry — let the link open, just don't bubble to the card */
    card.querySelector('.wa').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    render();
  }

  /* lightbox -------------------------------------------------- */

  function showPhoto() {
    if (!lbItem || !lbItem.images.length) return;
    var multi = lbItem.images.length > 1;

    lbImg.src = src(lbItem.images[lbIndex]);
    lbImg.alt = lbItem.title + ' — photo ' + (lbIndex + 1);
    lbTitle.textContent = lbItem.title;
    lbCount.textContent = multi ? (lbIndex + 1) + ' / ' + lbItem.images.length : '';

    lbPrev.hidden = !multi;
    lbNext.hidden = !multi;

    // book the exact photo they are looking at
    lbBook.href = waLink(lbItem, lbIndex + 1);

    // restart the fade-in on each change
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
  }

  function step(n) {
    if (!lbItem) return;
    var len = lbItem.images.length;
    if (!len) return;
    lbIndex = (lbIndex + n + len) % len;
    showPhoto();
  }

  function openLightbox(item, index) {
    if (!item.images.length) return;
    lbItem = item;
    lbIndex = Math.min(index || 0, item.images.length - 1);
    lastFocus = document.activeElement;

    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showPhoto();
    lbClose.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    lbItem = null;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });
  lbClose.addEventListener('click', closeLightbox);

  // click the backdrop (not the photo or a button) to close
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb__stage') ||
        e.target.classList.contains('lb__figure') || e.target.classList.contains('lb__bar')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'Tab') {                    // keep focus inside the dialog
      var focusable = [lbClose, lbPrev, lbNext, lbBook].filter(function (el) { return !el.hidden; });
      var i = focusable.indexOf(document.activeElement);
      e.preventDefault();
      var nextIdx = e.shiftKey
        ? (i <= 0 ? focusable.length - 1 : i - 1)
        : (i === focusable.length - 1 ? 0 : i + 1);
      focusable[nextIdx].focus();
    }
  });

  /* swipe inside the lightbox */
  var lx = 0, ly = 0;
  lb.addEventListener('touchstart', function (e) {
    lx = e.touches[0].clientX;
    ly = e.touches[0].clientY;
  }, { passive: true });

  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - lx;
    var dy = e.changedTouches[0].clientY - ly;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();   // swipe down to dismiss
  }, { passive: true });

  /* filters --------------------------------------------------- */

  function applyFilter(key) {
    var shown = 0;
    Array.prototype.forEach.call(grid.children, function (card) {
      var match = key === 'all' || card.dataset.cats.split(' ').indexOf(key) > -1;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        shown++;
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
      }
    });
    emptyMsg.hidden = shown > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      applyFilter(chip.dataset.filter);
    });
  });

  /* boot ------------------------------------------------------ */

  var frag = document.createDocumentFragment();
  SERVICES.forEach(function (item, i) {
    var card = buildCard(item);
    card.style.animationDelay = (i * 60) + 'ms';
    frag.appendChild(card);
  });
  grid.appendChild(frag);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* general (no specific service) WhatsApp entry points */
  Array.prototype.forEach.call(document.querySelectorAll('[data-wa]'), function (el) {
    el.href = waLink(null);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-wa-number]'), function (el) {
    el.textContent = WA_DISPLAY;
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-wa-icon]'), function (el) {
    el.innerHTML = WA_ICON + el.innerHTML;
  });

  /* Reveal the floating button only once the hero (and its own WhatsApp
     button) has scrolled away, so it never covers the intro. */
  var fab  = document.querySelector('.fab');
  var hero = document.getElementById('top');
  if (fab && hero) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        fab.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { rootMargin: '-70% 0px 0px 0px' }).observe(hero);
    } else {
      fab.classList.add('is-visible');   // no observer support: always show it
    }
  }
})();
