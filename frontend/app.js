const API_URL = "http://127.0.0.1:8001";
// const API_URL = "https://enterprise-ai-assistant-3.onrender.com";

/* =========================
   ANALYTICS STATE
========================= */

let totalQuestions = 0;
let successfulResponses = 0;
let failedResponses = 0;
let responseTimes = [];
let questionHistory = [];


/* =========================
   DOM ELEMENTS
========================= */

const questionInput =
    document.getElementById("question");

const messages =
    document.getElementById("messages");

const typing =
    document.getElementById("typing");

const fileInput =
    document.getElementById("fileInput");

const uploadBox =
    document.getElementById("uploadBox");

const uploadStatus =
    document.getElementById("uploadStatus");

const documentsList =
    document.getElementById("documentsList");

const sendButton =
    document.getElementById("sendButton");


/* =========================
   CHAT
========================= */

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


function useSuggestion(button) {

    questionInput.value =
        button.innerText;

    sendMessage();

}


async function sendMessage() {

    const question =
        questionInput.value.trim();


    if (!question) {
        return;
    }


    const welcome =
        document.getElementById("welcome");


    if (welcome) {
        welcome.remove();
    }


    addMessage(
        question,
        "user"
    );


    questionInput.value = "";


    totalQuestions++;


    questionHistory.unshift({
        question: question,
        time: new Date().toLocaleTimeString()
    });


    if (questionHistory.length > 10) {

        questionHistory =
            questionHistory.slice(0, 10);

    }


    typing.classList.remove("hidden");


    if (sendButton) {

        sendButton.disabled = true;

    }


    const startTime =
        performance.now();


    try {

        const response =
            await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );


        const endTime =
            performance.now();


        const responseTime =
            (endTime - startTime) / 1000;


        responseTimes.push(
            responseTime
        );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        successfulResponses++;


        const answer =
            data.answer ||
            data.response ||
            data.message ||
            "No answer received from AI.";


        addMessage(
            answer,
            "ai",
            data.sources || []
        );


    }

    catch (error) {

        console.error(error);


        failedResponses++;


        addMessage(
            "⚠️ Unable to connect to the AI backend.",
            "ai"
        );

    }

    finally {

        typing.classList.add("hidden");


        if (sendButton) {

            sendButton.disabled = false;

        }


        questionInput.focus();

    }

}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(
    text,
    type,
    sources = []
) {

    const message =
        document.createElement("div");


    message.className =
        `message ${type}`;


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.innerText =
        text;


    message.appendChild(content);


    /* SOURCES */

    if (
        type === "ai" &&
        sources &&
        sources.length > 0
    ) {

        const sourceBox =
            document.createElement("div");


        sourceBox.className =
            "sources";


        const title =
            document.createElement("div");


        title.className =
            "sources-title";


        title.innerText =
            "📎 Sources";


        sourceBox.appendChild(
            title
        );


        sources.forEach(source => {

            const sourceItem =
                document.createElement("div");


            sourceItem.className =
                "source-item";


            sourceItem.innerText =
                `📄 ${source}`;


            sourceBox.appendChild(
                sourceItem
            );

        });


        message.appendChild(
            sourceBox
        );

    }


    messages.appendChild(
        message
    );


    scrollToBottom();

}


/* =========================
   AUTO SCROLL
========================= */

function scrollToBottom() {

    setTimeout(() => {

        messages.scrollTo({

            top:
                messages.scrollHeight,

            behavior:
                "smooth"

        });

    }, 50);

}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    messages.innerHTML = `

        <div
            class="welcome"
            id="welcome"
        >

            <div class="welcome-icon">
                ✨
            </div>

            <h2>
                How can I help you today?
            </h2>

            <p>
                Ask me anything about your company's
                documents, policies, projects or
                knowledge base.
            </p>

            <div class="suggestions">

                <button
                    onclick="useSuggestion(this)"
                >
                    What projects are mentioned
                    in the documents?
                </button>

                <button
                    onclick="useSuggestion(this)"
                >
                    What technologies are used
                    in the projects?
                </button>

                <button
                    onclick="useSuggestion(this)"
                >
                    Summarize the uploaded documents
                </button>

                <button
                    onclick="useSuggestion(this)"
                >
                    List important skills
                </button>

            </div>

        </div>

    `;


    showChat();

}


/* =========================
   PAGE NAVIGATION
========================= */

function showChat() {

    document
        .getElementById("chatPage")
        .classList.remove("hidden");


    document
        .getElementById("knowledgePage")
        .classList.add("hidden");


    const analyticsPage =
        document.getElementById("analyticsPage");


    if (analyticsPage) {

        analyticsPage.classList.add(
            "hidden"
        );

    }


    document
        .getElementById("pageTitle")
        .innerText =
        "Knowledge Assistant";


    document
        .getElementById("pageSubtitle")
        .innerText =
        "Ask questions about your organization's knowledge";


    updateActiveMenu(
        "chatMenu"
    );

}


