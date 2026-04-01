// El Bosque de la Paz Juventud
// Script principal con toda la lógica de la aplicación

// ==================== VARIABLES GLOBALES ====================
let activeTimer = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let isTreePlanted = false;
let totalTreesPlanted = localStorage.getItem('totalTrees') ? parseInt(localStorage.getItem('totalTrees')) : 0;
let currentHours = 0;
let lockTimerInterval = null;

// Elementos del DOM
const timeButtons = document.querySelectorAll('.time-btn');
const timerDisplay = document.getElementById('timerDisplay');
const lockScreen = document.getElementById('lockScreen');
const lockTimer = document.getElementById('lockTimer');
const eagleMessage = document.getElementById('eagleMessage');
const totalTreesSpan = document.getElementById('totalTrees');
const treeVisual = document.querySelector('.tree-visual');
const progressBar = document.getElementById('progressBar');
const statusMessage = document.getElementById('statusMessage');
const warningModal = document.getElementById('warningModal');
const modalMessage = document.getElementById('modalMessage');
const confirmAbandon = document.getElementById('confirmAbandon');
const cancelAbandon = document.getElementById('cancelAbandon');
const closeModal = document.querySelector('.close-modal');

// Actualizar contador de árboles mostrado
totalTreesSpan.textContent = totalTreesPlanted;

// ==================== MENSAJES DEL ÁGUILA ====================
const eagleMessages = {
    welcome: "¡Bienvenido, joven guardián! Soy Kuna, el guardián del bosque. Elige un árbol y encuentra la paz interior.",
    selectTime: (hours) => `Has elegido ${hours} ${hours === 1 ? 'hora' : 'horas'}. Tu árbol crecerá mientras meditas. ¿Estás listo para encontrar la paz?`,
    planting: "¡Excelente! Tu árbol ha sido sembrado. La pantalla quedará bloqueada. No salgas de esta pantalla o perderás tu progreso. Respira hondo y encuentra la paz.",
    progress: (percentage) => `Tu árbol está creciendo... lleva ${percentage}% completado. Mantén la calma y la concentración.`,
    warning: "¡Cuidado, joven guardián! Si abandonas ahora, perderás tu árbol. La paz requiere disciplina.",
    success: (hours) => `¡Felicidades! Has completado ${hours} ${hours === 1 ? 'hora' : 'horas'} de meditación. Tu árbol ha crecido fuerte y hermoso. El bosque te agradece. 🌳✨`,
    abandon: "Has perdido tu árbol por abandonar la meditación. La próxima vez, mantén la concentración. Vuelve a intentarlo cuando estés listo.",
    error: "Hubo un error. Por favor, intenta de nuevo.",
    complete: "¡Has sembrado un nuevo árbol! Tu bosque interior crece cada día más fuerte."
};

// ==================== FUNCIONES DEL ÁGUILA ====================
function updateEagleMessage(message) {
    eagleMessage.textContent = message;
    // Animación sutil en la burbuja
    const bubble = document.querySelector('.speech-bubble');
    bubble.style.transform = 'scale(1.02)';
    setTimeout(() => {
        bubble.style.transform = 'scale(1)';
    }, 200);
}

// ==================== FUNCIONES DEL TEMPORIZADOR ====================
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

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
        
        // Mensaje del águila cada 25% de progreso
        if (progress === 25 || progress === 50 || progress === 75) {
            updateEagleMessage(eagleMessages.progress(Math.floor(progress)));
        }
    }
}

function updateTreeVisual(progress) {
    if (progress < 20) {
        treeVisual.textContent = '🌱';
    } else if (progress < 40) {
        treeVisual.textContent = '🌿';
    } else if (progress < 60) {
        treeVisual.textContent = '🌳';
    } else if (progress < 80) {
        treeVisual.textContent = '🌲';
    } else {
        treeVisual.textContent = '🌴';
    }
    
    // Añadir animación de crecimiento
    treeVisual.classList.add('grow-animation');
    setTimeout(() => {
        treeVisual.classList.remove('grow-animation');
    }, 500);
}

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

function completeTreeGrowth() {
    clearInterval(activeTimer);
    activeTimer = null;
    isTreePlanted = false;
    
    // Incrementar contador de árboles
    totalTreesPlanted++;
    localStorage.setItem('totalTrees', totalTreesPlanted);
    totalTreesSpan.textContent = totalTreesPlanted;
    
    // Mensaje de éxito del águila
    updateEagleMessage(eagleMessages.success(currentHours));
    
    // Mostrar mensaje de éxito
    statusMessage.textContent = `🎉 ¡Árbol sembrado con éxito! Has meditado por ${currentHours} ${currentHours === 1 ? 'hora' : 'horas'}. 🎉`;
    statusMessage.style.color = '#ffd966';
    
    // Desbloquear pantalla
    unlockScreen();
    
    // Habilitar botones de tiempo
    enableTimeButtons();
    
    // Resetear visual del árbol
    setTimeout(() => {
        treeVisual.textContent = '🌱';
        progressBar.style.width = '0%';
        statusMessage.textContent = '';
    }, 3000);
}

