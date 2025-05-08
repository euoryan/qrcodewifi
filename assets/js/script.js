document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const ssidInput = document.getElementById('ssid');
    const passwordInput = document.getElementById('password');
    const encryptionSelect = document.getElementById('encryption');
    const includeLogoCheckbox = document.getElementById('include-logo');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const qrCodeImg = document.getElementById('qr-code');
    const logoOverlay = document.getElementById('logo-overlay');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    
    // Logo padrão
    const defaultLogo = `<svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" fill="#3b82f6"/>
        <text x="100" y="120" font-family="Arial" font-size="60" text-anchor="middle" fill="white">A</text>
    </svg>`;
    
    // Inicializar e carregar a logo
    initializeLogo();
    
    // Event listeners
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    includeLogoCheckbox.addEventListener('change', toggleLogoOverlay);
    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadQRCode);
    shareBtn.addEventListener('click', shareQRCode);
    
    /**
     * Carrega a logo personalizada ou usa a padrão
     */
    function initializeLogo() {
        fetch('logo-alexandre-a.svg')
            .then(response => {
                if (!response.ok) throw new Error('Logo não encontrada');
                return response.text();
            })
            .then(svgData => {
                // Inserir no header
                document.querySelector('.logo').outerHTML = svgData;
                
                // Inserir no overlay
                logoOverlay.innerHTML = svgData;
                
                // Estilizar a logo no overlay
                const logoInOverlay = logoOverlay.querySelector('svg');
                if (logoInOverlay) {
                    logoInOverlay.setAttribute('width', '40');
                    logoInOverlay.setAttribute('height', '40');
                    logoInOverlay.style.position = 'absolute';
                    logoInOverlay.style.filter = 'drop-shadow(0px 0px 2px white)';
                }
            })
            .catch(() => {
                // Usar logo padrão em caso de erro
                document.querySelector('.logo').outerHTML = defaultLogo;
                logoOverlay.innerHTML = defaultLogo;
            });
    }
    
    /**
     * Alterna a visibilidade da senha
     */
    function togglePasswordVisibility() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Atualizar ícone
        this.querySelector('svg').innerHTML = type === 'password' ? 
            `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>` :
            `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    }
    
    /**
     * Mostra ou oculta a logo no QR code
     */
    function toggleLogoOverlay() {
        logoOverlay.classList.toggle('hidden', !this.checked);
    }
    
    /**
     * Gera o QR code com base nos dados de entrada
     */
    function generateQRCode() {
        const ssid = ssidInput.value.trim();
        const password = passwordInput.value;
        const encryption = encryptionSelect.value;
        
        if (!ssid) {
            alert('Por favor, informe o nome da rede WiFi.');
            return;
        }
        
        // Gerar texto para o QR code
        let qrText = `WIFI:S:${ssid};`;
        
        if (encryption === 'nopass') {
            qrText += 'T:nopass;';
        } else {
            qrText += `T:${encryption};P:${password};`;
        }
        
        qrText += 'H:false;;';
        
        // Atualizar QR code
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
        
        // Habilitar botões e mostrar logo
        downloadBtn.disabled = false;
        shareBtn.disabled = false;
        logoOverlay.classList.toggle('hidden', !includeLogoCheckbox.checked);
    }
    
    /**
     * Faz o download do QR code como imagem PNG
     */
    function downloadQRCode() {
        const ssid = ssidInput.value.trim();
        if (!ssid) return;
        
        // Limpar o canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Carregar a imagem do QR code
        const qrImage = new Image();
        qrImage.crossOrigin = 'Anonymous';
        qrImage.onload = function() {
            // Desenhar o QR code no canvas
            ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height);
            
            // Se a opção de incluir logo estiver marcada
            if (includeLogoCheckbox.checked) {
                addLogoToCanvas(finalizarDownload);
            } else {
                finalizarDownload();
            }
        };
        qrImage.src = qrCodeImg.src;
        
        function finalizarDownload() {
            // Converter o canvas para PNG
            const dataUrl = canvas.toDataURL('image/png');
            
            // Criar link para download
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `wifi-${ssid}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }
    
    /**
     * Compartilha o QR code usando a Web Share API
     */
    function shareQRCode() {
        const ssid = ssidInput.value.trim();
        if (!ssid || !navigator.share) {
            alert('Compartilhamento não disponível no seu navegador.');
            return;
        }
        
        // Criar uma imagem do QR code para compartilhar
        const qrImage = new Image();
        qrImage.crossOrigin = 'Anonymous';
        qrImage.src = qrCodeImg.src;
        
        qrImage.onload = function() {
            // Limpar o canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar QR code
            ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height);
            
            // Se a opção de incluir logo estiver marcada
            if (includeLogoCheckbox.checked) {
                addLogoToCanvas(compartilharImagem);
            } else {
                compartilharImagem();
            }
        };
        
        async function compartilharImagem() {
            try {
                // Converter o canvas para um blob
                canvas.toBlob(async function(blob) {
                    const file = new File([blob], `wifi-${ssid}.png`, { type: 'image/png' });
                    
                    // Compartilhar usando a Web Share API
                    await navigator.share({
                        files: [file],
                        title: 'WiFi Connect QR Code',
                        text: `Conecte-se à rede WiFi: ${ssid}`
                    });
                }, 'image/png');
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
                
                // Tentar compartilhar apenas o texto se o compartilhamento da imagem falhar
                try {
                    await navigator.share({
                        title: 'WiFi Connect QR Code',
                        text: `Conecte-se à rede WiFi: ${ssid}`
                    });
                } catch (err) {
                    alert('Não foi possível compartilhar o QR code.');
                }
            }
        }
    }
    
    /**
     * Adiciona a logo ao canvas do QR code
     * @param {Function} callback - Função a ser chamada após adicionar a logo
     */
    function addLogoToCanvas(callback) {
        const logoSvg = logoOverlay.querySelector('svg');
        if (logoSvg) {
            // Converter SVG para uma string de dados
            const serializer = new XMLSerializer();
            const logoSvgString = serializer.serializeToString(logoSvg);
            const logoDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSvgString);
            
            // Criar uma imagem a partir do SVG
            const logoImg = new Image();
            logoImg.onload = function() {
                // Adicionar um fundo branco para a logo
                ctx.fillStyle = 'white';
                ctx.fillRect(canvas.width/2 - 20, canvas.height/2 - 20, 40, 40);
                
                // Desenhar a logo no centro do QR code
                ctx.drawImage(logoImg, canvas.width/2 - 20, canvas.height/2 - 20, 40, 40);
                
                // Executar callback quando terminar
                callback();
            };
            logoImg.src = logoDataUrl;
        } else {
            callback();
        }
    }
});