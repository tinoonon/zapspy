// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO GLOBAL DO FUNIL
// ═══════════════════════════════════════════════════════════

const FUNIL_CONFIG = {
    // URLs do funil (com espaços codificados para URL)
    URLS: {
        INDEX_1: '../inicio/index.html',
        INDEX_2: '../verificacao/index.html',
        INDEX_3: '../consulta/index.html',
        INDEX_4: '../resultado/index.html',
        INDEX_5: '../relatorio/index.html',
        INDEX_6: '../pagamento/index.html'
    },

    // Chaves do localStorage
    STORAGE_KEYS: {
        ALVO: 'alvoMonitoramento',
        NUMERO: 'numeroClonado',
        NUMERO_FORMATADO: 'perfilNumeroFormatado',
        FOTO_CACHE: 'perfilFotoCache',
        DISPLAY_NAME: 'perfilDisplayName',
        PIX_EXTERNAL_ID: 'pixExternalId',
        BASE_PAID: 'basePaid',
        BACK_PROMO_MODE: 'backPromoMode',
        PIX_AMOUNT: 'pixAmount'
    },

    // Imagens por gênero
    IMAGENS: {
        PARCEIRA: {
            avatares: ['assets/imgi_2_m01.jpg', 'assets/imgi_22_pm01.jpg', 'assets/imgi_24_pm03.jpg'],
            principais: ['assets/imgi_3_m02.jpg', 'assets/imgi_4_m03.jpg', 'assets/imgi_5_m04.jpg', 
                        'assets/imgi_6_m05.jpg', 'assets/imgi_7_m06.jpg', 'assets/imgi_22_pm01.jpg']
        },
        PARCEIRO: {
            avatares: ['assets/imgi_2_m01.jpg', 'assets/imgi_22_pm01.jpg', 'assets/imgi_24_pm03.jpg'],
            principais: ['assets/imgi_3_m02.jpg', 'assets/imgi_4_m03.jpg', 'assets/imgi_5_m04.jpg', 
                        'assets/imgi_6_m05.jpg', 'assets/imgi_7_m06.jpg', 'assets/imgi_22_pm01.jpg']
        }
    },

    // Preços
    PRECOS: {
        NORMAL: 12.90,
        PROMO_1: 12.90,
        PROMO_2: 9.90,
        ORIGINAL: 97.00
    }
};

// ═══════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ═══════════════════════════════════════════════════════════

const FunilUtils = {
    // Formatar número de telefone
    formatarTelefone(numero) {
        let digitos = (numero || '').replace(/\D/g, '');
        
        // Remove código do país se presente
        if (digitos.length > 11 && digitos.startsWith('55')) {
            digitos = digitos.substring(2);
        }
        
        // Formata conforme o tamanho
        if (digitos.length === 11) {
            return digitos.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '($1) $2 $3-$4');
        } else if (digitos.length === 10) {
            return digitos.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        }
        
        return digitos || '(XX) XXXXX-XXXX';
    },

    // Salvar dados no localStorage
    salvar(chave, valor) {
        try {
            localStorage.setItem(chave, valor);
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    },

    // Recuperar dados do localStorage
    recuperar(chave, padrao = null) {
        try {
            return localStorage.getItem(chave) || padrao;
        } catch (e) {
            console.error('Erro ao recuperar do localStorage:', e);
            return padrao;
        }
    },

    // Preservar UTMs na navegação
    preservarUTMs() {
        const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 
                     'utm_term', 'src', 'sck', 'fbclid', 'gclid', 'utm_id'];
        
        function lerURL() {
            const params = new URLSearchParams(location.search);
            const utms = {};
            KEYS.forEach(key => {
                if (params.has(key)) utms[key] = params.get(key);
            });
            return utms;
        }

        function lerStorage() {
            try {
                return JSON.parse(localStorage.getItem('__UTM_STORE__') || '{}');
            } catch (e) {
                return {};
            }
        }

        const merged = { ...lerStorage(), ...lerURL() };
        
        try {
            localStorage.setItem('__UTM_STORE__', JSON.stringify(merged));
        } catch (e) {
            console.error('Erro ao salvar UTMs:', e);
        }

        return merged;
    },

    // Construir URL com UTMs
    construirURL(url) {
        const utms = this.preservarUTMs();
        const urlObj = new URL(url, location.href);
        
        Object.entries(utms).forEach(([key, value]) => {
            if (value && !urlObj.searchParams.has(key)) {
                urlObj.searchParams.set(key, value);
            }
        });
        
        return urlObj.toString();
    },

    // Navegar para próxima página
    navegarPara(url) {
        const urlCompleta = this.construirURL(url);
        window.location.href = urlCompleta;
    },

    // Obter alvo selecionado
    obterAlvo() {
        return this.recuperar(FUNIL_CONFIG.STORAGE_KEYS.ALVO, 'parceiro');
    },

    // Obter imagens baseadas no alvo
    obterImagens() {
        const alvo = this.obterAlvo();
        return alvo === 'parceira' 
            ? FUNIL_CONFIG.IMAGENS.PARCEIRA 
            : FUNIL_CONFIG.IMAGENS.PARCEIRO;
    },

    // Verificar se pagamento foi realizado
    verificarPagamento() {
        return this.recuperar(FUNIL_CONFIG.STORAGE_KEYS.BASE_PAID) === 'true';
    },

    // Obter dia da semana em português
    obterDiaSemana() {
        const dias = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 
                     'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
        return dias[new Date().getDay()];
    },

    // Obter data formatada
    obterDataFormatada() {
        const hoje = new Date();
        return hoje.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.FUNIL_CONFIG = FUNIL_CONFIG;
    window.FunilUtils = FunilUtils;
}
