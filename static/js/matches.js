// static/js/matches.js

document.addEventListener('DOMContentLoaded', () => {
    updateMatchCards();
});

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
                if (chatRead) {
                    actionsDiv.innerHTML = `
                        <button class="card-chat-btn" onclick="window.location.href='/chat/${charId}'">💬 Продолжить чат</button>
                        <button class="card-date-btn" onclick="window.goOnDate('${charId}')">💜 Свидание</button>
                    `;
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
    if (!dates.includes(characterId)) {
        dates.push(characterId);
        sessionStorage.setItem('dates', JSON.stringify(dates));
    }
    window.location.href = '/result/' + characterId + '/date_ending';
};