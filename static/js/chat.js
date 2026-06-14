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
        this.isTyping = false; // Флаг, чтобы предотвратить множественный ввод
        
        // Инициализация аудио контекста для звуков
        this.audioContext = null;
        
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
    
    // Инициализация аудио
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Звук отправки сообщения
    playMessageSound() {
        this.initAudio();
        
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Короткий приятный звук
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Звук получения сообщения
    playReceiveSound() {
        this.initAudio();
        
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Более низкий звук для входящих
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
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
        
        // Проигрываем звук получения сообщения
        this.playReceiveSound();
        
        // Эффект печатания текста
        this.typeText(messageDiv, message.text, () => {
            // После завершения печати показываем следующее сообщение
            setTimeout(() => {
                this.currentMessageIndex++;
                this.showNextMessage();
                this.scrollToBottom();
            }, 500);
        });
    }
    
    typeText(element, text, callback) {
        let index = 0;
        element.textContent = '';
        
        // Добавляем индикатор печати
        const typingDots = document.createElement('span');
        typingDots.className = 'typing-indicator';
        typingDots.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        element.appendChild(typingDots);
        
        const interval = setInterval(() => {
            if (index < text.length) {
                // Убираем индикатор печати перед добавлением первой буквы
                if (index === 0 && typingDots.parentNode) {
                    typingDots.remove();
                }
                
                element.textContent += text[index];
                index++;
                this.scrollToBottom();
                
                // Случайный звук печати (не на каждую букву)
                if (Math.random() < 0.3) {
                    this.playTypingSound();
                }
            } else {
                clearInterval(interval);
                
                // Убираем индикатор, если текст пустой
                if (typingDots.parentNode) {
                    typingDots.remove();
                }
                
                if (callback) callback();
            }
        }, 40); // Скорость печати - 40мс на символ
    }
    
    // Звук печати (очень тихий)
    playTypingSound() {
        this.initAudio();
        
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000 + Math.random() * 500, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.03);
    }
    
    showBrideChoices(message) {
        console.log('Showing choices:', message.choices);
        
        this.chatChoices.innerHTML = '';
        
        message.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.style.animationDelay = `${index * 0.2}s`;
            
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
        
        // Блокируем повторные клики
        if (this.isTyping) return;
        this.isTyping = true;
        
        // Скрываем кнопки выбора
        this.chatChoices.innerHTML = '';
        
        // Проигрываем звук отправки
        this.playMessageSound();
        
        // Показываем ответ невесты
        const brideMessage = document.createElement('div');
        brideMessage.className = 'message bride-message';
        brideMessage.textContent = choice.text;
        this.chatMessages.appendChild(brideMessage);
        this.scrollToBottom();
        
        // Показываем ответ кандидата (если есть)
        if (choice.reply) {
            setTimeout(() => {
                const replyMessage = document.createElement('div');
                replyMessage.className = 'message candidate-message';
                this.chatMessages.appendChild(replyMessage);
                
                // Проигрываем звук получения
                this.playReceiveSound();
                
                // Печатаем ответ с анимацией
                this.typeText(replyMessage, choice.reply, () => {
                    setTimeout(() => {
                        this.showEnding(choice.next);
                    }, 1500);
                });
            }, 1000);
        } else {
            setTimeout(() => {
                this.showEnding(choice.next);
            }, 1000);
        }
    }
    
    showEnding(endingKey) {
        console.log('Showing ending:', endingKey);
        
        // Проигрываем финальный звук
        this.playEndingSound();
        
        setTimeout(() => {
            window.location.href = `/result/${this.characterId}/${endingKey}`;
        }, 600);
    }
    
    // Финальный звук
    playEndingSound() {
        this.initAudio();
        
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // До-Ми-Соль-До
        const duration = 0.15;
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + i * duration);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (i + 1) * duration);
            oscillator.start(this.audioContext.currentTime + i * duration);
            oscillator.stop(this.audioContext.currentTime + (i + 1) * duration);
        });
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