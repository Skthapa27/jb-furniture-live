/**
 * JB Furniture — Dynamic Product Catalogue
 * Loads products.json, renders cards, handles filtering + search + pagination
 */
(function () {
  'use strict';

  const PRODUCTS_PER_PAGE = 24;
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  let activeCategory = 'all';
  let activeBrand = 'all';
  let searchQuery = '';

  // DOM elements
  const grid = document.getElementById('product-grid');
  const filterTabs = document.getElementById('filter-tabs');
  const brandTabs = document.getElementById('brand-tabs');
  const searchInput = document.getElementById('product-search');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const showingEl = document.getElementById('products-showing');
  const loadMoreWrap = document.getElementById('load-more-wrap');

  if (!grid) return;

  // ─── FETCH DATA ───
  fetch('./products.json')
    .then(r => r.json())
    .then(data => {
      allProducts = data;
      window.__allProducts = data; // Expose for modal
      init();
    })
    .catch(err => {
      console.error('Failed to load products:', err);
      grid.innerHTML = '<p style="text-align:center;padding:4rem 0;color:#666">Products loading…</p>';
    });

  function init() {
    buildFilterTabs();
    buildBrandTabs();
    applyFilters();
    bindEvents();
  }

  // ─── FILTER TABS ───
  function buildFilterTabs() {
    const cats = { all: allProducts.length };
    allProducts.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });

    const labels = { all: 'All Products', sofas: 'Sofas & Chairs', dining: 'Dining', living: 'Living Room', bedroom: 'Bedroom' };
    const order = ['all', 'sofas', 'dining', 'living', 'bedroom'];

    filterTabs.innerHTML = order.map(key =>
      `<button class="filter-btn${key === 'all' ? ' active' : ''}" data-filter="${key}">
        ${labels[key] || key} <span class="filter-count">${cats[key] || 0}</span>
      </button>`
    ).join('');
  }

  // ─── BRAND TABS ───
  function buildBrandTabs() {
    const brands = {};
    allProducts.forEach(p => {
      brands[p.brand] = (brands[p.brand] || 0) + 1;
    });

    const sorted = Object.entries(brands).sort((a, b) => b[1] - a[1]);

    brandTabs.innerHTML = `<button class="brand-btn active" data-brand="all">All Brands</button>` +
      sorted.map(([brand]) =>
        `<button class="brand-btn" data-brand="${brand}">${brand}</button>`
      ).join('');
  }

  // ─── EVENTS ───
  function bindEvents() {
    filterTabs.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      currentPage = 1;
      applyFilters();
    });

    brandTabs.addEventListener('click', e => {
      const btn = e.target.closest('.brand-btn');
      if (!btn) return;
      brandTabs.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBrand = btn.dataset.brand;
      currentPage = 1;
      applyFilters();
    });

    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchQuery = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
      }, 200);
    });

    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderProducts(false);
    });

    // Basket button delegation
    grid.addEventListener('click', e => {
      const btn = e.target.closest('[data-add-basket]');
      if (!btn) return;
      e.stopPropagation();
      const pid = btn.dataset.addBasket;
      const product = allProducts.find(p => p.id === pid);
      if (product && window.__addToBasket) {
        window.__addToBasket(product);
      }
    });
  }

  // ─── FILTER LOGIC ───
  function applyFilters() {
    filteredProducts = allProducts.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (activeBrand !== 'all' && p.brand !== activeBrand) return false;
      if (searchQuery) {
        const hay = `${p.name} ${p.brand} ${p.collection} ${p.colour} ${p.description} ${p.subcategory}`.toLowerCase();
        return hay.includes(searchQuery);
      }
      return true;
    });

    // Sort: products with images first, then by collection, then name
    filteredProducts.sort((a, b) => {
      const aImg = a.image ? 0 : 1;
      const bImg = b.image ? 0 : 1;
      if (aImg !== bImg) return aImg - bImg;
      if (a.collection !== b.collection) return a.collection.localeCompare(b.collection);
      return a.name.localeCompare(b.name);
    });

    currentPage = 1;
    renderProducts(true);
    updateShowing();
  }

  // ─── RENDER ───
  function renderProducts(replace) {
    const start = replace ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = currentPage * PRODUCTS_PER_PAGE;
    const slice = filteredProducts.slice(start, end);

    const html = slice.map(p => cardHTML(p)).join('');

    if (replace) {
      grid.innerHTML = html;
    } else {
      grid.insertAdjacentHTML('beforeend', html);
    }

    // Animate in
    requestAnimationFrame(() => {
      const newCards = grid.querySelectorAll('.product-card--entering');
      newCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.remove('product-card--entering');
        }, i * 30);
      });
    });

    updateShowing();

    // Show/hide Load More
    if (end >= filteredProducts.length) {
      loadMoreWrap.style.display = 'none';
    } else {
      loadMoreWrap.style.display = '';
    }

    // Update basket buttons after render
    if (window.__updateBasketUI) window.__updateBasketUI();
  }

  function cardHTML(p) {
    const imgSrc = p.image ? `./images/${p.image}` : '';
    const priceHTML = p.price > 0
      ? `<span class="product-card__now">&pound;${p.price.toLocaleString()}</span>`
      : `<span class="product-card__now product-card__now--visit">Visit Showroom</span>`;

    const badgeHTML = p.badges && p.badges.length
      ? p.badges.map(b => `<span class="mini-badge">${b}</span>`).join('')
      : '';

    // Pick a badge type based on properties
    let topBadge = '';
    if (p.price >= 1000) topBadge = '<div class="product-card__badge badge badge--navy">PREMIUM</div>';
    else if (p.subcategory === 'Recliners' || p.subcategory === 'Corner Sofas') topBadge = '<div class="product-card__badge badge badge--green">POPULAR</div>';

    const placeholderBg = !imgSrc ? `background:linear-gradient(135deg,#e8e4df 0%,#d4cfc8 100%);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.08em;` : '';
    const imgContent = imgSrc
      ? `<img src="${imgSrc}" alt="${p.name} by ${p.brand}" width="400" height="300" loading="lazy">`
      : `<span style="padding:2rem;text-align:center;line-height:1.4">${p.collection}<br>${p.subcategory}</span>`;

    const financeSnippet = p.price >= 200
      ? `<span class="product-card__finance">From &pound;${Math.ceil(p.price / 48)}/mo</span>`
      : '';

    return `
      <article class="product-card product-card--entering" data-category="${p.category}" data-pid="${p.id}" role="button" tabindex="0" aria-label="View ${p.name} details">
        <div class="product-card__shine"></div>
        ${topBadge}
        <div class="product-card__image" style="${placeholderBg}">
          <div class="product-card__overlay"><span class="product-card__overlay-text">Quick View</span></div>
          ${imgContent}
        </div>
        <div class="product-card__content">
          <span class="product-card__brand">${p.brand}</span>
          <h3 class="product-card__title">${p.name}</h3>
          <p class="product-card__desc">${p.description}</p>
          <div class="product-card__pricing">
            ${priceHTML}
            ${financeSnippet}
          </div>
          ${badgeHTML ? `<div class="product-card__badges">${badgeHTML}</div>` : ''}
          <button class="product-card__basket-btn card__basket-btn" data-add-basket="${p.id}" aria-label="Add ${p.name} to enquiry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Add to Enquiry
          </button>
        </div>
      </article>`;
  }

  function updateShowing() {
    const shown = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);
    showingEl.textContent = `Showing ${shown} of ${filteredProducts.length} products`;
  }

})();
