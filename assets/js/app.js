/* ============================================================
   Creative Nails — catalogue logic
   Vanilla JS, no dependencies. Renders cards from SERVICES,
   grouped into the CATEGORIES below, and handles the filter
   chips, per-card carousels and the gallery lightbox.
   ============================================================ */

(function () {
  'use strict';

  var IMG_DIR = 'assets/images/';

  /* WhatsApp — the one place to change the booking number.
     WA_NUMBER is digits only, in full international form (no +, spaces or dashes).
     Instagram, Google Maps and the street address live in index.html. */
  var WA_NUMBER  = '201032279348';
  var WA_DISPLAY = '+20 10 32279348';

  var WA_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
      '<path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/>' +
      '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.69 8.23-8.24 8.23z"/>' +
    '</svg>';

  /* ----------------------------------------------------------
     Placeholder icons — drawn on the card of a service that has
     no photo yet. Pick one per service with `icon:`; every
     category also has a default, so `icon` is optional.
     ---------------------------------------------------------- */
  var ICONS = {
    polish:
      '<path d="M10 2.8h4v3.4h-4z"/>' +
      '<path d="M8.6 6.2h6.8a2.4 2.4 0 0 1 2.4 2.4v10.2a2.2 2.2 0 0 1-2.2 2.2H8.4a2.2 2.2 0 0 1-2.2-2.2V8.6a2.4 2.4 0 0 1 2.4-2.4z"/>' +
      '<path d="M6.2 11.4h11.6"/>',
    hand:
      '<path d="M8 12.4V5.6a1.5 1.5 0 0 1 3 0v5.3"/>' +
      '<path d="M11 10.9V4.4a1.5 1.5 0 0 1 3 0v6.5"/>' +
      '<path d="M14 10.9V6.6a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-2.1a1.5 1.5 0 0 1 3 0v1.2"/>',
    foot:
      '<path d="M7.6 4.8C7.6 3.2 8.9 2.2 10.7 2.2c3.4 0 6 3.1 6 7 0 2-.7 3.3-.7 4.8 0 1.4.6 2.1.6 3.4 0 2.5-1.8 4.4-4.4 4.4-2.9 0-4.7-1.7-4.7-4.3 0-2 .8-3.2.8-5 0-2.1-.7-3-.7-4.9z"/>' +
      '<circle cx="18.4" cy="4.9" r="1.15"/><circle cx="20.3" cy="8" r="1"/><circle cx="20.7" cy="11.2" r=".9"/>',
    face:
      '<path d="M12 2.8a7.2 7.2 0 0 1 7.2 7.2v2.2A7.2 7.2 0 0 1 12 19.4a7.2 7.2 0 0 1-7.2-7.2V10A7.2 7.2 0 0 1 12 2.8z"/>' +
      '<path d="M9.2 10.4h.02M14.8 10.4h.02"/>' +
      '<path d="M9.6 14.6c.7.7 1.6 1.05 2.4 1.05s1.7-.35 2.4-1.05"/>',
    wax:
      '<path d="M12 2.6s6.1 6.7 6.1 10.6A6.1 6.1 0 0 1 12 19.3a6.1 6.1 0 0 1-6.1-6.1C5.9 9.3 12 2.6 12 2.6z"/>' +
      '<path d="M9.2 13.4a2.8 2.8 0 0 0 2.8 2.8"/>',
    sparkle:
      '<path d="M12 2.6l2 6.4 6.4 2-6.4 2-2 6.4-2-6.4-6.4-2 6.4-2z"/>' +
      '<path d="M18.6 15.4l.75 2.35 2.35.75-2.35.75-.75 2.35-.75-2.35-2.35-.75 2.35-.75z"/>'
  };

  /* ----------------------------------------------------------
     Categories — the catalogue sections, in display order.
     key      : matches a chip in index.html and a service's `group`
     icon     : default placeholder icon for services in this section
     featured : gives the section its highlighted magenta frame
     ---------------------------------------------------------- */
  var CATEGORIES = [
    {
      key: 'signature',
      title: 'Signature Sets & Nail Art',
      sub: 'Shot at real appointments — tap any photo for the full gallery.',
      icon: 'sparkle'
    },
    {
      key: 'basic',
      title: 'Nails — Basic Care',
      sub: 'Classic polish, manicure and pedicure.',
      icon: 'polish'
    },
    {
      key: 'gelext',
      title: 'Nails — Gel & Extension',
      sub: 'Gel polish, hard gel, extensions and safe removals.',
      icon: 'polish'
    },
    {
      key: 'design',
      title: 'Nails — Custom Design',
      sub: 'Add art to any set — every nail, or just one.',
      icon: 'sparkle'
    },
    {
      key: 'bundles',
      title: 'Nails — Bundles',
      sub: 'Several services in one appointment, at a better price.',
      icon: 'sparkle',
      featured: true
    },
    {
      key: 'mens',
      title: 'Men’s Care',
      sub: 'Medical-grade hand and foot care.',
      icon: 'hand'
    },
    {
      key: 'facial',
      title: 'Facial & Hair Removal',
      sub: 'Shaping, threading and waxing.',
      icon: 'face'
    }
  ];

  /* ----------------------------------------------------------
     Data — edit here to add, reprice or re-photograph a service.

     group    : which CATEGORIES section the card sits in
     category : the small label above the title (scope, e.g. "Hands Only")
     price    : current price in EGP
     was      : original price (optional) -> renders a sale badge
     images[] : first entry is the cover photo. LEAVE IT EMPTY and the
                card falls back to the branded "photo coming soon"
                placeholder — never a broken image or a blank gap.
                To add a real photo later: drop the file into
                assets/images/ and list its filename here. Nothing
                else needs to change.
     focus    : crop focal point for tall photos, as an object-position
                value like '50% 20%' (lower Y = keep more of the top).
                Cards crop to 3:4, so this is how you stop a face or a
                detail being cut off. Optional; defaults to centre.
     icon     : placeholder icon override (see ICONS above)
     featured : highlights the card (gold/magenta frame + tag)
     cats[]   : extra filter buckets on top of `group`; `promotions`
                is added automatically for anything with a `was` price.
     ---------------------------------------------------------- */
  var SERVICES = [

    /* ---------- Signature sets & nail art (photographed) ---------- */
    {
      id: 'creativenails-design',
      title: 'creativenalis Design',
      category: 'Signature',
      group: 'signature',
      price: 1250,
      was: 1400,
      tag: 'Signature',
      featured: true,
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
      id: 'hard-gel-extension',
      title: 'Hard Gel with Extension',
      category: 'Extensions',
      group: 'signature',
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
      id: 'cat-eye',
      title: 'X_gel with Design — Cat Eye',
      category: 'Designs',
      group: 'signature',
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
      group: 'signature',
      price: 700,
      was: 900,
      cats: ['designs', 'gel'],
      images: ['X_gel With Design Cat Eye Silver and Gold.png']
    },
    {
      id: 'gel-polish-natural',
      title: 'Gel Polish on Natural Nails',
      category: 'Gel Polish',
      group: 'signature',
      price: 850,
      cats: ['gel'],
      images: ['Gel polish on natural nails.png']
    },
    {
      id: 'hard-gel-promo',
      title: 'Hard Gel with Extension — Full Designs',
      category: 'Extensions',
      group: 'signature',
      price: 700,
      was: 800,
      tag: 'Promo · Full Designs',
      desc: 'Promotional tier of the hard gel extension set, with full designs included.',
      cats: ['extensions', 'designs'],
      images: ['Hard gel with extension form.png']
    },

    /* ---------- Nails — Basic Care ---------- */
    {
      id: 'classic-polish-hands',
      title: 'Classic / Regular Polish',
      category: 'Hands Only',
      group: 'basic',
      price: 250,
      icon: 'polish',
      cats: [],
      images: ['hero/5.webp']
    },
    {
      id: 'classic-polish-feet',
      title: 'Classic / Regular Polish',
      category: 'Feet Only',
      group: 'basic',
      price: 250,
      icon: 'polish',
      cats: [],
      images: ['hero/10.webp']
    },
    {
      id: 'manicure',
      title: 'Manicure',
      category: 'Hands Only',
      group: 'basic',
      price: 350,
      icon: 'hand',
      desc: 'Cuticle cleaning, shaping and nail care, softening scrub, hydration, a warm water soak and moisturizing lotion.',
      cats: [],
      images: ['hero/1.webp']
    },
    {
      id: 'pedicure',
      title: 'Pedicure',
      category: 'Feet Only',
      group: 'basic',
      price: 500,
      icon: 'foot',
      desc: 'Cuticle cleaning, shaping and nail care, softening scrub, hydration, a warm water soak and moisturizing lotion.',
      cats: [],
      images: ['hero/8.webp']
    },
    {
      id: 'mani-pedi',
      title: 'Manicure + Pedicure',
      category: 'Hands & Feet',
      group: 'basic',
      price: 700,
      tag: 'Creative Offer',
      featured: true,
      icon: 'sparkle',
      desc: 'Both treatments in one visit — cuticle care, shaping, softening scrub, warm soak and moisturizing lotion for hands and feet.',
      cats: [],
      images: ['hero/9.webp']
    },

    /* ---------- Nails — Gel & Extension ---------- */
    {
      id: 'gel-removal-hands',
      title: 'Gel Removal',
      category: 'Hands Only',
      group: 'gelext',
      price: 250,
      icon: 'hand',
      cats: ['gel'],
      images: []
    },
    {
      id: 'gel-removal-feet',
      title: 'Gel Removal',
      category: 'Feet Only',
      group: 'gelext',
      price: 250,
      icon: 'foot',
      cats: ['gel'],
      images: []
    },
    {
      id: 'extension-removal-hands',
      title: 'Extension Removal',
      category: 'Hands Only',
      group: 'gelext',
      price: 300,
      icon: 'hand',
      cats: ['extensions'],
      images: []
    },
    {
      id: 'mani-gel-polish',
      title: 'Manicure + Gel Polish',
      category: 'Hands Only',
      group: 'gelext',
      price: 850,
      icon: 'polish',
      cats: ['gel'],
      images: ['hero/6.webp']
    },
    {
      id: 'pedi-gel-polish',
      title: 'Pedicure + Gel Polish',
      category: 'Feet Only',
      group: 'gelext',
      price: 900,
      icon: 'polish',
      cats: ['gel'],
      images: []
    },
    {
      id: 'mani-hard-gel',
      title: 'Manicure + Hard Gel',
      category: 'Hands Only',
      group: 'gelext',
      price: 1050,
      icon: 'polish',
      cats: ['gel'],
      images: ['hero/7.webp']
    },
    {
      id: 'pedi-hard-gel',
      title: 'Pedicure + Hard Gel',
      category: 'Feet Only',
      group: 'gelext',
      price: 950,
      icon: 'polish',
      cats: ['gel'],
      images: []
    },
    {
      id: 'mani-hard-gel-ex',
      title: 'Manicure + Hard Gel Ex',
      category: 'Hands Only',
      group: 'gelext',
      price: 1200,
      icon: 'polish',
      cats: ['gel', 'extensions'],
      images: []
    },
    {
      id: 'x-gel-extension',
      title: 'X Gel Extension',
      category: 'Full Set',
      group: 'gelext',
      price: 1150,
      desc: 'Full nail gel extension.',
      icon: 'polish',
      cats: ['extensions', 'gel'],
      images: []
    },

    /* ---------- Nails — Custom Design ---------- */
    {
      id: 'full-design',
      title: 'Full Design',
      category: 'All Nails',
      group: 'design',
      price: 250,
      desc: 'Check our Instagram or scan the QR for the design catalogue.',
      icon: 'sparkle',
      cats: ['designs'],
      images: []
    },
    {
      id: 'single-nail-design',
      title: 'Single Nail Design',
      category: 'Per Nail',
      group: 'design',
      price: 50,
      desc: 'Check our Instagram or scan the QR for the design catalogue.',
      icon: 'sparkle',
      cats: ['designs'],
      images: []
    },

    /* ---------- Nails — Bundles ---------- */
    {
      id: 'creative-bundle',
      title: 'Creative Bundle — Manicure + Pedicure + Gel Polish',
      category: 'Hands & Feet',
      group: 'bundles',
      price: 1600,
      tag: 'Best Value',
      featured: true,
      desc: 'The full session: manicure and pedicure with gel polish on both hands and feet.',
      icon: 'sparkle',
      cats: ['gel'],
      images: []
    },
    {
      id: 'combo-bundle',
      title: 'Hard Gel, Gel Polish, Classic Polish & Design',
      category: 'Bundle',
      group: 'bundles',
      price: 700,
      tag: 'Bundle',
      desc: 'Four services combined in a single appointment.',
      cats: ['gel', 'designs', 'extensions'],
      images: ['Hard gel, gel polish, classic polish, design.png']
    },

    /* ---------- Men's Care ---------- */
    {
      id: 'mens-medical-pedicure',
      title: 'Men’s Medical Pedicure',
      category: 'Feet Only',
      group: 'mens',
      price: 600,
      desc: 'Professional medical-grade foot care for men.',
      icon: 'foot',
      cats: [],
      images: ['hero/11.webp', 'hero/12.webp']
    },
    {
      id: 'mens-medical-manicure',
      title: 'Men’s Medical Manicure',
      category: 'Hands Only',
      group: 'mens',
      price: 400,
      desc: 'Professional medical-grade hand and nail care for men.',
      icon: 'hand',
      cats: [],
      images: ['hero/13.webp', 'hero/14.webp']
    },

    /* ---------- Facial & Hair Removal ---------- */
    {
      id: 'full-facial',
      title: 'Full Facial',
      category: 'Hair Removal',
      group: 'facial',
      price: 400,
      icon: 'face',
      cats: [],
      images: []
    },
    {
      id: 'eyebrow-shaping',
      title: 'Eyebrow Shaping',
      category: 'Hair Removal',
      group: 'facial',
      price: 200,
      icon: 'face',
      cats: [],
      images: ['facial/eyebrow-shaping.webp']
    },
    {
      id: 'upper-lip',
      title: 'Upper Lip',
      category: 'Hair Removal',
      group: 'facial',
      price: 100,
      focus: '50% 16%',
      icon: 'face',
      cats: [],
      images: ['facial/upper-lip.webp']
    },
    {
      id: 'chin',
      title: 'Chin',
      category: 'Hair Removal',
      group: 'facial',
      price: 100,
      icon: 'face',
      cats: [],
      images: ['facial/chin.webp']
    },
    {
      id: 'wax-half-hand',
      title: 'Wax — Half Hand',
      category: 'Hair Removal',
      group: 'facial',
      price: 300,
      icon: 'wax',
      cats: [],
      images: ['facial/wax-half-hand.webp']
    },
    {
      id: 'wax-half-leg',
      title: 'Wax — Half Leg',
      category: 'Hair Removal',
      group: 'facial',
      price: 350,
      icon: 'wax',
      cats: [],
      images: ['facial/wax-half-leg.webp']
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

  /* A service has a photo only while at least one filename survives.
     Files that fail to load are dropped below, so a card can fall back
     to the placeholder at runtime too. */
  function hasPhoto(item) {
    return !!(item.images && item.images.length);
  }

  function catByKey(key) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].key === key) return CATEGORIES[i];
    }
    return null;
  }

  function iconFor(item) {
    var cat = catByKey(item.group);
    return ICONS[item.icon] || (cat && ICONS[cat.icon]) || ICONS.sparkle;
  }

  /* Builds a wa.me link with the enquiry already typed out for the
     customer. `photo` (1-based) is added when they ask from the gallery,
     so Lilo knows exactly which design they mean. */
  function waLink(item, photo) {
    var msg;
    if (!item) {
      msg = 'Hi Lilo! I found Creative Nails online and I would like to ask about your services.';
    } else {
      msg = 'Hi Lilo! I would like to book *' + item.title + '*'
          + (item.category ? ' — ' + item.category : '')
          + ' (' + money(item.price) + ')'
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
    var c = (item.cats || []).slice();
    if (item.group && c.indexOf(item.group) === -1) c.push(item.group);
    if (isPromo(item) && c.indexOf('promotions') === -1) c.push('promotions');
    return c;
  }

  /* placeholder ---------------------------------------------- */

  /* The branded stand-in for a service with no photo yet: blush
     gradient, the category icon and a quiet caption. There is no
     <img>, so a missing photo can never render a broken frame. */
  function placeholderMedia(item, badges) {
    return '<div class="card__media card__media--empty">' +
             (badges || '') +
             '<div class="ph" aria-hidden="true">' +
               '<span class="ph__icon">' +
                 '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" ' +
                      'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
                   iconFor(item) +
                 '</svg>' +
               '</span>' +
               '<span class="ph__label">Photo coming soon</span>' +
             '</div>' +
           '</div>';
  }

  /* card rendering ------------------------------------------- */

  /* Only the very first cover on the page is worth fetching eagerly —
     with 30+ cards, everything else waits until it scrolls near. */
  var coversDrawn = 0;

  function buildCard(item) {
    var photos = hasPhoto(item);
    var multi  = photos && item.images.length > 1;
    var card   = document.createElement('article');

    card.className = 'card' +
      (item.featured ? ' card--featured' : '') +
      (photos ? '' : ' card--nophoto');
    card.dataset.cats = catsOf(item).join(' ');
    card.dataset.id = item.id;

    var badges = '';
    if (isPromo(item)) badges += '<span class="badge badge--sale">Save ' + (item.was - item.price) + '</span>';
    if (item.tag)      badges += '<span class="badge badge--tag">' + esc(item.tag) + '</span>';
    var badgeBlock = badges ? '<div class="badges">' + badges + '</div>' : '';

    var media;

    if (!photos) {
      media = placeholderMedia(item, badgeBlock);
    } else {
      var lead  = (coversDrawn++ === 0);
      /* Cards crop to 3:4, so a tall photo loses its top and bottom.
         `focus` moves the crop window — see the note in SERVICES. */
      var focus = item.focus ? ' style="object-position:' + esc(item.focus) + '"' : '';

      var slides = item.images.map(function (file, i) {
        var eager = (i === 0 && lead);
        return '<div class="card__slide">' +
                 '<img src="' + src(file) + '" alt="' + esc(item.title) + ' — photo ' + (i + 1) + '"' +
                      (eager ? ' fetchpriority="high"' : ' loading="lazy"') +
                      ' decoding="async" data-file="' + esc(file) + '"' + focus + '>' +
               '</div>';
      }).join('');

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

      media =
        '<div class="card__media" role="button" tabindex="0" aria-label="Open gallery for ' + esc(item.title) + '">' +
          '<div class="card__slides">' + slides + '</div>' +
          badgeBlock +
          countPill +
          arrows +
          dots +
        '</div>';
    }

    var priceRow = '<span class="price"><small>EGP</small>' +
        item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      '</span>' +
      (isPromo(item) ? '<span class="price--was">' + money(item.was) + '</span>' : '');

    card.innerHTML =
      media +
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
    /* WhatsApp enquiry — let the link open, just don't bubble to the card */
    card.querySelector('.wa').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    var media = card.querySelector('.card__media');
    var track = card.querySelector('.card__slides');
    if (!media || !track) return;          // placeholder card — nothing to wire

    var dots  = Array.prototype.slice.call(card.querySelectorAll('.car__dot'));
    var prev  = card.querySelector('.car__nav--prev');
    var next  = card.querySelector('.car__nav--next');
    var index = 0;

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

    /* Drop any photo that fails to load (e.g. an empty/corrupt file) so
       the carousel never shows a broken frame. When the last one goes,
       swap the whole card over to the branded placeholder. */
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
        if (n === 0) {
          var badges = card.querySelector('.badges');
          media.outerHTML = placeholderMedia(item, badges ? badges.outerHTML : '');
          card.classList.add('card--nophoto');
          return;
        }
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
    if (!hasPhoto(item)) return;
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

  var groupEls = [];

  /* Hides the cards that don't match, then any section left empty,
     so the page never shows a heading with nothing under it. */
  function applyFilter(key) {
    var shown = 0;

    groupEls.forEach(function (section) {
      var inGroup = 0;
      Array.prototype.forEach.call(section.querySelectorAll('.card'), function (card) {
        var match = key === 'all' || card.dataset.cats.split(' ').indexOf(key) > -1;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          inGroup++;
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
        }
      });
      section.classList.toggle('is-hidden', inGroup === 0);
      shown += inGroup;
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

      // keep the chip bar and the first result together on a phone
      var top = document.getElementById('catalogue');
      if (top && window.pageYOffset > top.offsetTop) {
        window.scrollTo({ top: top.offsetTop, behavior: 'smooth' });
      }

      // centre the chosen chip in the scrolling bar
      if (chip.scrollIntoView) {
        chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  });

  /* boot ------------------------------------------------------ */

  var order = 0;

  CATEGORIES.forEach(function (cat) {
    var items = SERVICES.filter(function (s) { return s.group === cat.key; });
    if (!items.length) return;

    var section = document.createElement('section');
    section.className = 'group' + (cat.featured ? ' group--featured' : '');
    section.id = 'cat-' + cat.key;
    section.dataset.group = cat.key;

    section.innerHTML =
      '<header class="group__head">' +
        '<p class="group__eyebrow">' +
          '<span class="group__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
                 'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
              (ICONS[cat.icon] || ICONS.sparkle) +
            '</svg>' +
          '</span>' +
          '<span>' + esc(cat.title) + '</span>' +
        '</p>' +
        (cat.sub ? '<p class="group__sub">' + esc(cat.sub) + '</p>' : '') +
      '</header>' +
      '<div class="grid"></div>';

    var inner = section.querySelector('.grid');
    items.forEach(function (item) {
      var card = buildCard(item);
      card.style.animationDelay = (Math.min(order++, 10) * 55) + 'ms';
      inner.appendChild(card);
    });

    groupEls.push(section);
    grid.appendChild(section);
  });

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
})();
