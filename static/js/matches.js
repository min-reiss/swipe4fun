// static/js/matches.js

document.addEventListener('DOMContentLoaded', () => {
    updateMatchCards();
    showWarningOnce();
});

function showWarningOnce() {
    const warningShown = sessionStorage.getItem('warning_shown');
    const warningMessage = document.getElementById('warningMessage');
    
    if (!warningShown && warningMessage) {
        warningMessage.classList.add('show');
        sessionStorage.setItem('warning_shown', 'true');
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            warningMessage.classList.remove('show');
        }, 5000);
    }
}

function updateMatchCards() {
    const likedCharacters = JSON.parse(sessionStorage.getItem('likedCharacters') || '[]');
    const dates = JSON.parse(sessionStorage.getItem('dates') || '[]');
    
    const cards = document.querySelectorAll('.match-card');
    
    cards.forEach(card => {
        const charId = card.dataset.id;
        const isLiked = likedCharacters.includes(charId);
        const chatRead = sessionStorage.getItem('chat_read_' + charId) === 'true';
        const dateDone = dates.includes(charId);
        
        card.className = 'match-card';
        if (dateDone) {
            card.classList.add('date-done');
        } else if (isLiked) {
            card.classList.add('liked');
        } else {
            card.classList.add('disliked');
        }
        
        const statusDiv = card.querySelector('.match-status');
        if (statusDiv) {
            statusDiv.textContent = dateDone ? '💜' : isLiked ? '❤️' : '✕';
        }
        
        const actionsDiv = card.querySelector('.match-card-actions');
        if (actionsDiv) {
            if (dateDone) {
                actionsDiv.innerHTML = '<button class="card-chat-btn date-done-btn" disabled>💜 Свидание было</button>';
            } else if (isLiked) {
                // Проверяем, было ли уже свидание с кем-то другим
                const hasDate = dates.length > 0;
                
                if (chatRead && !hasDate) {
                    actionsDiv.innerHTML = `
                        <button class="card-chat-btn" onclick="window.location.href='/chat/${charId}'">💬 Продолжить чат</button>
                        <button class="card-date-btn" onclick="window.goOnDate('${charId}')">💜 Свидание</button>
                    `;
                } else if (chatRead && hasDate) {
                    actionsDiv.innerHTML = `
                        <button class="card-chat-btn" onclick="window.location.href='/chat/${charId}'">💬 Продолжить чат</button>
                        <button class="card-date-btn date-done-btn" disabled>💜 Свидание уже выбрано</button>
                    `;
                } else if (!chatRead && !hasDate) {
                    actionsDiv.innerHTML = `<button class="card-chat-btn" onclick="window.location.href='/chat/${charId}'">💬 Чат</button>`;
                } else {
                    actionsDiv.innerHTML = `<button class="card-chat-btn" onclick="window.location.href='/chat/${charId}'">💬 Чат</button>`;
                }
            } else {
                actionsDiv.innerHTML = '<button class="card-chat-btn disabled" disabled>✕ Недоступен</button>';
            }
        }
    });
}

window.goOnDate = function(characterId) {
    const dates = JSON.parse(sessionStorage.getItem('dates') || '[]');
    if (!dates.includes(characterId) && dates.length === 0) {
        dates.push(characterId);
        sessionStorage.setItem('dates', JSON.stringify(dates));
        window.location.href = '/result/' + characterId + '/date_ending';
    }
};