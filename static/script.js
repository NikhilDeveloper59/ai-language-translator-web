/*************************************************
 * ELEMENT REFERENCES
 *************************************************/
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const sourceLang = document.getElementById("sourceLanguage");
const targetLang = document.getElementById("targetLanguage");
const themeToggle = document.getElementById("themeToggle");
const charCount = document.querySelector(".char-count");
const copyBtn = document.getElementById("copyBtn");
const speakInputBtn = document.querySelector(".input-panel .fa-volume-high");
const speakOutputBtn = document.getElementById("speakBtn");
const micBtn = document.querySelector(".input-panel .fa-microphone");

/*************************************************
 * LANGUAGE MODAL SETUP
 *************************************************/
const languages = {
    auto: "Detect Language",
    en: "English",
    hi: "Hindi",
    fr: "French",
    es: "Spanish",
    de: "German",
    it: "Italian",
    ru: "Russian",
    ja: "Japanese",
    zh: "Chinese",
    ar: "Arabic",
    ko: "Korean",
    pt: "Portuguese"
};

const languageModal = document.getElementById("languageModal");
const languageList = document.getElementById("languageList");
const langSearch = document.getElementById("langSearch");
const openSourceLang = document.getElementById("openSourceLang");
const openTargetLang = document.getElementById("openTargetLang");
const closeLangModal = document.getElementById("closeLangModal");

let currentType = "source";

/*************************************************
 * INIT SELECT VALUES (BACKEND COMPATIBLE)
 *************************************************/
for (const code in languages) {
    sourceLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
    if (code !== "auto")
        targetLang.innerHTML += `<option value="${code}">${languages[code]}</option>`;
}

sourceLang.value = "auto";
targetLang.value = "en";

/*************************************************
 * OPEN LANGUAGE MODAL
 *************************************************/
openSourceLang.onclick = () => {
    currentType = "source";
    buildLanguageList();
};

openTargetLang.onclick = () => {
    currentType = "target";
    buildLanguageList();
};

function buildLanguageList() {
    languageList.innerHTML = "";
    langSearch.value = "";

    const selected = currentType === "source"
        ? sourceLang.value
        : targetLang.value;

    for (const [code, name] of Object.entries(languages)) {
        if (currentType === "target" && code === "auto") continue;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${name}</span>
            ${code === selected ? '<span class="checkmark">✔</span>' : ''}
        `;

        li.onclick = () => {
            if (currentType === "source") {
                sourceLang.value = code;
                openSourceLang.innerText = name;
            } else {
                targetLang.value = code;
                openTargetLang.innerText = name;
            }
            languageModal.style.display = "none";
        };

        languageList.appendChild(li);
    }

    languageModal.style.display = "flex";
}

/*************************************************
 * SEARCH FILTER
 *************************************************/
langSearch.addEventListener("input", () => {
    const value = langSearch.value.toLowerCase();
    [...languageList.children].forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(value)
            ? "flex"
            : "none";
    });
});

/*************************************************
 * CLOSE MODAL
 *************************************************/
closeLangModal.onclick = () => {
    languageModal.style.display = "none";
};

/*************************************************
 * TRANSLATION
 *************************************************/
translateBtn.onclick = async () => {
    if (!inputText.value.trim()) {
        alert("Please enter text");
        return;
    }

    outputText.value = "Translating...";

    const res = await fetch("/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: inputText.value,
            source: sourceLang.value,
            target: targetLang.value
        })
    });

    const data = await res.json();
    outputText.value = data.translatedText;
};

/*************************************************
 * CHARACTER COUNTER
 *************************************************/
inputText.addEventListener("input", () => {
    charCount.textContent = `${inputText.value.length} / 5000`;
});

/*************************************************
 * COPY
 *************************************************/
copyBtn.onclick = () => {
    navigator.clipboard.writeText(outputText.value);
    alert("Copied!");
};

/*************************************************
 * TEXT TO SPEECH
 *************************************************/
speakInputBtn.onclick = () => {
    if (!inputText.value) return;
    const u = new SpeechSynthesisUtterance(inputText.value);
    u.lang = sourceLang.value === "auto" ? "en-US" : sourceLang.value;
    speechSynthesis.speak(u);
};

speakOutputBtn.onclick = () => {
    if (!outputText.value) return;
    const u = new SpeechSynthesisUtterance(outputText.value);
    u.lang = targetLang.value;
    speechSynthesis.speak(u);
};

/*************************************************
 * SPEECH TO TEXT
 *************************************************/
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.onresult = e => {
        inputText.value = e.results[0][0].transcript;
        charCount.textContent = `${inputText.value.length} / 5000`;
    };
}

micBtn.onclick = () => recognition && recognition.start();

/*************************************************
 * THEME TOGGLE
 *************************************************/
themeToggle.onclick = () => {
    document.body.classList.toggle("light-theme");
    document.body.classList.toggle("dark-theme");

    themeToggle.querySelector("i").className =
        document.body.classList.contains("light-theme")
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
};