function showKnowledgeBase() {

    document
        .getElementById("chatPage")
        .classList.add("hidden");


    document
        .getElementById("knowledgePage")
        .classList.remove("hidden");


    const analyticsPage =
        document.getElementById("analyticsPage");


    if (analyticsPage) {

        analyticsPage.classList.add(
            "hidden"
        );

    }


    document
        .getElementById("pageTitle")
        .innerText =
        "Knowledge Base";


    document
        .getElementById("pageSubtitle")
        .innerText =
        "Manage documents used by your AI assistant";


    updateActiveMenu(
        "knowledgeMenu"
    );


    loadDocuments();

}


/* =========================
   ACTIVE SIDEBAR MENU
========================= */

function updateActiveMenu(
    activeId
) {

    const menuItems =
        document.querySelectorAll(
            ".menu-item"
        );


    menuItems.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    const activeItem =
        document.getElementById(
            activeId
        );


    if (activeItem) {

        activeItem.classList.add(
            "active"
        );

    }

}


/* =========================
   UPLOAD DOCUMENT
========================= */

async function uploadDocument() {

    const file =
        fileInput.files[0];


    if (!file) {
        return;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        ![
            "pdf",
            "docx",
            "txt"
        ].includes(extension)
    ) {

        showUploadStatus(
            "❌ Only PDF, DOCX and TXT files are supported.",
            "error"
        );

        return;

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    showUploadStatus(
        `⏳ Uploading ${file.name}...`,
        "loading"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Upload failed"
            );

        }


        showUploadStatus(

            `✅ ${file.name} uploaded successfully. ` +
            `${data.chunks_created || 0} chunks indexed.`,

            "success"

        );


        fileInput.value = "";


        await loadDocuments();


        setTimeout(() => {

            if (uploadStatus) {

                uploadStatus.classList.add(
                    "hidden"
                );

            }

        }, 5000);


    }

    catch (error) {

        console.error(error);


        showUploadStatus(

            `❌ Upload failed: ${error.message}`,

            "error"

        );

    }

}


/* =========================
   UPLOAD STATUS
========================= */

function showUploadStatus(
    message,
    type
) {

    if (!uploadStatus) {
        return;
    }


    uploadStatus.className =
        `upload-status ${type}`;


    uploadStatus.innerText =
        message;


    uploadStatus.classList.remove(
        "hidden"
    );

}


/* =========================
   DOCUMENT LIST
========================= */

async function loadDocuments() {

    if (!documentsList) {
        return;
    }


    documentsList.innerHTML = `

        <div class="empty-documents">
            ⏳ Loading documents...
        </div>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/documents`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load documents"
            );

        }


        const documents =
            await response.json();


        if (
            !documents ||
            documents.length === 0
        ) {

            documentsList.innerHTML = `

                <div class="empty-documents">

                    📂 No documents uploaded yet.

                </div>

            `;

            return;

        }


        documentsList.innerHTML = "";


        documents.forEach(doc => {

            const item =
                document.createElement("div");


            item.className =
                "document-card";


            item.innerHTML = `

                <div class="document-icon">
                    📄
                </div>

                <div class="document-info">

                    <strong>
                        ${escapeHtml(
                            doc.filename
                        )}
                    </strong>

                    <small>
                        Indexed and available to AI
                    </small>

                </div>

                <div class="document-status">
                    ● Ready
                </div>

            `;


            documentsList.appendChild(
                item
            );

        });


    }

    catch (error) {

        console.error(error);


        documentsList.innerHTML = `

            <div class="empty-documents error">

                ❌ Unable to load documents.

                <br><br>

                Please check that the AI backend is available.

            </div>

        `;

    }

}


/* =========================
   ANALYTICS PAGE
========================= */

function showAnalytics() {

    const chatPage =
        document.getElementById("chatPage");

    const knowledgePage =
        document.getElementById("knowledgePage");

    const analyticsPage =
        document.getElementById("analyticsPage");


    if (!analyticsPage) {

        console.error(
            "analyticsPage not found in HTML"
        );

        return;

    }


    chatPage.classList.add("hidden");

    knowledgePage.classList.add("hidden");

    analyticsPage.classList.remove("hidden");


    document.getElementById("pageTitle").innerText =
        "Analytics Dashboard";

    document.getElementById("pageSubtitle").innerText =
        "Monitor your AI knowledge system performance";


    updateActiveMenu("analyticsMenu");


    loadAnalytics();

}


/* =========================
   LOAD ANALYTICS
========================= */

