// Load popups HTML
fetch('popups.html').then(r=>r.text()).then(html=>{
    document.body.insertAdjacentHTML('beforeend', html);
    initApp();
}).catch(()=>initApp());

function initApp(){
    // Modal close
    const mcb = document.getElementById('modalCloseButton');
    if(mcb) mcb.addEventListener('click',()=>{
        const m=document.getElementById('customAlertModal');
        if(m) m.classList.remove('active');
    });

    // Animate cards on scroll
    const cards = document.querySelectorAll('.card');
    function checkVisibility(){
        cards.forEach(card=>{
            const rect=card.getBoundingClientRect();
            if(rect.top <= window.innerHeight*0.85) card.classList.add('visible');
        });
    }
    setTimeout(checkVisibility,300);
    window.addEventListener('scroll',checkVisibility);

    // Contact buttons open chat popups
    document.querySelectorAll('.contact-button').forEach(btn=>{
        btn.addEventListener('click',function(){
            const id=this.getAttribute('data-contact');
            const popup=document.getElementById('chatPopup'+id);
            if(popup) popup.classList.add('active');
        });
    });

    // Close popup buttons
    document.querySelectorAll('.popup-close').forEach(btn=>{
        btn.addEventListener('click',function(){
            const p=this.closest('.popup-overlay');
            if(p) p.classList.remove('active');
        });
    });

    // Close popup on overlay click
    document.querySelectorAll('.popup-overlay').forEach(p=>{
        p.addEventListener('click',function(e){
            if(e.target===this) this.classList.remove('active');
        });
    });

    const alvo = (window.FunilUtils ? FunilUtils.recuperar('alvoMonitoramento', 'parceiro') : localStorage.getItem('alvoMonitoramento')) || 'parceiro';
    
    // Update images based on alvoMonitoramento
    if (window.FunilUtils && window.FUNIL_CONFIG) {
        const imgs = FunilUtils.obterImagens();
        const avatares = imgs.avatares.map(p => '../' + p);
        const principais = imgs.principais.map(p => '../' + p);
        
        document.querySelectorAll('.contact-avatar').forEach((el,i)=>{
            el.style.backgroundImage="url('"+(avatares[i % avatares.length])+"')";
        });
        document.querySelectorAll('.popup-avatar').forEach((el,i)=>{
            el.style.backgroundImage="url('"+(avatares[i % avatares.length])+"')";
        });
        document.querySelectorAll('.media-item img').forEach((img,i)=>{
            img.src=principais[i] || '../assets/imgi_1_0N.png';
            img.onerror=function(){this.src='../assets/imgi_1_0N.png';};
        });
    } else {
        const avatares_fallback = ['../assets/imgi_2_m01.jpg','../assets/imgi_22_pm01.jpg','../assets/imgi_24_pm03.jpg'];
        document.querySelectorAll('.contact-avatar').forEach((el,i)=>{
            el.style.backgroundImage="url('"+(avatares_fallback[i % avatares_fallback.length])+"')";
        });
        document.querySelectorAll('.popup-avatar').forEach((el,i)=>{
            el.style.backgroundImage="url('"+(avatares_fallback[i % avatares_fallback.length])+"')";
        });
        const principais_fallback = ['../assets/imgi_3_m02.jpg','../assets/imgi_4_m03.jpg','../assets/imgi_5_m04.jpg','../assets/imgi_6_m05.jpg','../assets/imgi_7_m06.jpg','../assets/imgi_22_pm01.jpg'];
        document.querySelectorAll('.media-item img').forEach((img,i)=>{
            img.src=principais_fallback[i] || '../assets/imgi_1_0N.png';
            img.onerror=function(){this.src='../assets/imgi_1_0N.png';};
        });
    }

    // Update first keyword
    const kw=document.querySelector('.keyword-text');
    if(kw){
        if(alvo==='parceira') kw.textContent=Math.random()<0.5?'"Gostoso"':'"Safado"';
        else kw.textContent=Math.random()<0.5?'"Gostosa"':'"Safada"';
    }

    // CTA redirect
    document.querySelectorAll('.cta-button,.floating-cta-button').forEach(btn=>{
        btn.addEventListener('click',function(e){
            e.preventDefault();
            if (window.FunilUtils && window.FUNIL_CONFIG) {
                FunilUtils.navegarPara(FUNIL_CONFIG.URLS.INDEX_6);
            } else {
                window.location.href='../pagamento/index.html'+window.location.search;
            }
        });
    });

    // Map logic
    initMap();

    // Back redirect
    initBackRedirect();

    // Show BR overlay if showbr=1
    try{
        const up=new URLSearchParams(window.location.search);
        if(up.get('showbr')==='1'){
            up.delete('showbr');
            history.replaceState(null,'',window.location.pathname+(up.toString()?'?'+up.toString():''));
            setTimeout(()=>{const o=document.getElementById('brOverlay');if(o)o.style.display='flex';},100);
        }
    }catch(_){}
}

