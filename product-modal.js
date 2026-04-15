/**
 * JB Furniture — Product Detail Modal + Enquiry Basket
 * Premium 3D interactions, quick view, WhatsApp enquiry
 */
(function () {
  'use strict';

  // ─── ENQUIRY BASKET ───
  let basket = [];
  try { const _s = window['local'+'Storage']; if (_s) basket = JSON.parse(_s.getItem('jb_basket') || '[]'); } catch(e) {}
  const basketCountEl = document.getElementById('basket-count');
  const basketPanel = document.getElementById('basket-panel');
  const basketToggle = document.getElementById('basket-toggle');
  const basketItems = document.getElementById('basket-items');
  const basketEmpty = document.getElementById('basket-empty');
  const basketSend = document.getElementById('basket-send');
  const basketClear = document.getElementById('basket-clear');

  function updateBasketUI() {
    if (!basketCountEl) return;
    basketCountEl.textContent = basket.length;
    basketCountEl.style.display = basket.length > 0 ? 'flex' : 'none';

    if (basketItems) {
      if (basket.length === 0) {
        basketItems.innerHTML = '';
        if (basketEmpty) basketEmpty.style.display = '';
        if (basketSend) basketSend.style.display = 'none';
        if (basketClear) basketClear.style.display = 'none';
      } else {
        if (basketEmpty) basketEmpty.style.display = 'none';
        if (basketSend) basketSend.style.display = '';
        if (basketClear) basketClear.style.display = '';
        basketItems.innerHTML = basket.map((item, i) => `
          <div class="basket-item">
            <div class="basket-item__img">${item.image ? `<img src="./images/${item.image}" alt="" width="60" height="45" loading="lazy">` : `<div class="basket-item__placeholder">${item.collection || 'JB'}</div>`}</div>
            <div class="basket-item__info">
              <span class="basket-item__name">${item.name}</span>
              <span class="basket-item__price">${item.price > 0 ? '£' + item.price.toLocaleString() : 'Visit Showroom'}</span>
            </div>
            <button class="basket-item__remove" data-index="${i}" aria-label="Remove ${item.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>`).join('');
      }
    }

    // Update all add-to-basket buttons state
    document.querySelectorAll('[data-add-basket]').forEach(btn => {
      const pid = btn.dataset.addBasket;
      const inBasket = basket.some(item => item.id === pid);
      btn.classList.toggle('in-basket', inBasket);
      btn.innerHTML = inBasket
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Added'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> Add to Enquiry';
    });
  }

  function addToBasket(product) {
    if (basket.some(item => item.id === product.id)) {
      basket = basket.filter(item => item.id !== product.id);
    } else {
      basket.push({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        collection: product.collection,
        image: product.image
      });
      // Pulse animation on basket icon
      if (basketToggle) {
        basketToggle.classList.add('pulse');
        setTimeout(() => basketToggle.classList.remove('pulse'), 600);
      }
    }
    try { const _s = window['local'+'Storage']; if (_s) _s.setItem('jb_basket', JSON.stringify(basket)); } catch(e) {}
    updateBasketUI();
  }

  function sendBasketWhatsApp() {
    if (basket.length === 0) return;
    let msg = '🛋️ *JB Furniture Enquiry*\n\nHi, I\'m interested in these items:\n\n';
    basket.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}*`;
      if (item.brand) msg += ` (${item.brand})`;
      if (item.price > 0) msg += ` — £${item.price.toLocaleString()}`;
      msg += '\n';
    });
    msg += '\nPlease let me know availability and next steps. Thank you!';
    window.open(`https://wa.me/447368467512?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Basket panel toggle
  if (basketToggle && basketPanel) {
    basketToggle.addEventListener('click', () => {
      basketPanel.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (basketPanel.classList.contains('open') && !basketPanel.contains(e.target) && !basketToggle.contains(e.target)) {
        basketPanel.classList.remove('open');
      }
    });
  }
  if (basketSend) basketSend.addEventListener('click', sendBasketWhatsApp);
  if (basketClear) {
    basketClear.addEventListener('click', () => {
      basket = [];
      try { const _s = window['local'+'Storage']; if (_s) _s.setItem('jb_basket', JSON.stringify(basket)); } catch(e) {}
      updateBasketUI();
    });
  }
  if (basketItems) {
    basketItems.addEventListener('click', e => {
      const removeBtn = e.target.closest('.basket-item__remove');
      if (removeBtn) {
        const idx = parseInt(removeBtn.dataset.index);
        basket.splice(idx, 1);
        try { const _s = window['local'+'Storage']; if (_s) _s.setItem('jb_basket', JSON.stringify(basket)); } catch(e) {}
        updateBasketUI();
      }
    });
  }

  // ─── PRODUCT DETAIL MODAL ───
  const modal = document.getElementById('product-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modal) return;

  function openProductModal(product) {
    const imgSrc = product.image ? `./images/${product.image}` : '';
    const dims = product.dimensions || {};
    const mats = product.materials || [];
    const feats = product.features || [];
    const priceHTML = product.price > 0
      ? `<span class="modal__price">&pound;${product.price.toLocaleString()}</span>`
      : `<span class="modal__price modal__price--visit">Visit Showroom for Price</span>`;

    const financeHTML = product.price >= 200
      ? `<div class="modal__finance">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
           <span>From <strong>&pound;${Math.ceil(product.price / 48)}/mo</strong> with 0% finance</span>
         </div>`
      : '';

    const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} (${product.brand})${product.price > 0 ? ' — £' + product.price.toLocaleString() : ''}. Is it available?`);

    modal.innerHTML = `
      <div class="modal__container">
        <button class="modal__close" aria-label="Close product details">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="modal__body">
          <div class="modal__gallery">
            <div class="modal__image-main" id="modal-main-img">
              ${imgSrc
                ? `<img src="${imgSrc}" alt="${product.name}" width="600" height="450">`
                : `<div class="modal__image-placeholder"><span>${product.collection}<br>${product.subcategory}</span></div>`}
            </div>
            <div class="modal__image-badge">
              ${product.brand === 'Meta Sofa' || product.brand === 'Vida Living' ? `<span class="badge badge--navy">${product.brand}</span>` : ''}
            </div>
          </div>
          <div class="modal__details">
            <div class="modal__breadcrumb">${product.brand} / ${product.collection}</div>
            <h2 class="modal__title">${product.name}</h2>
            <p class="modal__desc">${product.description}</p>
            ${priceHTML}
            ${financeHTML}

            <div class="modal__specs">
              <h3 class="modal__specs-title">Dimensions</h3>
              <div class="modal__dims">
                <div class="modal__dim"><span class="modal__dim-label">Width</span><span class="modal__dim-val">${dims.w || '—'}</span></div>
                <div class="modal__dim"><span class="modal__dim-label">Height</span><span class="modal__dim-val">${dims.h || '—'}</span></div>
                <div class="modal__dim"><span class="modal__dim-label">Depth</span><span class="modal__dim-val">${dims.d || '—'}</span></div>
              </div>
            </div>

            ${mats.length ? `
            <div class="modal__specs">
              <h3 class="modal__specs-title">Materials</h3>
              <ul class="modal__mat-list">
                ${mats.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>` : ''}

            ${feats.length ? `
            <div class="modal__specs">
              <h3 class="modal__specs-title">Features</h3>
              <ul class="modal__feat-list">
                ${feats.map(f => `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${f}</li>`).join('')}
              </ul>
            </div>` : ''}

            <div class="modal__delivery">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>${product.delivery || 'FREE White Glove Delivery in Hampshire'}</span>
            </div>

            <div class="modal__actions">
              <button class="btn btn--primary btn--lg modal__add-basket" data-add-basket="${product.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Add to Enquiry
              </button>
              <a href="https://wa.me/447368467512?text=${whatsappMsg}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--lg modal__whatsapp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                Ask on WhatsApp
              </a>
            </div>

            <a href="tel:+441252985884" class="modal__call-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Or call us: 01252 985884
            </a>

            ${product.price > 0 ? `
            <div class="modal__staingard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              Includes FREE 5-Year Staingard Protection
            </div>` : ''}
          </div>
        </div>
      </div>`;

    // Bind close
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    
    // Bind add to basket
    const addBtn = modal.querySelector('.modal__add-basket');
    if (addBtn) {
      addBtn.addEventListener('click', () => addToBasket(product));
    }

    // Open
    modal.classList.add('open', 'modal--3d-enter');
    modalOverlay.classList.add('open', 'modal-overlay--blur');
    document.body.style.overflow = 'hidden';
    // Remove entrance animation class after it completes
    setTimeout(() => { modal.classList.remove('modal--3d-enter'); }, 600);
    updateBasketUI();
  }

  function closeModal() {
    modal.classList.remove('open', 'modal--3d-enter');
    modalOverlay.classList.remove('open', 'modal-overlay--blur');
    document.body.style.overflow = '';
  }

  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // ─── DELEGATE CLICK ON PRODUCT CARDS ───
  document.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    // Don't open modal if clicking the basket button
    if (e.target.closest('[data-add-basket]')) return;

    const pid = card.dataset.pid;
    if (!pid || !window.__allProducts) return;
    const product = window.__allProducts.find(p => p.id === pid);
    if (product) openProductModal(product);
  });

  // ─── 3D TILT ON PRODUCT CARDS ───
  let tiltRAF;
  document.addEventListener('mousemove', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    cancelAnimationFrame(tiltRAF);
    tiltRAF = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 8;
      const rotateY = (x - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
      
      // Shine effect
      const shine = card.querySelector('.product-card__shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
        shine.style.opacity = '1';
      }
    });
  });

  document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.product-card');
    if (card) {
      card.style.transform = '';
      const shine = card.querySelector('.product-card__shine');
      if (shine) shine.style.opacity = '0';
    }
  }, true);

  // Initialize basket on load
  updateBasketUI();

  // Expose for catalogue.js to call
  window.__addToBasket = addToBasket;
  window.__updateBasketUI = updateBasketUI;
})();
