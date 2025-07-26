    // Função para detectar qual produto está sendo visualizado com base na URL
    function detectProduct() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        if (segments.length > 0) {
            return segments[0]; // Retorna o primeiro segmento da URL
        }
        
        return 'default';
    }

    // Configuração temporária até que a configuração real seja carregada
    let config = {
        pixelID: window.__config__.pixelID
    };

    // Função para carregar a configuração do produto
    async function loadProductConfig() {
        const productPath = detectProduct();
        let productConfig = {};
        let defaultConfig = {};
        
        try {
            // Carregar configuração padrão
            const defaultResponse = await fetch('/configs/default.json');
            if (defaultResponse.ok) {
                defaultConfig = await defaultResponse.json();
            }
            
            // Tentar carregar configuração específica do produto
            const productResponse = await fetch(`/configs/${productPath}.json`);
            if (productResponse.ok) {
                productConfig = await productResponse.json();
            }
        } catch (e) {
            console.error('Erro ao carregar configuração:', e);
        }
        
        // Mesclar configurações (específica do produto sobrescreve a padrão)
        return { ...defaultConfig, ...productConfig };
    }
    const pageRules = [ 
        // ==============================================
        // REGRAS DE PÁGINAS (ENVIAR EVENTOS ESPECÍFICOS)
        // ==============================================
        //{ page: "Pagina_1", event: "Lead", value: 47.90, currency: "BRL" }, // Se na URL existir "Pagina_1" enviar o evento de "Lead"
        //{ page: "Pagina_2", event: "Lead", value: 97.90, currency: "BRL" },
    ];
        // ==============================================
        // FORMULÁRIOS (NOME DOS ATRIBUTOS)
        // ==============================================
    const forms = {
        email: [ "email", "form_fields[email]" ],
        phone: [ "tel", "telefone", "phone", "form_fields[phone]" ],
        firstName: [ "nome", "name", "form_fields[name]", "form_fields[firstname]" ],
        lastName: [ "sobrenome", "lastname", "form_fields[lastname]" ]
    };
    // ==================================================
    
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
                return value;
            }
        }
        return null;
    }
    
    function getLongExpires() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 100);
        return `expires=${date.toUTCString()}; path=/`;
    }
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    const eventSent = {};
    
    async function sendEvent(eventType, data = {}) {
        const eventSent = window.__eventSent || (window.__eventSent = {});
        if (["ViewContent", "AddToWishlist", "AddToCart", "Scroll_25", "Scroll_50", "Scroll_75", "Scroll_90", "Timer_1min"].includes(eventType)) {
            if (eventSent[eventType]) return;
            eventSent[eventType] = true;
        }
    
        const contentName =config.productName;
        const contentId =config.productID;
        const eventId = generateUUID();
    
        const customEvents = ['Scroll_25', 'Scroll_50', 'Scroll_75', 'Scroll_90', 'Timer_1min', 'PlayVideo', 'ViewVideo_25', 'ViewVideo_50', 'ViewVideo_75', 'ViewVideo_90'];
        const specialEvents = ['AddToCart', 'Lead', 'InitiateCheckout', 'Purchase'];
    
        if (specialEvents.includes(eventType)) updateUserDataFromForm();
    
        const _customData = {
            content_name: contentName,
            ...(contentId != null && contentId !== '' ? { content_ids: contentId } : {}),
            content_type: 'product',
            ...(specialEvents.includes(eventType) && data.value !== undefined && {
                value: data.value,
                currency: data.currency || 'BRL'
            })
        };
    
        const _userData = { eventID: eventId, ...userData };
    
        if (eventType !== "Init" && eventType !== "UpdateUserData" && !customEvents.includes(eventType)) {
            fbq('track', eventType, _customData, _userData);
        } else if (eventType !== "Init" && eventType !== "UpdateUserData") {
            fbq('trackCustom', eventType, _customData, _userData);
        }
    
        try {
            const URL = window.location.href;
            const payload = { userId, contentName, contentId, eventType, eventId, URL,
                price: data.value || null,
                currency: data.currency || 'BRL',
                fbc: data.fbc || userData.fbc || null,
                fbp: data.fbp || userData.fbp || null,
                fn: userData.fn || getCookie('fn') || null,
                ln: userData.ln || getCookie('ln') || null,
                em: userData.em || getCookie('em') || null,
                ph: userData.ph || getCookie('ph') || null,
            };
            
            // Log do payload para depuração
            console.log('Enviando payload para API:', JSON.stringify(payload, null, 2));
            // Garantir que a URL da API esteja completa e definida
            let apiUrl = config.apiURL || 'https://api.profdidatica.com.br';
            if (apiUrl && !apiUrl.startsWith('http')) {
                apiUrl = 'https://' + apiUrl;
            }
            
            const response = await fetch(apiUrl + '/events/send', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            // Verificar se a resposta foi bem-sucedida
            if (response.ok) {
                if (eventType == "Init") {
                    try {
                        const responseData = await response.json();
                        return responseData;
                    } catch (jsonError) {
                        console.error('Erro ao processar resposta JSON:', jsonError);
                    }
                }
            } else {
                console.warn(`Erro na requisição para API: ${response.status} ${response.statusText}`);
            }
        } catch (e) {
            console.error(`Erro ao rastrear evento de ${eventType}:`, e);
        }
    }
    
    function sendEventsByURLMatch() {
      const url = window.location.href.toLowerCase();
      const hostname = window.location.hostname.toLowerCase();
    
      pageRules.forEach(rule => {
        if (!rule.page || !rule.event) return;
        if (url.includes(rule.page) || hostname.includes(rule.page)) {
            const eventData = {};
            if (rule.value !== undefined) {
                eventData.value = parseFloat(rule.value).toFixed(2);
                eventData.currency = rule.currency || 'BRL';
            }
            sendEvent(rule.event, eventData);
        }
      });
    }
    
    function updateUserDataFromForm() {
        let fn, ln, em, ph;
        const inputs = document.querySelectorAll('input, textarea');
    
        inputs.forEach(input => {
            const nameAttr = input.name?.toLowerCase();
            const value = input.value?.trim();
            if (!value || !nameAttr) return;
    
            if (!em && forms.email.some(attr => nameAttr.includes(attr))) {
                em = value.toLowerCase();
            } else if (!ph && forms.phone.some(attr => nameAttr.includes(attr))) {
                ph = value.replace(/\s|-/g, '');
            } else if (!fn && forms.firstName.some(attr => nameAttr.includes(attr))) {
                const nameParts = value.toLowerCase().split(' ');
                fn = nameParts[0];
                if (!ln && nameParts.length > 1) ln = nameParts[nameParts.length - 1];
            } else if (!ln && forms.lastName.some(attr => nameAttr.includes(attr))) {
                ln = value.toLowerCase();
            }
        });
    
        const expires = getLongExpires();
        if (fn) document.cookie = "fn=" + fn + "; " + expires;
        if (ln) document.cookie = "ln=" + ln + "; " + expires;
        if (em) document.cookie = "em=" + em + "; " + expires;
        if (ph) document.cookie = "ph=" + ph + "; " + expires;
    
        userData = {
            ...userData,
            ...(fn && { fn }),
            ...(ln && { ln }),
            ...(em && { em }),
            ...(ph && { ph })
        };
    }
    
    let userData = {};
    let [userId, fbc, fbp, fn, ln, em, ph] = ["userId", "_fbc", "_fbp", "fn", "ln", "em", "ph"].map(getCookie);
    
    if (!userId) {
        userId = generateUUID();
        const date = new Date();
        date.setFullYear(date.getFullYear() + 100); // Expira em 100 anos
        document.cookie = `userId=${userId}; expires=${date.toUTCString()}; path=/`;
    }
        
    (async () => {
        const data = await sendEvent('Init') || {};
    
        userData = {
            ...(data.ct && { ct: data.ct }),
            ...(data.st && { st: data.st }),
            ...(data.zp && { zp: data.zp }),
            ...(data.country && { country: data.country }),
            ...(data.client_ip_address && { client_ip_address: data.client_ip_address }),
            ...(data.client_user_agent && { client_user_agent: data.client_user_agent }),
            ...(data.fbc || fbc ? { fbc: data.fbc || fbc } : {}),
            ...(data.fbp || fbp ? { fbp: data.fbp || fbp } : {}),
            ...(userId && { external_id: userId }),
            ...(fn && { fn }),
            ...(ln && { ln }),
            ...(em && { em }),
            ...(ph && { ph })
        };
    
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', config.pixelID, userData);
    
        if (config.useInstantPixel)
            await instantPixel();
        else
            await waitForCookiesAndSendEvent();
    
        setButtonsURLs();
        setFormListeners();
    
        const observeEventByIdOrClass = (name, callback) => {
            const checkAndObserve = () => {
                const elements = [
                    ...document.querySelectorAll(`#${name}`),
                    ...document.querySelectorAll(`.${name}`)
                ];
                elements.forEach(el => {
                    if (!el.dataset.observed) {
                        callback(el);
                        el.dataset.observed = "true";
                    }
                });
            };
    
            checkAndObserve();
    
            const observer = new MutationObserver(checkAndObserve);
            observer.observe(document.body, { childList: true, subtree: true });
        };
    
        const setupIntersectionEvent = (eventName) => {
            observeEventByIdOrClass(eventName, (el) => {
                const io = new IntersectionObserver((entries, ioInstance) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !eventSent[eventName]) {
                            sendEvent(eventName);
                            eventSent[eventName] = true;
                            ioInstance.unobserve(entry.target);
                        }
                    });
                });
                io.observe(el);
            });
        };
    
        if (config.sendViewContent) {
            setupIntersectionEvent("ViewContent");
        }
    
        if (config.sendAddToWishlist) {
            setupIntersectionEvent("AddToWishlist");
        }
    
        if (config.sendAddToCart) {
            observeEventByIdOrClass("AddToCart", (el) => {
                el.addEventListener('click', () => {
                    if (!eventSent["AddToCart"]) {
                        sendEvent("AddToCart");
                        eventSent["AddToCart"] = true;
                    }
                });
            });
        }
    
        if (config.sendScrolls) {
            (function () {
                let scrollEvents = [25, 50, 75, 90];
    
                function trackScrollEvent() {
                    let scrollPosition = window.scrollY + window.innerHeight;
                    let pageHeight = document.documentElement.scrollHeight;
                    let scrollPercentage = (scrollPosition / pageHeight) * 100;
    
                    scrollEvents.forEach(percent => {
                        if (scrollPercentage >= percent) {
                            sendEvent(`Scroll_${percent}`);
                        }
                    });
                }
    
                window.addEventListener('scroll', trackScrollEvent);
            })();
        }
    
        if (config.sendTimer_1min) {
            setTimeout(() => {
                sendEvent("Timer_1min");
            }, 60000);
        }
    
    })();
    
    async function instantPixel() {
        const urlParams = new URLSearchParams(window.location.search);
        const hasFbclid = urlParams.has('fbclid');
        const currentHostname = window.location.hostname;
    
        sendEvent('PageView');
        sendEventsByURLMatch();
    
        if (!hasFbclid) {
            const fbc = getCookie('_fbc');
            const fbp = getCookie('_fbp');
    
            userData = {
                ...userData,
                ...(fbc ? { fbc } : {}),
                ...(fbp ? { fbp } : {})
            };
    
            await sendEvent('UpdateUserData');
            return;
        } else {
            const checkInterval = 100;
            const maxWaitTime = 5000;
            let waited = 0;
    
            const interval = setInterval(async () => {
                const fbc = getCookie('_fbc');
                const fbp = getCookie('_fbp');
    
                const hasFbc = fbc && fbc.trim() !== "";
                const hasFbp = fbp && fbp.trim() !== "";
    
                if (hasFbc && hasFbp) {
                    clearInterval(interval);
    
                    userData = {
                        ...userData,
                        ...(fbc ? { fbc } : {}),
                        ...(fbp ? { fbp } : {})
                    };
    
                    await sendEvent('UpdateUserData');
                } else {
                    waited += checkInterval;
                    if (waited >= maxWaitTime) {
                        clearInterval(interval);                
                        const fbc_2 = getCookie('_fbc');
                        const fbp_2 = getCookie('_fbp');
    
                        console.warn("Cookies _fbc e _fbp não foram encontrados dentro do tempo esperado.");
                        userData = {
                            ...userData,
                            ...(fbc_2 ? { fbc: fbc_2 } : {}),
                            ...(fbp_2 ? { fbp: fbp_2 } : {})
                        };
    
                        await sendEvent('UpdateUserData');
                    }
                }
            }, checkInterval);
        }
    }
    
    async function waitForCookiesAndSendEvent() {
        const urlParams = new URLSearchParams(window.location.search);
        const hasFbclid = urlParams.has('fbclid');
    
        fbq('trackCustom', 'createCookies');
    
        if (!hasFbclid) {
            const checkInterval = 100;
            const maxWaitTime = 5000;
            let waited = 0;
    
            const interval = setInterval(async () => {
                const fbc = getCookie('_fbc');
                const fbp = getCookie('_fbp');
    
                const hasFbp = fbp && fbp.trim() !== "";
    
                if (hasFbp) {
                    clearInterval(interval);
    
                    userData = {
                        ...userData,
                        ...(fbc ? { fbc } : {}),
                        ...(fbp ? { fbp } : {})
                    };
    
                    await sendEvent('PageView');
                    sendEventsByURLMatch();
                } else {
                    waited += checkInterval;
    
                    if (waited >= maxWaitTime) {
                        clearInterval(interval);
    
                        const fbc_2 = getCookie('_fbc');
                        const fbp_2 = getCookie('_fbp');
    
                        console.warn("Cookie _fbp não foi encontrado dentro do tempo esperado.");
    
                        userData = {
                            ...userData,
                            ...(fbc_2 ? { fbc: fbc_2 } : {}),
                            ...(fbp_2 ? { fbp: fbp_2 } : {})
                        };
    
                        await sendEvent('PageView');
                        sendEventsByURLMatch();
                    }
                }
            }, checkInterval);
        } else {
            const checkInterval = 100;
            const maxWaitTime = 5000;
            let waited = 0;
    
            const interval = setInterval(async () => {
                const fbc = getCookie('_fbc');
                const fbp = getCookie('_fbp');
    
                const hasFbc = fbc && fbc.trim() !== "";
                const hasFbp = fbp && fbp.trim() !== "";
    
                if (hasFbc && hasFbp) {
                    clearInterval(interval);
    
                    userData = {
                        ...userData,
                        ...(fbc ? { fbc } : {}),
                        ...(fbp ? { fbp } : {})
                    };
    
                    await sendEvent('PageView');
                    sendEventsByURLMatch();
                } else {
                    waited += checkInterval;
                    if (waited >= maxWaitTime) {
                        clearInterval(interval);                
                        const fbc_2 = getCookie('_fbc');
                        const fbp_2 = getCookie('_fbp');
    
                        console.warn("Cookies _fbc e _fbp não foram encontrados dentro do tempo esperado.");
                        userData = {
                            ...userData,
                            ...(fbc_2 ? { fbc: fbc_2 } : {}),
                            ...(fbp_2 ? { fbp: fbp_2 } : {})
                        };
    
                        await sendEvent('PageView');
                        sendEventsByURLMatch();
                    }
                }
            }, checkInterval);
        }
    }
    
    function setButtonsURLs() {
        if (!config.isProduct) return;
        
        // Obter os parâmetros UTM e fbclid da URL atual
        const currentUrl = new URL(window.location.href);
        const utmParams = {};
        const fbclid = currentUrl.searchParams.get('fbclid');
        
        // Coletar todos os parâmetros UTM da URL atual
        currentUrl.searchParams.forEach((value, key) => {
            if (key.startsWith('utm_')) {
                utmParams[key] = value;
            }
        });
        
        console.log('Parâmetros UTM detectados:', utmParams);
        console.log('fbclid detectado:', fbclid);
        
        const buttons = Array.from(document.querySelectorAll('a[href]'))
        .filter(link => {
            const href = link.getAttribute('href')?.toLowerCase();
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
            return href.includes(config.productCheckout);
        });
        
        console.log('Botões de checkout encontrados:', buttons.length);
        
        buttons.forEach(link => {
            try {
                const url = new URL(link.href);
                
                // Adicionar userId como origem
                if (url.searchParams.has(config.origin)) {
                    if (url.searchParams.get(config.origin) !== userId) {
                        url.searchParams.set(config.origin, userId);
                    }
                } else {
                    url.searchParams.append(config.origin, userId);
                }
                
                // Adicionar todos os parâmetros UTM
                Object.entries(utmParams).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
                
                // Adicionar fbclid se existir
                if (fbclid) {
                    url.searchParams.set('fbclid', fbclid);
                }
                
                link.href = url.toString();
                console.log('Link atualizado com parâmetros:', link.href);
            } catch (e) {
                console.warn('Link inválido:', link.href);
            }
        });
    
        if (config.productValue.length === buttons.length) {
            buttons.forEach((button, index) => {
                console.log('Botão ' + index);
                const value = config.productValue[index];
                if (!button.dataset.price) {
                    button.addEventListener('click', () => {
                        sendEvent('InitiateCheckout', {
                            value: value,
                            currency: 'BRL'
                        });
                    });
                    button.dataset.price = Number(value).toFixed(2);
                }
            });
        } else {
            const observer = new MutationObserver(() => {
                const buttons = Array.from(document.querySelectorAll('a[href]'))
                    .filter(link => {
                        const href = link.getAttribute('href')?.toLowerCase();
                        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
                        return href.includes(config.productCheckout);
                    });
    
                buttons.forEach((link, index) => {
                    const value = config.productValue[index];
    
                    if (link.dataset.price) return;
    
                    try {
                        const url = new URL(link.href);
                        if (url.searchParams.has(config.origin)) {
                            if (url.searchParams.get(config.origin) !== userId) {
                                url.searchParams.set(config.origin, userId);
                            }
                        } else {
                            url.searchParams.append(config.origin, userId);
                        }
                        link.href = url.toString();
                    } catch (e) {
                        console.warn('Link inválido:', link.href);
                    }
    
                    link.addEventListener('click', () => {
                        sendEvent('InitiateCheckout', {
                            value: value,
                            currency: 'BRL'
                        });
                    });
                    link.dataset.price = value;
                });
    
                if (buttons.length === config.productValue.length) {
                    console.log("✅ Todos os botões foram encontrados. Desligando observer.");
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    function setFormListeners() {
        const attachListener = (form) => {
            if (form.dataset.leadSet) return;
            form.addEventListener('submit', () => {
                sendEvent('Lead');
            });
            form.dataset.leadSet = "true";
        };
    
        const forms = document.querySelectorAll('form');
        forms.forEach(attachListener);
    
        const observer = new MutationObserver(() => {
            const newForms = document.querySelectorAll('form:not([data-lead-set])');
            newForms.forEach(attachListener);
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    }    
    
    // Função para inicializar o script após carregar as configurações
    function initializeScript(loadedConfig) {
        // Atualizar a configuração global com a configuração carregada
        config = loadedConfig;
        
        // Garantir que pixelID esteja definido
        if (!config.pixelID) {
            config.pixelID = "7968324796552425"; // ID padrão como fallback
        }
        
        console.log('Inicializando script com configuração:', config);
        console.log('Produto detectado:', detectProduct());
        
        // Inicializar o Meta Pixel
        !function(f,b,e,v,n,t,s) {
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s);
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        
        // Verificar novamente antes de inicializar o pixel
        const pixelID = config.pixelID || "7968324796552425";
        console.log('Inicializando Facebook Pixel com ID:', pixelID);
        fbq('init', pixelID);
        
        // Inicializar funcionalidades do script
        if (config.useInstantPixel) {
            instantPixel();
        } else {
            waitForCookiesAndSendEvent();
        }
        
        // Configurar os botões para preservar UTM e fbclid
        setButtonsURLs();
        
        // Configurar listeners de formulários
        setFormListeners();
        
        // Enviar eventos com base nas regras de página
        sendEventsByURLMatch();
    }
    
    // Carregar configurações e inicializar o script
    loadProductConfig().then(loadedConfig => {
        // Garantir que pixelID esteja definido
        if (!loadedConfig.pixelID) {
            loadedConfig.pixelID = window.__config__.pixelID || "7968324796552425";
            console.log('Usando pixelID de fallback:', loadedConfig.pixelID);
        }
        
        // Garantir que a configuração tenha o mínimo necessário
        if (!loadedConfig.apiURL) loadedConfig.apiURL = "https://api.profdidatica.com.br";
        if (!loadedConfig.origin) loadedConfig.origin = "src";
        if (loadedConfig.isProduct === undefined) loadedConfig.isProduct = true;
        
        console.log('Configuração final:', loadedConfig);
        initializeScript(loadedConfig);
    }).catch(error => {
        console.error('Erro ao carregar configurações:', error);
        // Inicializar com configuração mínima em caso de erro
        const fallbackConfig = {
            pixelID: "7968324796552425",
            apiURL: "https://api.profdidatica.com.br",
            origin: "src",
            isProduct: true
        };
        console.log('Usando configuração de fallback:', fallbackConfig);
        initializeScript(fallbackConfig);
    });
    