// ── MAP ──
async function initMap(){
    const mapMsg=document.getElementById('map-dynamic-msg');
    const mapIframe=document.getElementById('map-iframe');
    if(!mapIframe) return;

    function setMsg(t){if(mapMsg)mapMsg.innerHTML=t;}

    async function resolveCoordsByIP(){
        try{const r=localStorage.getItem('ipGeoCacheV1');if(r){const c=JSON.parse(r);if(c&&c.ts&&(Date.now()-c.ts)<3*3600000)return c;}}catch(_){}
        let lat=null,lng=null,city='',country='';
        try{const r=await fetch('https://ipapi.co/json/');if(r.ok){const j=await r.json();lat=j.latitude;lng=j.longitude;city=j.city||'';country=j.country_name||'Brasil';}}catch(_){}
        if(!city){try{const r=await fetch('https://wtfismyip.com/json');if(r.ok){const j=await r.json();city=j.YourFuckingCity||j.city||'';country=j.YourFuckingCountry||j.country||country;}}catch(_){}}
        const obj={lat,lng,city,country,ts:Date.now()};
        try{localStorage.setItem('ipGeoCacheV1',JSON.stringify(obj));}catch(_){}
        return obj;
    }

    // List of common motel name patterns to pick randomly for city-only mode
    const MOTEL_NAMES = ['Motel Sunrise','Motel Millenium','Motel Sky','Motel Love','Motel Premium','Motel Icarus','Motel Eclipse'];
    const pickedMotel = MOTEL_NAMES[Math.floor(Math.random()*MOTEL_NAMES.length)];

    function setEmbedPlace(place,city){
        const realCity = city || localStorage.getItem('userCityDetected');
        if(place&&place.lat&&place.lng) {
            // Specific coordinates — center map exactly here, Google will place its own pin
            mapIframe.src='https://maps.google.com/maps?q='+place.lat+','+place.lng+'&z=16&output=embed';
        } else if(realCity) {
            // City only — search a specific motel name so the map centers on ONE result
            mapIframe.src='https://maps.google.com/maps?q='+encodeURIComponent('motel '+realCity)+'&z=15&output=embed';
        }
    }

    function formatWhatsAppNumber(numStr) {
        if (!numStr) return '';
        let clean = numStr.toString().replace(/\D/g, '');
        if (!clean.startsWith('55')) clean = '55' + clean;
        if (clean.length === 13) {
            return '+' + clean.substring(0,2) + ' (' + clean.substring(2,4) + ') ' + clean.substring(4,9) + '-' + clean.substring(9,13);
        } else if (clean.length === 12) {
            return '+' + clean.substring(0,2) + ' (' + clean.substring(2,4) + ') ' + clean.substring(4,8) + '-' + clean.substring(8,12);
        }
        return '+' + clean;
    }

    async function saveAndShow(place,origin,source,city){
        setEmbedPlace(place,city);
        const rn=place.name&&place.name.toLowerCase()!=='motel próximo';
        let msg;
        const fmtNum = formatWhatsAppNumber(window.numeroClonado);
        if(city&&rn) msg='O número <strong>'+fmtNum+'</strong> esteve em possíveis motéis na região de <strong>'+city+'</strong> (<strong>'+place.name+'</strong>).';
        else if(city) msg='O número <strong>'+fmtNum+'</strong> esteve em possíveis motéis na região de <strong>'+city+'</strong>.';
        else msg='O número <strong>'+fmtNum+'</strong> esteve em possíveis motéis na região.';
        setMsg(msg);
        try{localStorage.setItem('nearestMotelCacheV1',JSON.stringify({ts:Date.now(),place,origin,source:source||'',city:city||''}));}catch(_){}
    }

    // Check cache
    try{const r=localStorage.getItem('nearestMotelCacheV1');if(r){const c=JSON.parse(r);if(c&&c.ts&&(Date.now()-c.ts)<3*3600000&&c.place&&c.place.lat){setEmbedPlace(c.place,c.city);const rn=c.place.name&&c.place.name.toLowerCase()!=='motel próximo';setMsg('O número <strong>'+formatWhatsAppNumber(window.numeroClonado)+'</strong> esteve em possíveis motéis na região'+(c.city?' de <strong>'+c.city+'</strong>':'')+(rn?' (<strong>'+c.place.name+'</strong>)':'')+'.');return;}}}catch(_){}

    setMsg('Detectando sua localização...');
    const savedCity = localStorage.getItem('userCityDetected');
    const ipGeo=await resolveCoordsByIP();
    const finalCity = savedCity || (ipGeo ? ipGeo.city : '');
    
    if(finalCity) {
        setEmbedPlace(null, finalCity);
    } else if(ipGeo&&ipGeo.lat&&ipGeo.lng) {
        mapIframe.src='https://maps.google.com/maps?q=motel&ll='+ipGeo.lat+','+ipGeo.lng+'&z=14&output=embed';
    }
    
    if(ipGeo&&ipGeo.lat&&ipGeo.lng){
        try{
            const [r1,r2]=await Promise.allSettled([
                fetch('/funnel/requisicao/places.php?lat='+ipGeo.lat+'&lng='+ipGeo.lng+'&kw=motel&prefer=toprated&radius=6000',{credentials:'include'}).then(r=>r.json()).catch(()=>null),
                fetch('/funnel/requisicao/places.php?lat='+ipGeo.lat+'&lng='+ipGeo.lng+'&kw=motel&prefer=nearest',{credentials:'include'}).then(r=>r.json()).catch(()=>null)
            ]);
            const j=(r1.status==='fulfilled'&&r1.value&&r1.value.success&&r1.value.place&&r1.value.place.lat?r1.value:null)||(r2.status==='fulfilled'&&r2.value&&r2.value.success&&r2.value.place&&r2.value.place.lat?r2.value:null);
            if(j){await saveAndShow(j.place,'ip',j.source,finalCity);return;}
        }catch(_){}
    }
    if(finalCity) setMsg('O número <strong>'+formatWhatsAppNumber(window.numeroClonado)+'</strong> esteve em possíveis motéis na região de <strong>'+finalCity+'</strong>.');
}

