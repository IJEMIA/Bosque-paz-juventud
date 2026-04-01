// El Bosque de la Paz Juventud
// Versión simplificada y funcional

// ========== VARIABLES ==========
let activeTimer = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let isTreePlanted = false;
let currentHours = 0;
let totalTreesPlanted = localStorage.getItem('totalTrees') ? parseInt(localStorage.getItem('totalTrees')) : 0;

// ========== ELEMENTOS DEL DOM ==========
const timeButtons = document.querySelectorAll('.time-btn');
const timerDisplay = document.getElementById('timerDisplay');
const lockScreen = document.getElementById('lockScreen');
const lockTimer = document.getElementById('lockTimer');
const totalTreesSpan = document.getElementById('totalTrees');
const treeVisual = document.getElementById('treeVisual');
const progressBar = document.getElementById('progressBar');
const statusMessage = document.getElementById('statusMessage');
const warningModal = document.getElementById('warningModal');
const modalMessage = document.getElementById('modalMessage');
const confirmAbandon = document.getElementById('confirmAbandon');
const cancelAbandon = document.getElementById('cancelAbandon');
const closeModal = document.querySelector('.close-modal');

// Actualizar contador de árboles
totalTreesSpan.textContent = totalTreesPlanted;

// ========== FUNCIONES ==========

// Formatear tiempo HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Actualizar displays del temporizador
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    if (lockTimer) {
        lockTimer.textContent = formatTime(remainingSeconds);
    }
    
    // Actualizar barra de progreso
    if (totalSeconds > 0) {
        const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Actualizar visual del árbol según progreso
        updateTreeVisual(progress);
    }
}

// Actualizar visual del árbol según progreso
function updateTreeVisual(progress) {
    if (progress < 25) {
        treeVisual.textContent = '🌱';
    } else if (progress < 50) {
        treeVisual.textContent = '🌿';
    } else if (progress < 75) {
        treeVisual.textContent = '🌳';
    } else {
        treeVisual.textContent = '🌲';
    }
    
    // Animación de crecimiento
    treeVisual.classList.add('grow-animation');
    setTimeout(() => {
        treeVisual.classList.remove('grow-animation');
    }, 500);
}

// Iniciar temporizador
function startTimer(hours) {
    if (activeTimer) {
        clearInterval(activeTimer);
    }
    
    currentHours = hours;
    totalSeconds = hours * 3600;
    remainingSeconds = totalSeconds;
    updateTimerDisplay();
    
    activeTimer = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateTimerDisplay();
            
            if (remainingSeconds === 0) {
                completeTreeGrowth();
            }
        }
    }, 1000);
}

// Completar crecimiento del árbol
function completeTreeGrowth() {
    clearInterval(activeTimer);
    activeTimer = null;
    isTreePlanted = false;
    
    // Incrementar contador
    totalTreesPlanted++;
    localStorage.setItem('totalTrees', totalTreesPlanted);
    totalTreesSpan.textContent = totalTreesPlanted;
    
    // Mensaje de éxito
    statusMessage.textContent = `🎉 ¡Árbol sembrado con éxito! Meditaste por ${currentHours} ${currentHours === 1 ? 'hora' : 'horas'}. 🎉`;
    statusMessage.style.color = '#ffd966';
    
    // Desbloquear pantalla
    unlockScreen();
    
    // Habilitar botones
    enableTimeButtons();
    
    // Resetear visual
    setTimeout(() => {
        treeVisual.textContent = '🌱';
        progressBar.style.width = '0%';
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    }, 2000);
}

// Bloquear pantalla e iniciar siembra
function lockScreenAndStart(hours) {
    isTreePlanted = true;
    lockScreen.style.display = 'flex';
    startTimer(hours);
    
    // Deshabilitar botones
    disableTimeButtons();
    
    // Mensaje de estado
    statusMessage.textContent = `🌳 Árbol de ${hours} ${hours === 1 ? 'hora' : 'horas'} sembrado. Pantalla bloqueada. 🌳`;
    statusMessage.style.color = '#ffd966';
    
    // Detectar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Prevenir botón de atrás
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', handlePopState);
}

// Desbloquear pantalla
function unlockScreen() {
    lockScreen.style.display = 'none';
    isTreePlanted = false;
    
    // Remover listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('popstate', handlePopState);
    
    if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
    }
    
    enableTimeButtons();
}

// Perder progreso
function loseProgress() {
    if (isTreePlanted) {
        clearInterval(activeTimer);
        activeTimer = null;
        
        statusMessage.textContent = "❌ Has perdido tu árbol por abandonar la meditación. ❌";
        statusMessage.style.color = '#ff6b6b';
        
        unlockScreen();
        treeVisual.textContent = '🥀';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            treeVisual.textContent = '🌱';
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 2000);
        }, 2000);
    }
}

// ========== MANEJADORES DE EVENTOS ==========

function handleVisibilityChange() {
    if (document.hidden && isTreePlanted) {
        showWarningModal("¡Has cambiado de pestaña! Esto cuenta como abandonar tu meditación.");
    }
}

function handleWindowBlur() {
    if (isTreePlanted) {
        showWarningModal("¡Has salido de la pantalla! Tu progreso se perderá.");
    }
}

function handlePopState() {
    if (isTreePlanted) {
        showWarningModal("No puedes retroceder mientras tu árbol está creciendo.");
        history.pushState(null, null, location.href);
    }
}

function showWarningModal(message) {
    modalMessage.textContent = message;
    warningModal.style.display = 'flex';
}

function closeWarningModal() {
    warningModal.style.display = 'none';
}

function confirmAbandonAction() {
    closeWarningModal();
    if (isTreePlanted) {
        loseProgress();
    }
}

function disableTimeButtons() {
    timeButtons.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });
}

function enableTimeButtons() {
    timeButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('disabled');
    });
}

function handleTimeSelection(event) {
    if (isTreePlanted) {
        statusMessage.textContent = "⚠️ Ya tienes un árbol creciendo. Termina tu meditación primero. ⚠️";
        return;
    }
    
    const button = event.currentTarget;
    const hours = parseInt(button.getAttribute('data-hours'));
    
    if (hours >= 1 && hours <= 4) {
        lockScreenAndStart(hours);
    }
}

// ========== INICIALIZACIÓN ==========
function init() {
    // Configurar botones
    timeButtons.forEach(btn => {
        btn.addEventListener('click', handleTimeSelection);
    });
    
    // Configurar modal
    if (confirmAbandon) confirmAbandon.addEventListener('click', confirmAbandonAction);
    if (cancelAbandon) cancelAbandon.addEventListener('click', closeWarningModal);
    if (closeModal) closeModal.addEventListener('click', closeWarningModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === warningModal) {
            closeWarningModal();
        }
    });
    
    console.log('🌳 El Bosque de la Paz Juventud iniciado 🌳');
}

// Prevenir recarga accidental
window.addEventListener('beforeunload', (event) => {
    if (isTreePlanted) {
        event.preventDefault();
        event.returnValue = 'Tienes un árbol creciendo. ¿Seguro quieres recargar?';
        return event.returnValue;
    }
});

// Iniciar app
document.addEventListener('DOMContentLoaded', init);
