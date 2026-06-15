      
      
      
      
      const API_KEY = '';    //addd there api key 
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

        let chatHistory = [];
        let allChats = [];

        function newChat() {
            chatHistory = [];
            document.getElementById('chatContainer').innerHTML = `
                <div class="empty-state">
                    <h1>Chat AI</h1>
                    <p>Start a conversation with our AI assistant</p>
                </div>
            `;
            document.getElementById('messageInput').value = '';
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                sendMessage();
            }
        }

        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();

            if (!message) return;

            const chatContainer = document.getElementById('chatContainer');
            const sendBtn = document.getElementById('sendBtn');

            const emptyState = chatContainer.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user';
            userMessageDiv.innerHTML = `
                <div class="message-content">${escapeHtml(message)}</div>
                <div class="avatar">👤</div>
            `;
            chatContainer.appendChild(userMessageDiv);

            chatHistory.push({ role: 'user', content: message });
            input.value = '';
            chatContainer.scrollTop = chatContainer.scrollHeight;

            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message assistant';
            loadingDiv.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="loading">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            chatContainer.appendChild(loadingDiv);
            sendBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error('API request failed');
                }

                const data = await response.json();
                const aiMessage = data.candidates[0].content.parts[0].text;

                loadingDiv.remove();

                const assistantMessageDiv = document.createElement('div');
                assistantMessageDiv.className = 'message assistant';
                assistantMessageDiv.innerHTML = `
                    <div class="avatar">🤖</div>
                    <div class="message-content">${escapeHtml(aiMessage)}</div>
                `;
                chatContainer.appendChild(assistantMessageDiv);

                chatHistory.push({ role: 'assistant', content: aiMessage });
                saveChat();

            } catch (error) {
                loadingDiv.remove();
                const errorDiv = document.createElement('div');
                errorDiv.className = 'message assistant';
                errorDiv.innerHTML = `
                    <div class="avatar">🤖</div>
                    <div class="message-content" style="background: #fee; color: #c33;">Error: ${error.message}</div>
                `;
                chatContainer.appendChild(errorDiv);
                console.error('Error:', error);
            } finally {
                sendBtn.disabled = false;
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        function saveChat() {
            if (chatHistory.length > 0) {
                const firstMessage = chatHistory[0].content.substring(0, 30);
                const chatObj = { title: firstMessage, messages: chatHistory };
                
                if (!allChats.some(c => c.title === firstMessage)) {
                    allChats.push(chatObj);
                }
                updateHistory();
            }
        }

        function updateHistory() {
            const historyDiv = document.getElementById('history');
            historyDiv.innerHTML = allChats.map((chat, idx) => 
                `<div class="history-item" onclick="loadChat(${idx})">${chat.title}...</div>`
            ).join('');
        }

        function loadChat(idx) {
            chatHistory = allChats[idx].messages;
            const chatContainer = document.getElementById('chatContainer');
            chatContainer.innerHTML = '';
            
            chatHistory.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role}`;
                const avatar = msg.role === 'user' ? '👤' : '🤖';
                messageDiv.innerHTML = `
                    <div class="message-content">${escapeHtml(msg.content)}</div>
                    <div class="avatar">${avatar}</div>
                `;
                chatContainer.appendChild(messageDiv);
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        document.getElementById('messageInput').focus();
   