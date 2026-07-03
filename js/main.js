// ===== ОПРЕДЕЛЕНИЕ НОМЕРА МОДУЛЯ =====
function getCurrentModuleNumber() {
    const url = window.location.pathname;
    const match = url.match(/module(\d+)\.html$/);
    return match ? parseInt(match[1]) : null;
}

// ===== КОПИРОВАНИЕ КОДА =====
function copyCode(button) {
    const codeBlock = button.parentElement;
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✓ Скопировано';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '📋 Копировать';
            button.classList.remove('copied');
        }, 2000);
    });
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЗАДАНИЙ =====
function toggleTask(element) {
    element.classList.toggle('completed');
    updateProgress();
}

// ===== ПЕРЕКЛЮЧЕНИЕ ОТВЕТА =====
function toggleAnswer(element) {
    const answer = element.nextElementSibling;
    answer.classList.toggle('show');
    const arrow = element.querySelector('span:last-child');
    arrow.textContent = answer.classList.contains('show') ? '▲' : '▼';
}

// ===== ПРОГРЕСС =====
function updateProgress() {
    const tasks = document.querySelectorAll('.task-item');
    const completed = document.querySelectorAll('.task-item.completed');
    if (tasks.length === 0) return;
    const percent = Math.round((completed.length / tasks.length) * 100);
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = percent + '% завершено';
    const moduleNum = getCurrentModuleNumber();
    if (moduleNum) {
        localStorage.setItem(`module${moduleNum}-progress`, percent);
    }
}

function loadModuleProgress() {
    const moduleNum = getCurrentModuleNumber();
    if (!moduleNum) return;
    const saved = localStorage.getItem(`module${moduleNum}-progress`);
    if (saved !== null) {
        const fill = document.getElementById('progressFill');
        const text = document.getElementById('progressText');
        if (fill) fill.style.width = saved + '%';
        if (text) text.textContent = saved + '% завершено';
    }
}

function loadOverallProgress() {
    const totalModules = 13;
    let sum = 0;
    for (let i = 1; i <= totalModules; i++) {
        const val = localStorage.getItem(`module${i}-progress`);
        if (val !== null) sum += parseInt(val);
    }
    const overallPercent = Math.round(sum / totalModules);
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = overallPercent + '%';
    if (text) text.textContent = overallPercent + '% завершено';
}

// ===== ЗАГРУЗКА ПРОГРЕССА НА КАРТОЧКИ МОДУЛЕЙ =====
function loadModuleCardsProgress() {
    const cards = document.querySelectorAll('.module-card');
    let totalProgress = 0;
    let completedModules = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    cards.forEach((card) => {
        const moduleNum = card.getAttribute('data-module');
        const progress = localStorage.getItem(`module${moduleNum}-progress`);
        const fill = card.querySelector('.progress-fill');
        const label = card.querySelector('.progress-label');

        if (progress !== null) {
            const percent = parseInt(progress);
            totalProgress += percent;
            totalTasks += 100;

            if (fill) fill.style.width = percent + '%';
            if (label) label.textContent = percent + '%';

            if (percent === 100) {
                card.classList.add('completed');
                completedModules++;
            }
        }
    });

    const overallPercent = Math.round(totalProgress / 13);
    const completedModulesEl = document.getElementById('completedModules');
    const overallProgressEl = document.getElementById('overallProgress');
    const completedTasksEl = document.getElementById('completedTasks');
    const estimatedTimeEl = document.getElementById('estimatedTime');

    if (completedModulesEl) completedModulesEl.textContent = `${completedModules}/13`;
    if (overallProgressEl) overallProgressEl.textContent = overallPercent + '%';
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;

    const remainingHours = Math.max(1, 13 - completedModules);
    if (estimatedTimeEl) estimatedTimeEl.textContent = `~${remainingHours}ч`;
}

// ===== СБРОС ПРОГРЕССА =====
function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
        for (let i = 1; i <= 13; i++) {
            localStorage.removeItem(`module${i}-progress`);
        }
        localStorage.removeItem('linux-course-theme');
        location.reload();
    }
}

// ===== ТЕМА =====
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('linux-course-theme', theme);
    updateThemeToggleIcon();
}

function loadTheme() {
    const saved = localStorage.getItem('linux-course-theme');
    if (saved === 'light') document.body.classList.add('light-theme');
    updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        const isLight = document.body.classList.contains('light-theme');
        btn.innerHTML = isLight ? '🌙 Тёмная тема' : '☀️ Светлая тема';
    }
}

// ===== БОКОВОЕ МЕНЮ: ГЛАВНАЯ =====
function addHomeLinkToSidebar() {
    const navList = document.querySelector('.sidebar .nav-list');
    if (!navList) return;

    // Проверяем, не на главной ли мы странице
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        return; // Не добавляем ссылку на главную, если мы уже на ней
    }

    const existing = Array.from(navList.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '../index.html' || a.getAttribute('href') === 'index.html'
    );
    if (existing) return;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '../index.html';
    a.className = 'nav-item';
    a.textContent = '🏠 Главная';
    li.appendChild(a);
    navList.insertBefore(li, navList.firstChild);
}

// ===== КНОПКА ВВЕРХ =====
function initScrollToTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Наверх');
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    addHomeLinkToSidebar();
    initScrollToTopButton();

    const moduleNum = getCurrentModuleNumber();
    if (moduleNum) {
        loadModuleProgress();
    } else {
        loadOverallProgress();
        loadModuleCardsProgress();
    }

    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('completed');
            updateProgress();
        });
    });

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});