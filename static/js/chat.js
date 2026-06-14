// static/js/chat.js

class DialogChat {
    constructor(dialogData, characterId) {
        console.log('DialogChat constructor called');
        console.log('dialogData:', dialogData);
        console.log('characterId:', characterId);
        
        this.dialog = dialogData;
        this.characterId = characterId;
        this.currentMessageIndex = 0;
        this.chatMessages = document.getElementById('chatMessages');
        this.chatChoices = document.getElementById('chatChoices');
        
        if (!this.chatMessages) {
            console.error('chatMessages element not found!');
            return;
        }
        if (!this.chatChoices) {
            console.error('chatChoices element not found!');
            return;
        }
        
        console.log('Chat elements found, starting dialog...');
        this.init();
    }
    
    init() {
        // Проверяем, что диалог загружен
        if (!this.dialog || !this.dialog.messages) {
            console.error('No dialog data!');
            this.chatMessages.innerHTML = '<div class="message candidate-message">Ошибка загрузки диалога 😢</div>';
            return;
        }
        
        // Показываем первое сообщение
        setTimeout(() => {
            this.showNextMessage();
        }, 500);
    }
    
    showNextMessage() {
        console.log('Showing message index:', this.currentMessageIndex);
        
        if (this.currentMessageIndex >= this.dialog.messages.length) {
            console.log('No more messages');
            return;
        }
        
        const message = this.dialog.messages[this.currentMessageIndex];
        console.log('Current message:', message);
        
        if (message.from === 'candidate') {
            this.showCandidateMessage(message);
        } else if (message.from === 'bride') {
            this.showBrideChoices(message);
        }
    }
    
    showCandidateMessage(message) {
        console.log('Showing candidate message:', message.text);
        
        // Создаем контейнер для сообщения
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message candidate-message';
        this.chatMessages.appendChild(messageDiv);
        
        // Простой вариант - показываем текст сразу (для теста)
        messageDiv.textContent = message.text;
        
        // Переходим к следующему сообщению
        setTimeout(() => {
            this.currentMessageIndex++;
            this.showNextMessage();
            this.scrollToBottom();
        }, 1000);
    }
    
    showBrideChoices(message) {
        console.log('Showing choices:', message.choices);
        
        this.chatChoices.innerHTML = '';
        
        message.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            
            button.addEventListener('click', () => {
                console.log('Choice selected:', choice);
                this.handleChoice(choice);
            });
            
            this.chatChoices.appendChild(button);
        });
        
        this.scrollToBottom();
    }
    
    handleChoice(choice) {
        console.log('Handling choice:', choice);
        
        // Скрываем кнопки выбора
        this.chatChoices.innerHTML = '';
        
        // Показываем ответ невесты
        const brideMessage = document.createElement('div');
        brideMessage.className = 'message bride-message';
        brideMessage.textContent = choice.text;
        this.chatMessages.appendChild(brideMessage);
        
        // Показываем ответ кандидата (если есть)
        if (choice.reply) {
            setTimeout(() => {
                const replyMessage = document.createElement('div');
                replyMessage.className = 'message candidate-message';
                replyMessage.textContent = choice.reply;
                this.chatMessages.appendChild(replyMessage);
                
                setTimeout(() => {
                    this.showEnding(choice.next);
                }, 1500);
            }, 1000);
        } else {
            setTimeout(() => {
                this.showEnding(choice.next);
            }, 1000);
        }
    }
    
    showEnding(endingKey) {
        console.log('Showing ending:', endingKey);
        window.location.href = `/result/${this.characterId}/${endingKey}`;
    }
    
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Запускаем когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking dialogData...');
    console.log('dialogData exists:', typeof dialogData !== 'undefined');
    console.log('characterId exists:', typeof characterId !== 'undefined');
    
    if (typeof dialogData !== 'undefined' && typeof characterId !== 'undefined') {
        console.log('Starting DialogChat...');
        new DialogChat(dialogData, characterId);
    } else {
        console.error('dialogData or characterId not defined!');
    }
});