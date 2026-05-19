// Particles
(function () { const c = document.getElementById('bgParticles'); if (!c) return; for (let i = 0; i < 30; i++) { const p = document.createElement('div'); p.className = 'p'; p.style.left = Math.random() * 100 + '%'; p.style.animationDuration = (8 + Math.random() * 12) + 's'; p.style.animationDelay = Math.random() * 10 + 's'; c.appendChild(p) } })();

// Scroll animations
const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }) }, { threshold: 0.1 });
document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));

// Day
(function () { const el = document.getElementById('heroDay'); const d = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO']; if (el) el.textContent = d[new Date().getDay()] })();

// Promo timer
(function () { const el = document.getElementById('ofertaTimer'); if (!el) return; const K = 'pixOfertaTimerEnd', D = 10 * 60 * 1000; let end; try { const s = localStorage.getItem(K); end = s ? parseInt(s, 10) : null; if (!end || isNaN(end) || end < Date.now()) { end = Date.now() + D; localStorage.setItem(K, String(end)) } } catch (_) { end = Date.now() + D } function t() { const r = end - Date.now(); if (r <= 0) { el.textContent = '00:00'; return } const m = Math.floor(r / 60000), s = Math.floor((r % 60000) / 1000); el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s } t(); setInterval(t, 1000) })();

// Price from URL
(function () {
    try {
        const p = new URLSearchParams(location.search), br = p.get('br'), up = p.get('price');
        const pr = document.querySelector('.price-block__amount'), ol = document.querySelector('.price-block__old');
        if (!pr || !ol) return;
        const config = window.FUNIL_CONFIG;
        const precos = config ? config.PRECOS : { NORMAL: 12.90, PROMO_1: 12.90, PROMO_2: 9.90, ORIGINAL: 97.00 };
        const formatBrl = (val) => val.toFixed(2).replace('.', ',');
        ol.textContent = 'R$ ' + formatBrl(precos.ORIGINAL);
        if (up) {
            pr.textContent = 'R$ ' + up.replace('.', ',');
        } else if (br === '2') {
            pr.textContent = 'R$ ' + formatBrl(precos.PROMO_2);
            localStorage.setItem('backPromoMode', precos.PROMO_2.toFixed(2));
        } else if (br === '1' || p.get('promo') === 'back') {
            pr.textContent = 'R$ ' + formatBrl(precos.PROMO_1);
            localStorage.setItem('backPromoMode', precos.PROMO_1.toFixed(2));
        } else {
            pr.textContent = 'R$ ' + formatBrl(precos.NORMAL);
        }
    } catch (_) { }
})();

// Profile
(function () {
    const img = document.getElementById('pixProfileImg'), num = document.getElementById('pixProfileNumber'), name = document.getElementById('pixProfileName'); if (!img || !num) return; function fmt(n) { let d = (n || '').replace(/\D/g, ''); if (d.length > 11 && d.startsWith('55')) d = d.substring(2); if (d.length === 11) return d.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '($1) $2 $3-$4'); if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3'); return d || '(XX) XXXXX-XXXX' }
    const n = localStorage.getItem('numeroClonado'); if (n) { num.textContent = localStorage.getItem('perfilNumeroFormatado') || fmt(n); if (localStorage.getItem('perfilDisplayName')) name.textContent = localStorage.getItem('perfilDisplayName'); const fc = localStorage.getItem('perfilFotoCache'); if (fc) img.src = fc }
})();

// Core vars
const FIXED_CPF = '390.533.447-05'; const cpfInput = document.getElementById('cpf'); const btnGerarPix = document.getElementById('btnGerarPix'); const errorMsg = document.getElementById('errorMsg'); const infoMsg = document.getElementById('infoMsg'); const emailInput = document.getElementById('email');
window.__pixCopiaCola = '';
const pixPopupOverlay = document.getElementById('pixPopupOverlay'), pixPopupQrInner = document.getElementById('pixPopupQrInner'), pixPopupCopyBtn = document.getElementById('pixPopupCopyBtn'), pixPopupInfo = document.getElementById('pixPopupInfo'), pixPopupTimer = document.getElementById('pixPopupTimer');
const paidFixedBar = document.getElementById('paidFixedBar'), fixedBarContinueBtn = document.getElementById('fixedBarContinueBtn');
if (cpfInput) { cpfInput.value = FIXED_CPF; try { localStorage.setItem('pixCpf', FIXED_CPF) } catch (_) { } }

function showError(t) { errorMsg.textContent = t; errorMsg.style.display = 'block' }
function hideError() { errorMsg.style.display = 'none'; errorMsg.textContent = '' }
function showInfo(t) { infoMsg.textContent = t; infoMsg.style.display = 'block' }
function hideInfo() { infoMsg.style.display = 'none'; infoMsg.textContent = '' }
function updatePaymentUI() { const p = window.FunilUtils ? FunilUtils.verificarPagamento() : localStorage.getItem('basePaid') === 'true'; if (paidFixedBar) paidFixedBar.style.display = p ? 'block' : 'none'; try { document.body.classList.toggle('has-fixed-bar', p) } catch (_) { } }
function redirectToUpsell() { try { const e = localStorage.getItem('pixExternalId') || '', p = new URLSearchParams(location.search); if (e) p.set('oid', e); location.replace('upsell-catalogo.html' + (p.toString() ? '?' + p.toString() : '')) } catch (_) { location.replace('upsell-catalogo.html' + location.search) } }
function handleContinue() { const p = window.FunilUtils ? FunilUtils.verificarPagamento() : localStorage.getItem('basePaid') === 'true'; if (p) redirectToUpsell(); else checkPaymentStatus(true) }

function setLoading(l) { btnGerarPix.disabled = l; btnGerarPix.style.opacity = l ? '0.7' : '1'; if (l) { btnGerarPix.innerHTML = '<div class="qr-spinner" style="width:20px;height:20px;border-width:2px"></div><span>Gerando...</span>' } else { btnGerarPix.innerHTML = '<svg viewBox="0 0 999.9967041 1000" width="22" height="22" fill="currentColor"><path d="M220.13,764.99c39.23,0,76.13-15.28,103.88-43.01l149.99-149.99c10.53-10.56,28.88-10.53,39.41,0l150.53,150.53c27.75,27.74,64.64,43.01,103.89,43.01h29.55L607.42,955.51c-59.33,59.32-155.52,59.32-214.85,0L202.07,764.99H220.13z"/><path d="M767.82,234.46c-39.23,0-76.13,15.28-103.88,43.01L513.41,428.03c-10.84,10.84-28.55,10.89-39.41-0.01L324.01,278.01c-27.75-27.72-64.64-43.01-103.89-43.01h-18.06L392.57,44.5c59.32-59.33,155.52-59.33,214.84,0l189.96,189.96H767.82z"/><path d="M44.49,392.58l113.47-113.47h62.17c27.06,0,53.55,10.97,72.67,30.11l149.99,149.99c14.03,14.03,32.48,21.06,50.91,21.06s36.86-7.02,50.9-21.04L695.15,308.67c19.12-19.13,45.6-30.11,72.67-30.11l73.65-0.01l114.03,114.03c59.33,59.32,59.33,155.52,0,214.84L841.48,721.44h-73.66c-27.07,0-53.55-10.97-72.67-30.11L544.61,540.8c-27.2-27.18-74.64-27.2-101.82,0.01L292.8,690.78c-19.12,19.13-45.61,30.11-72.67,30.11h-62.17L44.49,607.42C-14.83,548.1-14.83,451.9,44.49,392.58z"/></svg><span>LIBERAR ACESSO IMEDIATO</span>' } }

// Generate PIX
// Generate PIX (now Redirects to Checkout)
btnGerarPix.addEventListener('click', function (e) {
    e.preventDefault(); hideError(); hideInfo();
    const p = window.FunilUtils ? FunilUtils.verificarPagamento() : localStorage.getItem('basePaid') === 'true';
    if (p) { showInfo('Pagamento já confirmado. Redirecionando...'); checkPaymentStatus(); return }
    setLoading(true); showInfo('Redirecionando para o checkout...');
    
    let a = document.querySelector('.price-block__amount')?.textContent || '12,90'; 
    a = a.replace(/[^0-9,\.]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(a)) a = '12.90';
    
    const productId = (a === '9.90') ? 'WtsCuA' : 'RkzPwe';
    const link = `https://pay.lowify.com.br/checkout?product_id=${productId}`;
    
    window.location.href = window.FunilUtils ? FunilUtils.construirURL(link) : link;
});

// Popup QR
let pixTimerInt = null;
function openPixPopup(cc) {
    if (!pixPopupOverlay) return; pixPopupOverlay.style.display = 'flex'; document.body.style.overflow = 'hidden';
    if (pixPopupCopyBtn) pixPopupCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Copiar Código Pix</span>';
    if (pixPopupInfo) { pixPopupInfo.style.display = 'none'; pixPopupInfo.className = 'popup-info' }
    if (pixPopupQrInner) { pixPopupQrInner.innerHTML = '<div class="qr-loading-wrapper"><div class="qr-spinner"></div></div>'; setTimeout(() => renderQr(pixPopupQrInner, cc, 200), 100) }
    startPopupTimer()
}
function closePixPopup() { if (pixPopupOverlay) pixPopupOverlay.style.display = 'none'; document.body.style.overflow = ''; if (pixTimerInt) { clearInterval(pixTimerInt); pixTimerInt = null } }
function renderQr(el, data, sz) { try { if (window.QRCode && typeof QRCode.toCanvas === 'function') { const c = document.createElement('canvas'); QRCode.toCanvas(c, data, { width: sz, margin: 1 }, function (err) { if (err) throw err; el.innerHTML = ''; c.className = 'qr-fade-in'; el.appendChild(c) }) } else throw 0 } catch (_) { try { const img = new Image(); img.width = sz; img.height = sz; img.alt = 'QR'; img.className = 'qr-fade-in'; img.referrerPolicy = 'no-referrer'; img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=' + sz + 'x' + sz + '&data=' + encodeURIComponent(data); el.innerHTML = ''; el.appendChild(img) } catch (_) { } } }
function startPopupTimer() { if (pixTimerInt) clearInterval(pixTimerInt); let s = 900; function u() { const m = String(Math.floor(s / 60)).padStart(2, '0'), sc = String(s % 60).padStart(2, '0'); if (pixPopupTimer) pixPopupTimer.textContent = m + ':' + sc; if (s > 0) s-- } u(); pixTimerInt = setInterval(u, 1000) }
if (pixPopupCopyBtn) pixPopupCopyBtn.addEventListener('click', function () { const c = (window.__pixCopiaCola || '').trim(); if (!c) return; navigator.clipboard.writeText(c).then(() => { pixPopupCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="margin-right:6px"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Código Copiado!</span>'; if (pixPopupInfo) { pixPopupInfo.textContent = 'Código copiado! Abra seu banco e use Pix Copia e Cola.'; pixPopupInfo.className = 'popup-info success'; pixPopupInfo.style.display = 'block' } setTimeout(() => { if (pixPopupCopyBtn) pixPopupCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="margin-right:6px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Copiar Código Pix</span>' }, 3000) }) });

// Payment check
function checkPaymentStatus(redir = true) {
    const ext = localStorage.getItem('pixExternalId'); if (!ext) { hideError(); hideInfo(); return }
    fetch('check_payment.php?external_id=' + encodeURIComponent(ext)).then(r => r.json()).then(d => {
        if (d.error) { showError('Erro: ' + d.error); return }
        if (d.is_paid) {
            const mode = (localStorage.getItem('backPromoMode') || '').trim(), settled = localStorage.getItem('remainingSettled') === 'true', isRem = localStorage.getItem('backIsRemainingFlow') === 'true', pa = parseFloat((localStorage.getItem('pixAmount') || '').replace(',', '.')) || 0;
            if (mode && !settled && pa >= 5) {
                if (!isRem && pa > 0 && pa < 12.9) { const due = Math.max(0, 12.9 - pa); localStorage.setItem('basePaidPartial', 'true'); localStorage.setItem('backRemainingDue', due.toFixed(2)); localStorage.removeItem('pixExternalId'); try { closePixPopup() } catch (_) { } openBackModal(); return }
                if (isRem && pa > 0) { localStorage.setItem('remainingSettled', 'true'); localStorage.setItem('basePaid', 'true'); localStorage.removeItem('backIsRemainingFlow') }
            } else { localStorage.setItem('basePaid', 'true') }
            updatePaymentUI(); try { closePixPopup() } catch (_) { }
            if (redir) { showInfo('Pagamento confirmado! Redirecionando...'); setTimeout(redirectToUpsell, 600) }
        } else hideInfo()
    }).catch(() => showError('Erro ao conectar.'))
}

let __pi = null;
function startAutoCheck() { if (__pi) return; const ext = localStorage.getItem('pixExternalId'); if (!ext) return; setupEventStream(ext); setTimeout(() => { const p = window.FunilUtils ? FunilUtils.verificarPagamento() : localStorage.getItem('basePaid') === 'true'; if (!p) checkPaymentStatus(true) }, 2000); __pi = setInterval(() => { const p = window.FunilUtils ? FunilUtils.verificarPagamento() : localStorage.getItem('basePaid') === 'true'; if (p) { clearInterval(__pi); __pi = null; return } checkPaymentStatus(true) }, 5000) }
function setupEventStream(ext) { try { if (!window.EventSource || !ext) return; if (window.__pixSSE) try { window.__pixSSE.close() } catch (_) { } const es = new EventSource('requisicao/payment_stream.php?external_id=' + encodeURIComponent(ext)); window.__pixSSE = es; es.addEventListener('status', function (ev) { try { const d = JSON.parse(ev.data || '{}'); if (d && d.paid) checkPaymentStatus(true) } catch (_) { } }); es.addEventListener('end', () => { try { es.close() } catch (_) { } }); es.addEventListener('error', () => { try { es.close() } catch (_) { } }) } catch (_) { } }

// Init
document.addEventListener('DOMContentLoaded', function () {
    startAutoCheck(); updatePaymentUI();
    try { const mode = (localStorage.getItem('backPromoMode') || '').trim(), partial = localStorage.getItem('basePaidPartial') === 'true', settled = localStorage.getItem('remainingSettled') === 'true', pa = parseFloat((localStorage.getItem('pixAmount') || '').replace(',', '.')) || 0; if (mode && partial && !settled && pa >= 5) openBackModal() } catch (_) { }
    if (localStorage.getItem('basePaid') === 'true') { showInfo('Pagamento confirmado. Redirecionando...'); setTimeout(redirectToUpsell, 700) }
    const vr = () => { try { if (document.visibilityState === 'visible' && localStorage.getItem('basePaid') !== 'true') checkPaymentStatus(true) } catch (_) { } }; window.addEventListener('focus', vr); document.addEventListener('visibilitychange', vr)
});
if (fixedBarContinueBtn) fixedBarContinueBtn.addEventListener('click', handleContinue);

// FAQ
(function () { const faq = document.getElementById('faq'); if (!faq) return; const items = faq.querySelectorAll('.faq-item'); items.forEach(item => { const btn = item.querySelector('.faq-question'); if (!btn) return; btn.addEventListener('click', () => { const a = item.classList.contains('active'); items.forEach(i => i.classList.remove('active')); if (!a) item.classList.add('active') }) }) })();

// Carousel
(function () {
    const c = document.getElementById('depCarousel'); if (!c) return; c.querySelectorAll('video').forEach(v => { v.addEventListener('loadedmetadata', () => { if (v.currentTime === 0) v.currentTime = 0.001 }) }); function cw() { const el = c.querySelector('.dep-item'); return el ? el.getBoundingClientRect().width + 10 : 160 }
    let paused = false, pt = null; function pauseFor(ms) { paused = true; clearTimeout(pt); pt = setTimeout(() => { paused = false }, ms) }
    setInterval(() => { if (paused) return; const mx = c.scrollWidth - c.clientWidth; if (c.scrollLeft >= mx - 2) c.scrollTo({ left: 0, behavior: 'smooth' }); else c.scrollTo({ left: c.scrollLeft + cw(), behavior: 'smooth' }) }, 8000);
    const lb = document.getElementById('depLightbox'), lbBox = document.getElementById('depLightboxBox'), lbClose = document.getElementById('depLightboxClose'), lbPlay = document.getElementById('depLbPlay'), lbFill = document.querySelector('#depLbBar i'); let curV = null;
    function toggleV() { if (!curV) return; curV.paused ? curV.play() : curV.pause() }
    function openLB(item) {
        const sv = item.querySelector('video');
        const si = item.querySelector('img');
        if (!sv && !si) return;

        // Toggle video inline instead of opening lightbox
        if (sv) {
            if (sv.paused) {
                // Stop other videos
                c.querySelectorAll('video').forEach(v => {
                    if (v !== sv) {
                        v.pause();
                        v.removeAttribute('controls');
                        const ico = v.nextElementSibling;
                        if (ico && ico.classList.contains('dep-play-ico')) ico.style.display = 'flex';
                    }
                });
                sv.muted = false;
                sv.setAttribute('controls', 'true');
                sv.play();
                const ico = sv.nextElementSibling;
                if (ico && ico.classList.contains('dep-play-ico')) ico.style.display = 'none';
            } else {
                sv.pause();
            }
        } else if (si) {
            // Lightbox for images only
            lbBox.querySelectorAll('video,img').forEach(e => e.remove());
            lbBox.classList.remove('paused', 'has-video');
            lbFill.style.width = '0%';
            let img = document.createElement('img'); img.src = si.src;
            lbBox.insertBefore(img, lbPlay); lb.classList.add('open');
            // REMOVED: document.body.style.overflow='hidden'; so it doesn't freeze the page
        }
    }
    function closeLB() { lb.classList.remove('open'); lbBox.querySelectorAll('video,img').forEach(e => e.remove()); pauseFor(4000) }
    lbClose.addEventListener('click', closeLB); lb.addEventListener('click', e => { if (e.target === lb) closeLB() }); document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLB() });
    let dragging = false, startX = 0, startScroll = 0, moved = false, lastX = 0, vel = 0, inId = null, downItem = null;
    function stopI() { if (inId) cancelAnimationFrame(inId); inId = null }
    function runI() { stopI(); (function f() { if (Math.abs(vel) < .4) return; c.scrollLeft -= vel; vel *= .94; inId = requestAnimationFrame(f) })() }
    function onD(x, item) { stopI(); dragging = true; moved = false; startX = x; lastX = x; vel = 0; startScroll = c.scrollLeft; downItem = item; c.classList.add('dragging'); pauseFor(12000) }
    function onM(x) { if (!dragging) return; if (Math.abs(x - startX) > 6) moved = true; vel = x - lastX; lastX = x; c.scrollLeft = startScroll - (x - startX) }
    function onU() { if (!dragging) return; dragging = false; c.classList.remove('dragging'); if (Math.abs(vel) > 1) runI(); else if (!moved && downItem) openLB(downItem); downItem = null }
    c.addEventListener('mousedown', e => { onD(e.clientX, e.target.closest('.dep-item')); if (!e.target.closest('video')) e.preventDefault() }); window.addEventListener('mousemove', e => onM(e.clientX)); window.addEventListener('mouseup', onU);
    c.addEventListener('touchstart', e => onD(e.touches[0].clientX, e.target.closest('.dep-item')), { passive: true }); c.addEventListener('touchmove', e => onM(e.touches[0].clientX), { passive: true }); c.addEventListener('touchend', onU)
})();

// Back redirect modal
(function () {
    try { const p = new URLSearchParams(location.search), br = p.get('br'); if (br === '1' || p.get('promo') === 'back') localStorage.setItem('backPromoMode', '12.90'); else if (br === '2') localStorage.setItem('backPromoMode', '9.90') } catch (_) { }
    const ov = document.getElementById('brOverlay'), pre = document.getElementById('prePopup'), due = document.getElementById('brDue'), btn = document.getElementById('brBtn'), info = document.getElementById('brInfo'), qrW = document.getElementById('brQrWrapper'), qrI = document.getElementById('brQrInner');
    function computeDue() { const mode = (localStorage.getItem('backPromoMode') || '').trim(), partial = parseFloat(mode.replace(',', '.')) || 0, T = 12.90; let d = T; if (partial >= 9.9 && partial < T) d = T - partial; const s = parseFloat((localStorage.getItem('backRemainingDue') || '').replace(',', '.')) || 0; if (s > 0) d = s; return Math.max(0, parseFloat(d.toFixed(2))) }
    window.openBackModal = function () {
        const d = computeDue(); if (due) due.textContent = 'R$ ' + d.toFixed(2).replace('.', ',');
        try { if (pre) pre.style.display = 'flex'; document.body.classList.add('br-blur') } catch (_) { }
        setTimeout(() => {
            try { if (pre) pre.style.display = 'none' } catch (_) { } if (ov) ov.style.display = 'flex';
            if (btn) { btn.innerHTML = '<span>GERAR QR CODE E <span class="nowrap">LIBERAR APLICATIVO</span></span>'; btn.dataset.state = 'gen'; btn.disabled = false; btn.style.opacity = '1' }
            if (info) { info.style.display = 'none'; info.textContent = '' } if (qrW && qrI) { qrW.style.display = 'none'; qrI.innerHTML = '' }
            try { const h = document.getElementById('brHead'); if (h) { h.textContent = 'Ops! Ocorreu um problema com o seu pagamento...'; h.style.color = '' } } catch (_) { }
        }, 2000)
    };
    window.closeBackModal = function () { if (ov) ov.style.display = 'none'; try { if (pre) pre.style.display = 'none' } catch (_) { } document.body.classList.remove('br-blur') };
    if (btn) btn.addEventListener('click', async function () {
        btn.disabled = true; btn.style.opacity = '.8'; btn.textContent = 'REDIRECIONANDO…'; hideError();
        
        const d = computeDue();
        const productId = (d === 9.90 || d < 12.90) ? 'WtsCuA' : 'RkzPwe';
        const link = `https://pay.lowify.com.br/checkout?product_id=${productId}`;
        
        window.location.href = window.FunilUtils ? FunilUtils.construirURL(link) : link;
    })
})();
