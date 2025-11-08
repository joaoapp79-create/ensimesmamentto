// GALERIA DE ARTE - JavaScript Corrigido

// Elementos DOM
const mainScreen = document.getElementById('main-screen');
const feedScreen = document.getElementById('feed-screen');
const photosBtn = document.getElementById('photos-btn');
const backBtn = document.getElementById('back-btn');
const feedGrid = document.getElementById('feed-grid');
const fileInput = document.getElementById('file-input');
const uploadTriggerFeed = document.getElementById('upload-trigger-feed');
const imagePreview = document.getElementById('image-preview');
const previewImage = document.getElementById('preview-image');

// Estado da galeria
let userPhotos = JSON.parse(localStorage.getItem('userPhotos')) || [];
let selectedImages = new Set();

// Inicialização
function init() {
    console.log('Inicializando galeria de arte...');
    console.log('Obras carregadas:', userPhotos.length);
    loadFeedPhotos();
    setupEventListeners();
    updateImageCount();
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    photosBtn.addEventListener('click', openFeed);
    backBtn.addEventListener('click', closeFeed);
    uploadTriggerFeed.addEventListener('click', () => {
        console.log('Clicou no upload');
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileUpload);
    
    // Toolbar actions
    const selectAllBtn = document.getElementById('select-all');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAll);
    }
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelected);
    }
    
    // Preview
    const closePreviewBtn = document.querySelector('.close-preview');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closePreview);
    }
    
    if (imagePreview) {
        imagePreview.addEventListener('click', (e) => {
            if (e.target === imagePreview) closePreview();
        });
    }
    
    // Teclas
    document.addEventListener('keydown', handleKeyPress);
}

// Abrir galeria
function openFeed() {
    console.log('Abrindo galeria de arte...');
    if (feedScreen) {
        feedScreen.classList.add('active');
        if (mainScreen) {
            mainScreen.style.opacity = '0';
            mainScreen.style.visibility = 'hidden';
        }
        selectedImages.clear();
        updateUI();
    }
}

// Fechar galeria
function closeFeed() {
    if (feedScreen) {
        feedScreen.classList.remove('active');
        if (mainScreen) {
            mainScreen.style.opacity = '1';
            mainScreen.style.visibility = 'visible';
        }
    }
}

// Carregar imagens
function loadFeedPhotos() {
    console.log('Carregando obras:', userPhotos);
    renderFeedPhotos();
    updateImageCount();
}