// ==================== SISTEMA DE BLOQUEO ====================
function lockScreenAndStart(hours) {
    isTreePlanted = true;
    lockScreen.style.display = 'flex';
    startTimer(hours);
    
    // Deshabilitar botones de tiempo
    disableTimeButtons();
    
    // Mensaje del águila
    updateEagleMessage(eagleMessages.planting);
    
    // Detectar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Prevenir botón de atrás (historial)
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', handlePopState);
    
    statusMessage.textContent = `🌳 Árbol de ${hours} ${hours === 1 ? 'hora' : 'horas'} sembrado. La pantalla está bloqueada. 🌳`;
}

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

function handleVisibilityChange() {
    if (document.hidden && isTreePlanted) {
        showWarningModal("¡Has cambiado de pestaña o aplicación! Esto cuenta como abandonar tu meditación.");
    }
}

function handleWindowBlur() {
    if (isTreePlanted) {
        showWarningModal("¡Has salido de la pantalla del bosque! Tu progreso se perderá si no regresas.");
    }
}

function handlePopState() {
    if (isTreePlanted) {
        showWarningModal("No puedes retroceder mientras tu árbol está creciendo.");
        history.pushState(null, null, location.href);
    }
}

function loseProgress() {
    if (isTreePlanted) {
        clearInterval(activeTimer);
        activeTimer = null;
        
        updateEagleMessage(eagleMessages.abandon);
        statusMessage.textContent = "❌ Has perdido tu árbol por abandonar la meditación. ❌";
        statusMessage.style.color = '#ff6b6b';
        
        unlockScreen();
        treeVisual.textContent = '🥀';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            treeVisual.textContent = '🌱';
            statusMessage.textContent = '';
        }, 3000);
    }
}

// ==================== MODAL DE ADVERTENCIA ====================
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

// ==================== CONTROL DE BOTONES ====================
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
        updateEagleMessage(eagleMessages.warning);
        return;
    }
    
    const button = event.currentTarget;
    const hours = parseInt(button.getAttribute('data-hours'));
    
    if (hours && hours >= 1 && hours <= 4) {
        updateEagleMessage(eagleMessages.selectTime(hours));
        setTimeout(() => {
            lockScreenAndStart(hours);
        }, 1000);
    }
}

// ==================== INICIALIZACIÓN ====================
function init() {
    // Configurar botones de tiempo
    timeButtons.forEach(btn => {
        btn.addEventListener('click', handleTimeSelection);
    });
    
    // Configurar modal
    confirmAbandon.addEventListener('click', confirmAbandonAction);
    cancelAbandon.addEventListener('click', closeWarningModal);
    closeModal.addEventListener('click', closeWarningModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === warningModal) {
            closeWarningModal();
        }
    });
    
    // Mensaje de bienvenida
    updateEagleMessage(eagleMessages.welcome);
    
    // Prevenir que la pantalla se apague (sugerencia)
    // Nota: Esto no es 100% efectivo, pero ayuda
    let wakeLock = null;
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator && isTreePlanted) {
                wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.log('Wake Lock no soportado:', err);
        }
    };
    
    // Intentar mantener pantalla activa cuando hay árbol plantado
    setInterval(() => {
        if (isTreePlanted) {
            requestWakeLock();
        }
    }, 60000);
    
    console.log('🌳 El Bosque de la Paz Juventud ha sido iniciado 🌳');
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

// ==================== PREVENIR RECARGA ACCIDENTAL ====================
window.addEventListener('beforeunload', (event) => {
    if (isTreePlanted) {
        event.preventDefault();
        event.returnValue = 'Tienes un árbol creciendo. ¿Estás seguro de que quieres recargar? Perderás tu progreso.';
        return event.returnValue;
    }
});

// ==================== PERSISTENCIA DE ESTADO ====================
// Guardar estado antes de recargar (opcional)
function saveCurrentState() {
    if (isTreePlanted) {
        const state = {
            remainingSeconds: remainingSeconds,
            totalSeconds: totalSeconds,
            currentHours: currentHours,
            isTreePlanted: isTreePlanted
        };
        localStorage.setItem('currentSession', JSON.stringify(state));
    } else {
        localStorage.removeItem('currentSession');
    }
}

function restoreState() {
    const savedState = localStorage.getItem('currentSession');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.isTreePlanted && state.remainingSeconds > 0) {
            updateEagleMessage("Recuperando tu árbol anterior. Continuemos con la meditación.");
            currentHours = state.currentHours;
            totalSeconds = state.totalSeconds;
            remainingSeconds = state.remainingSeconds;
            isTreePlanted = true;
            lockScreen.style.display = 'flex';
            disableTimeButtons();
            startTimer(currentHours);
            // Ajustar el temporizador al tiempo restante
            remainingSeconds = state.remainingSeconds;
            updateTimerDisplay();
            statusMessage.textContent = `🌳 Continuando meditación. Quedan ${formatTime(remainingSeconds)}. 🌳`;
        }
    }
}

// Guardar estado periódicamente
setInterval(saveCurrentState, 5000);

// Intentar restaurar estado al cargar
document.addEventListener('DOMContentLoaded', () => {
    restoreState();
});
