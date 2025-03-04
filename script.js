let users = JSON.parse(localStorage.getItem('users')) || []; // Foydalanuvchilar bazasi
let reports = JSON.parse(localStorage.getItem('reports')) || []; // Xabarlar bazasi
let currentUser = null;
let usedWords = JSON.parse(localStorage.getItem('usedWords')) || { A1: [], B1: [], B2: [], C1: [], C2: [] };

// So‘zlar bazasi (namuna sifatida)
const words = {
    A1: [{ word: "apple", correct: "olma", options: ["suyak", "olma", "yer", "nok"] }],
    B1: [{ word: "book", correct: "kitob", options: ["qalam", "kitob", "stol", "uy"] }],
    B2: [{ word: "freedom", correct: "erkinlik", options: ["qullik", "erkinlik", "dovon", "qamoq"] }],
    C1: [{ word: "meticulous", correct: "sinchkov", options: ["shoshqaloq", "sinchkov", "dangasa", "tez"] }],
    C2: [{ word: "ephemeral", correct: "vaqtinchalik", options: ["doimiy", "vaqtinchalik", "uzun", "kuchli"] }]
};

// Kirish funksiyasi
function kirish() {
    let ism = document.getElementById('ism').value.trim();
    let familya = document.getElementById('familya').value.trim();
    let yosh = document.getElementById('yosh').value;
    let adminCode = document.getElementById('adminCode').value;
    let error = document.getElementById('error');

    // Validatsiya
    if (!/^[a-zA-Z]+$/.test(ism) || !/^[a-zA-Z]+$/.test(familya)) {
        error.textContent = "Iltimos, ism va familyaga faqat harflar kiriting!";
        return;
    }
    if (!yosh) {
        error.textContent = "Iltimos, yoshingizni kiriting!";
        return;
    }

    // Admin tekshiruvi
    if (ism === "Abduraxmon" && familya === "Admin") {
        if (adminCode !== "PASSWORDABDURAXMON") {
            error.textContent = "Noto‘g‘ri admin kod!";
            return;
        }
        currentUser = { ism, familya, yosh, role: "admin" };
        showAdminPanel();
    } else {
        currentUser = users.find(u => u.ism === ism && u.familya === familya) || { ism, familya, yosh, results: [] };
        if (!users.some(u => u.ism === ism && u.familya === familya)) {
            users.push(currentUser);
        }
        localStorage.setItem('users', JSON.stringify(users));
        showMainContent();
    }
    document.getElementById('loginForm').style.display = 'none';
}

// Asosiy kontentni ko‘rsatish
function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    let profile = document.getElementById('userProfile');
    profile.innerHTML = `
        <h3>Profil</h3>
        <p>Ism: ${currentUser.ism}</p>
        <p>Familya: ${currentUser.familya}</p>
        <p>Yosh: ${currentUser.yosh}</p>
        <p>Natijalar: ${currentUser.results.map(r => `${r.level}: ${r.score}/30`).join(", ")}</p>
        <small>Creator: Movlonov Admin Abduraxmon</small>
    `;
}

// Testni boshlash
function startTest(level) {
    document.getElementById('playlists').style.display = 'none';
    let testSection = document.getElementById('testSection');
    testSection.style.display = 'block';
    let testWords = words[level].filter(w => !usedWords[level].includes(w.word));
    let questionCount = 0;
    let score = 0;

    function showQuestion() {
        if (questionCount >= 30 || testWords.length === 0) {
            currentUser.results.push({ level, score });
            localStorage.setItem('users', JSON.stringify(users));
            testSection.innerHTML = `<h3>Test tugadi! Natija: ${score}/30</h3>`;
            setTimeout(() => {
                testSection.style.display = 'none';
                document.getElementById('playlists').style.display = 'block';
                showMainContent();
            }, 2000);
            return;
        }

        let word = testWords[Math.floor(Math.random() * testWords.length)];
        usedWords[level].push(word.word);
        localStorage.setItem('usedWords', JSON.stringify(usedWords));

        testSection.innerHTML = `
            <h3>Savol ${questionCount + 1}/30</h3>
            <p>${word.word} - bu nima?</p>
            ${word.options.map((opt, idx) => `
                <button class="btn btn-outline-primary m-2" onclick="checkAnswer('${opt}', '${word.correct}', ${idx})">${opt}</button>
            `).join("")}
        `;
        questionCount++;
    }

    window.checkAnswer = (selected, correct, idx) => {
        if (selected === correct) score++;
        showQuestion();
    };

    showQuestion();
}

// Admin panel
function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    let stats = document.getElementById('adminStats');
    stats.innerHTML = `
        <h4>Foydalanuvchilar Statistikasi</h4>
        ${users.map(u => `
            <p>${u.ism} ${u.familya}: ${u.results.map(r => `${r.level}: ${r.score}/30`).join(", ")}</p>
        `).join("")}
    `;
    let adminReports = document.getElementById('adminReports');
    adminReports.innerHTML = `
        <h4>Xabarlar</h4>
        ${reports.map(r => `<p>${r.user}: ${r.message}</p>`).join("")}
    `;
}

// Adminstratorga xabar yuborish
function reportToAdmin() {
    let message = prompt("Adminstratorga xabar yuboring:");
    if (message) {
        reports.push({ user: `${currentUser.ism} ${currentUser.familya}`, message });
        localStorage.setItem('reports', JSON.stringify(reports));
        alert("Xabar yuborildi!");
    }
}