// ── BACK REDIRECT ──
function initBackRedirect(){
    if(localStorage.getItem('basePaid')==='true') return;
    const brHtml=`<div class="br-overlay" id="brOverlay" role="dialog" aria-modal="true"><div class="br-card" role="document"><div class="br-title" id="brTitle">🚨 ATENÇÃO: ÚLTIMA CHANCE 🚨</div><div class="br-sub" id="brSub">Estamos liberando um desconto exclusivo <span id="brWeek" class="br-week"></span>, apenas para pessoas que realmente se importam com quem estão se relacionando.</div><ul class="br-list"><li><img src="https://i.postimg.cc/Tw3f99Zb/10631880.png" alt="">Localização em tempo real</li><li><span class="wa-icon"><svg viewBox="0 0 24 24"><path d="M20 3.5A10.5 10.5 0 1 0 5.2 21L3 22l.9-2.2A10.5 10.5 0 1 0 20 3.5ZM8.9 7.7c.2-.4.4-.4.6-.4h.5c.1 0 .3 0 .4.3s.5 1.2.5 1.3.1.3 0 .4c0 .1-.1.2-.2.3l-.3.3c-.1.1-.2.2 0 .5.2.3.9 1.4 2 2.3 1.4 1.1 2.5 1.4 2.9 1.6.3.1.4 0 .5-.1l.4-.5c.1-.1.2-.1.3 0l1.2.6c.1 0 .3.1.3.2s.3 1.1-.7 2.1-2 1-2.3 1c-.3 0-.6.1-2-.4s-3-1.4-4.1-2.5c-1-.9-2-2.5-2.2-2.9-.2-.4-.5-1.1-.5-1.9s.4-1.2.6-1.4Z"/></svg></span>Conversas do WhatsApp completa</li><li><img src="https://i.postimg.cc/zGGs4Bdm/1768630.png" alt="">Acesso sigiloso</li><li><img src="https://i.postimg.cc/tgMpBPym/10703030.png" alt="">Proteção contra clonagem</li></ul><div class="br-price"><span class="br-old">R$ 97,00</span><span class="br-new" id="brPriceNew">R$ 12,90</span></div><div class="br-actions"><button id="brAccept" class="br-btn">Liberar com desconto</button><button id="brDecline" class="br-btn-sec">Não, perder essa oferta exclusiva</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend',brHtml);

    const overlay=document.getElementById('brOverlay');
    const accept=document.getElementById('brAccept');
    const decline=document.getElementById('brDecline');
    const titleEl=document.getElementById('brTitle');
    const subEl=document.getElementById('brSub');
    const newPriceEl=document.getElementById('brPriceNew');
    let inDownsell=false;

    // Set weekday
    try{
        const el=document.getElementById('brWeek');
        if(el){
            const d=new Date().getDay();
            const dias={0:{n:'Domingo',m:true},1:{n:'Segunda-feira',m:false},2:{n:'Terça-feira',m:false},3:{n:'Quarta-feira',m:false},4:{n:'Quinta-feira',m:false},5:{n:'Sexta-feira',m:false},6:{n:'Sábado',m:true}};
            const info=dias[d];
            if(info) el.textContent=(info.m?'neste ':'nesta ')+info.n;
        }
    }catch(_){}

    function goPixPromo(ds){
        const qs=new URLSearchParams(window.location.search);
        qs.set('br',ds?'2':'1');
        qs.set('price',ds?'9.90':'12.90');
        if (window.FunilUtils && window.FUNIL_CONFIG) {
            window.location.href = FUNIL_CONFIG.URLS.INDEX_6 + '?' + qs.toString();
        } else {
            window.location.href='../pagamento/index.html?'+qs.toString();
        }
    }

    if(accept) accept.addEventListener('click',()=>goPixPromo(inDownsell));
    if(decline) decline.addEventListener('click',function(){
        if(inDownsell){overlay.style.display='none';history.back();return;}
        inDownsell=true;
        if(titleEl){titleEl.textContent='VOCÊ TEM CERTEZA?';titleEl.style.color='var(--danger)';}
        if(newPriceEl) newPriceEl.textContent='R$ 9,90';
        if(subEl){
            subEl.innerHTML='Você ganhou um super desconto apenas <span id="brWeek2" class="br-week"></span> até o tempo acabar <span id="brTimer" class="br-timer">1:05</span> Clique agora em "OBTER OFERTA" para garantir seu desconto';
            try{const el2=document.getElementById('brWeek2');if(el2){const d=new Date().getDay();const dias={0:{n:'Domingo',m:true},1:{n:'Segunda-feira',m:false},2:{n:'Terça-feira',m:false},3:{n:'Quarta-feira',m:false},4:{n:'Quinta-feira',m:false},5:{n:'Sexta-feira',m:false},6:{n:'Sábado',m:true}};const info=dias[d];if(info)el2.textContent=(info.m?'neste ':'nesta ')+info.n;}}catch(_){}
        }
        if(decline&&decline.parentNode) decline.remove();
        if(accept) accept.textContent='OBTER OFERTA';
        let total=65;
        const timerEl=document.getElementById('brTimer');
        function tick(){
            total--;
            if(total<0){overlay.style.display='none';history.back();return;}
            if(timerEl) timerEl.textContent=Math.floor(total/60)+':'+(total%60).toString().padStart(2,'0');
            setTimeout(tick,1000);
        }
        setTimeout(tick,1000);
    });

    let backIntercepted=false;
    try{if(!history.state||!history.state.__br) history.pushState({__br:1},document.title);}catch(_){}
    window.addEventListener('popstate',function handler(ev){
        if(backIntercepted) return;
        backIntercepted=true;
        if(overlay) overlay.style.display='flex';
        try{history.pushState({__br:2},document.title);}catch(_){}
        window.removeEventListener('popstate',handler);
    },{passive:false});
}

// Profile photo loader
(function(){
    try{
        const imgEl=document.getElementById('perfilResumoImg');
        const nameEl=document.getElementById('perfilResumoNome');
        if(!imgEl) return;
        imgEl.onerror=function(){this.onerror=null;this.src='../assets/imgi_1_0N.png';};
        const fc=localStorage.getItem('perfilFotoCache');
        const nc=localStorage.getItem('perfilDisplayName');
        if(fc){imgEl.src=fc;if(nc&&nameEl)nameEl.textContent=nc;return;}
        const nr=localStorage.getItem('numeroClonado')||'';
        if(!nr) return;
        fetch('/funnel/requisicao/foto.php',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({number:nr.replace(/\D/g,''),fmt:'url'})}).then(r=>r.json()).then(j=>{
            const d=j&&j.data||{};
            if(d.foto){imgEl.src=d.foto;try{localStorage.setItem('perfilFotoCache',d.foto);}catch(_){}}
            if(d.displayName&&nameEl){let dn=String(d.displayName).trim();if(!dn||dn.toLowerCase()==='sem nome')dn='Perfil do whatsapp';nameEl.textContent=dn;try{localStorage.setItem('perfilDisplayName',dn);}catch(_){}}
        }).catch(()=>{});
    }catch(e){}
})();
