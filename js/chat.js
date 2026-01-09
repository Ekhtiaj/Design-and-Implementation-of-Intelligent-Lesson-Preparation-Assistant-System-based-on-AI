// Update the complete chat.js file with this code
const content = document.getElementById('content');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

let isAnswerLoading = false;
let answerSectionId = 0;

sendButton.addEventListener('click', () => handleSendMessage());
chatInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') handleSendMessage();
});

function handleSendMessage() {
    const question = chatInput.value.trim();
    if (question === '' || isAnswerLoading) return;
    
    sendButton.disabled = true;
    addQuestionSection(question);
    chatInput.value = '';
}

function getAnswer(question) {
    fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Intelligent Lesson Preparation Assistant"
        },
        body: JSON.stringify({
            "model": MODEL,
            "messages": [{
                "role": "user",
                "content": question
            }]
        })
    })
    .then(response => response.json())
    .then(data => {
        const resultData = data.choices[0].message.content;
        isAnswerLoading = false;
        addAnswerSection(marked.parse(resultData)); // Add markdown parsing here
    })
    .catch(error => {
        console.error("Error:", error);
        addAnswerSection(`<div class="error">
            <i class="fas fa-exclamation-triangle"></i> Error: ${error.message}
        </div>`);
    })
    .finally(() => {
        scrollToBottom();
        sendButton.disabled = false;
    });
}

function addQuestionSection(message) {
    isAnswerLoading = true;
    const sectionElement = document.createElement('section');
    sectionElement.className = 'question-section';
    sectionElement.innerHTML = marked.parse(message);
    content.appendChild(sectionElement);
    addAnswerSection(message);
    scrollToBottom();
}

function addAnswerSection(message) {
    if (isAnswerLoading) {
        answerSectionId++;
        const sectionElement = document.createElement('section');
        sectionElement.className = 'answer-section';
        sectionElement.innerHTML = getLoadingSvg();
        sectionElement.id = answerSectionId;
        content.appendChild(sectionElement);
        getAnswer(message);
    } else {
        const answerSectionElement = document.getElementById(answerSectionId);
        if (answerSectionElement) {
            answerSectionElement.innerHTML = marked.parse(message);
        }
    }
}

function scrollToBottom() {
    content.scrollTo({
        top: content.scrollHeight,
        behavior: 'smooth'
    });
}

// Keep existing getLoadingSvg() function
function getLoadingSvg() {
    return '<svg style="height: 25px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';
}

  