// Renderizar imagens na galeria
function renderFeedPhotos() {
    console.log('Renderizando obras...');
    
    if (!feedGrid) return;
    
    if (userPhotos.length === 0) {
        feedGrid.innerHTML = '<div class="feed-item empty">Sua galeria está vazia<br><span style="font-size: 0.8rem; opacity: 0.7;">Clique em "Adicionar Arte" para começar</span></div>';
        return;
    }
    
    feedGrid.innerHTML = '';
    
    userPhotos.forEach((photoData, index) => {
        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${selectedImages.has(index) ? 'selected' : ''}`;
        
        const fileSize = photoData.size ? (photoData.size / 1024).toFixed(1) : '?';
        const date = photoData.timestamp ? new Date(photoData.timestamp).toLocaleDateString() : 'Data desconhecida';
        const fileName = photoData.name || `obra_${index + 1}`;
        
        feedItem.innerHTML = `
            <img src="${photoData.url}" alt="${fileName}" loading="lazy">
            <button class="delete-btn" data-index="${index}">×</button>
            <div class="image-info">
                ${fileName}<br>
                ${fileSize}KB • ${date}
            </div>
        `;
        
        // Eventos
        const deleteBtn = feedItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSingleImage(index);
        });
        
        // Click para selecionar/preview
        feedItem.addEventListener('click', (e) => {
            if (e.target !== deleteBtn) {
                if (e.ctrlKey || e.metaKey) {
                    toggleImageSelection(index);
                } else {
                    openPreview(photoData.url);
                }
            }
        });
        
        feedGrid.appendChild(feedItem);
    });
}

// Selecionar/deselecionar imagem
function toggleImageSelection(index) {
    if (selectedImages.has(index)) {
        selectedImages.delete(index);
    } else {
        selectedImages.add(index);
    }
    updateUI();
}

// Selecionar todas as imagens
function toggleSelectAll() {
    if (selectedImages.size === userPhotos.length) {
        selectedImages.clear();
    } else {
        userPhotos.forEach((_, index) => selectedImages.add(index));
    }
    updateUI();
}

// Excluir imagens selecionadas
function deleteSelected() {
    if (selectedImages.size === 0) return;
    
    if (confirm(`Excluir ${selectedImages.size} obra(s) selecionada(s)?`)) {
        // Remove em ordem decrescente para não afetar os índices
        const sortedIndexes = Array.from(selectedImages).sort((a, b) => b - a);
        sortedIndexes.forEach(index => {
            userPhotos.splice(index, 1);
        });
        
        selectedImages.clear();
        savePhotos();
        renderFeedPhotos();
        updateImageCount();
    }
}

// Excluir imagem única
function deleteSingleImage(index) {
    if (confirm('Excluir esta obra?')) {
        userPhotos.splice(index, 1);
        selectedImages.delete(index);
        savePhotos();
        renderFeedPhotos();
        updateImageCount();
    }
}

// Preview de imagem
function openPreview(imageUrl) {
    if (previewImage && imagePreview) {
        previewImage.src = imageUrl;
        imagePreview.classList.add('active');
    }
}

function closePreview() {
    if (imagePreview) {
        imagePreview.classList.remove('active');
    }
}

// Atualizar UI
function updateUI() {
    const feedItems = document.querySelectorAll('.feed-item');
    feedItems.forEach((item, index) => {
        if (selectedImages.has(index)) {
            item.style.borderColor = 'rgba(155,89,255,0.8)';
            item.style.boxShadow = '0 0 0 2px rgba(155,89,255,0.5)';
        } else {
            item.style.borderColor = '';
            item.style.boxShadow = '';
        }
    });
    
    // Atualizar botões da toolbar
    const selectAllBtn = document.getElementById('select-all');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    
    if (selectAllBtn) {
        selectAllBtn.textContent = selectedImages.size === userPhotos.length ? 'Deselecionar Tudo' : 'Selecionar Tudo';
    }
    if (deleteSelectedBtn) {
        deleteSelectedBtn.disabled = selectedImages.size === 0;
    }
}

// Upload múltiplo - CORRIGIDO
function handleFileUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    
    console.log('Arquivos selecionados:', files.length);
    
    let uploadCount = 0;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const totalImages = imageFiles.length;
    
    console.log('Imagens válidas:', totalImages);
    
    if (totalImages === 0) {
        alert('Por favor, selecione apenas arquivos de imagem!');
        return;
    }
    
    imageFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const photoData = {
                url: event.target.result,
                name: file.name,
                timestamp: new Date().toISOString(),
                size: file.size
            };
            
            userPhotos.unshift(photoData);
            uploadCount++;
            
            console.log(`Upload ${uploadCount}/${totalImages}:`, file.name);
            
            if (uploadCount === totalImages) {
                console.log('Todos os uploads completos, salvando...');
                savePhotos();
                renderFeedPhotos();
                updateImageCount();
                showUploadFeedback(uploadCount);
            }
        };
        
        reader.onerror = (error) => {
            console.error('Erro ao ler arquivo:', file.name, error);
            uploadCount++;
        };
        
        reader.readAsDataURL(file);
    });
    
    fileInput.value = '';
}

// Salvar fotos no localStorage
function savePhotos() {
    if (userPhotos.length > 100) {
        userPhotos = userPhotos.slice(0, 100);
    }
    
    localStorage.setItem('userPhotos', JSON.stringify(userPhotos));
    console.log('Obras salvas no localStorage:', userPhotos.length);
}

// Feedback visual no upload
function showUploadFeedback(count) {
    if (uploadTriggerFeed) {
        uploadTriggerFeed.style.background = 'rgba(155, 89, 255, 0.3)';
        uploadTriggerFeed.style.borderColor = 'rgba(155, 89, 255, 0.8)';
        uploadTriggerFeed.textContent = `✓ ${count} Obra(s) Adicionada(s)!`;
        
        setTimeout(() => {
            uploadTriggerFeed.style.background = '';
            uploadTriggerFeed.style.borderColor = '';
            uploadTriggerFeed.textContent = '+ Adicionar Arte';
        }, 3000);
    }
}

// Contador de imagens
function updateImageCount() {
    const countElement = document.getElementById('image-count');
    if (countElement) {
        countElement.textContent = `${userPhotos.length} obra(s)`;
        console.log('Contador atualizado:', userPhotos.length);
    }
}

// Teclas de atalho
function handleKeyPress(e) {
    if (!feedScreen || !feedScreen.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        if (imagePreview && imagePreview.classList.contains('active')) {
            closePreview();
        } else {
            closeFeed();
        }
    }
    
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSelectAll();
    }
    
    if (e.key === 'Delete' && selectedImages.size > 0) {
        deleteSelected();
    }
}

// Inicializar app quando DOM carregar
document.addEventListener('DOMContentLoaded', init);