async function loadAnalytics() {

    const totalQuestionsElement =
        document.getElementById("totalQuestions");

    const totalDocumentsElement =
        document.getElementById("totalDocuments");

    const totalChunksElement =
        document.getElementById("totalChunks");

    const averageResponseElement =
        document.getElementById("averageResponse");

    const recentQuestionsElement =
        document.getElementById("recentQuestions");

    const backendStatus =
        document.getElementById("backendStatus");

    const vectorStatus =
        document.getElementById("vectorStatus");

    const modelStatus =
        document.getElementById("modelStatus");


    /* =========================
       BACKEND ANALYTICS
       ========================= */

    try {

        const response =
            await fetch(`${API_URL}/analytics`);

        if (!response.ok) {
            throw new Error("Analytics API failed");
        }

        const data =
            await response.json();

        console.log("Analytics data:", data);


        /* TOTAL DOCUMENTS */

        if (totalDocumentsElement) {

            totalDocumentsElement.innerText =
                data.total_documents ?? 0;

        }


        /* INDEXED CHUNKS */

        if (totalChunksElement) {

            totalChunksElement.innerText =
                data.indexed_chunks ?? 0;

        }


        /* QUESTIONS ASKED */

        if (totalQuestionsElement) {

            totalQuestionsElement.innerText =
                data.total_questions ?? 0;

        }


        /* BACKEND STATUS */

        if (backendStatus) {

            backendStatus.innerText =
                "Connected";

        }


        /* VECTOR DATABASE */

        if (vectorStatus) {

            vectorStatus.innerText =
                "FAISS Ready";

        }


        /* MODEL */

        if (modelStatus) {

            modelStatus.innerText =
                data.model ?? "Available";

        }

    }

    catch (error) {

        console.error(
            "Analytics API error:",
            error
        );


        if (totalDocumentsElement) {
            totalDocumentsElement.innerText = "0";
        }

        if (totalChunksElement) {
            totalChunksElement.innerText = "0";
        }

        if (totalQuestionsElement) {
            totalQuestionsElement.innerText = "0";
        }

        if (backendStatus) {
            backendStatus.innerText = "Offline";
        }

        if (vectorStatus) {
            vectorStatus.innerText = "Unavailable";
        }

        if (modelStatus) {
            modelStatus.innerText = "Unavailable";
        }

    }


    /* =========================
       RESPONSE TIME
       ========================= */

    let averageResponseTime = 0;

    if (responseTimes.length > 0) {

        const totalTime =
            responseTimes.reduce(
                (sum, time) => sum + time,
                0
            );

        averageResponseTime =
            totalTime / responseTimes.length;

    }


    if (averageResponseElement) {

        averageResponseElement.innerText =
            `${averageResponseTime.toFixed(2)}s`;

    }


    /* =========================
       RECENT QUESTIONS
       ========================= */

    if (recentQuestionsElement) {

        if (questionHistory.length === 0) {

            recentQuestionsElement.innerHTML = `

                <div class="empty-analytics">
                    No questions asked yet.
                </div>

            `;

        }

        else {

            recentQuestionsElement.innerHTML = "";

            questionHistory.forEach(item => {

                const questionItem =
                    document.createElement("div");

                questionItem.className =
                    "question-history-item";

                questionItem.innerHTML = `

                    <div class="history-question">

                        💬
                        ${escapeHtml(item.question)}

                    </div>

                    <small>
                        ${item.time}
                    </small>

                `;

                recentQuestionsElement.appendChild(
                    questionItem
                );

            });

        }

    }

}


/* =========================
   HTML SAFETY
========================= */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   DRAG AND DROP
========================= */

if (uploadBox) {

    uploadBox.addEventListener(

        "dragover",

        event => {

            event.preventDefault();


            uploadBox.classList.add(
                "dragging"
            );

        }

    );


    uploadBox.addEventListener(

        "dragleave",

        () => {

            uploadBox.classList.remove(
                "dragging"
            );

        }

    );


    uploadBox.addEventListener(

        "drop",

        event => {

            event.preventDefault();


            uploadBox.classList.remove(
                "dragging"
            );


            const files =
                event.dataTransfer.files;


            if (
                files.length > 0
            ) {

                fileInput.files =
                    files;


                uploadDocument();

            }

        }

    );

}


/* =========================
   AUTO RESIZE TEXTAREA
========================= */

if (questionInput) {

    questionInput.addEventListener(

        "input",

        function () {

            this.style.height =
                "auto";


            this.style.height =
                Math.min(
                    this.scrollHeight,
                    120
                ) + "px";

        }

    );

}


/* =========================
   INITIAL CONNECTION CHECK
========================= */

async function checkBackendConnection() {

    try {

        const response =
            await fetch(
                `${API_URL}/documents`
            );


        if (!response.ok) {

            throw new Error();

        }


        console.log(
            "Backend connected successfully"
        );

    }

    catch (error) {

        console.warn(
            "Backend connection unavailable"
        );

    }

}





function clearAnalyticsHistory() {

    questionHistory = [];

    loadAnalytics();

}
checkBackendConnection();
