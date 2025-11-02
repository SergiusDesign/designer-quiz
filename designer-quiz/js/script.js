import { questions } from './questions.js';

const startForm = document.getElementById("startForm");
const quizContainer = document.getElementById("quizContainer");
const startScreen = document.getElementById("startScreen");
const errorDiv = document.getElementById("error");
const quizForm = document.getElementById("quizForm");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const progressBar = document.getElementById("progressBar");
const timerElement = document.getElementById("timer");

let currentStep = 1;

// Email перевірка
const emailWhitelist = ["gmail.com", "ukr.net", "meta.ua", "outlook.com", "i.ua", "icloud.com", "yahoo.com"];
const emailBlacklist = ["mail.ru", "yandex.ru", "bk.ru", "list.ru", "inbox.ru"];

startForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errorDiv.textContent = "";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();

  const properRegex = /^[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ\s-]+$/;
  const finalRegex = /^[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ\s-]+$/u;

  if (!finalRegex.test(firstName)) return showError("Ім’я має бути українською мовою.");
  if (!finalRegex.test(lastName)) return showError("Прізвище має бути українською мовою.");

  if (!email.includes("@") || !email.includes(".")) return showError("Некоректна електронна адреса.");
  const domain = email.split("@")[1];
  if (emailBlacklist.includes(domain)) return showError("Ця поштова адреса заборонена.");
  if (!emailWhitelist.some(d => domain.endsWith(d))) return showError("Використовуйте популярні поштові сервіси.");

  startScreen.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  showStep(currentStep);
});

function showError(msg) {
  errorDiv.textContent = msg;
}

// Генерація питань
questions.forEach((q, i) => {
  const stepDiv = document.createElement("div");
  stepDiv.className = "question-step";
  stepDiv.dataset.step = i + 1;

  const h2 = document.createElement("h2");
  h2.textContent = `${i + 1}. ${q.text}`;
  stepDiv.appendChild(h2);

  q.options.forEach((option, j) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" name="q${i}" value="${j}"> ${option}`;
    stepDiv.appendChild(label);
  });

  quizForm.insertBefore(stepDiv, quizForm.querySelector(".navigation"));
});

function showStep(step) {
  document.querySelectorAll(".question-step").forEach(s => s.classList.remove("active"));
  const el = document.querySelector(`.question-step[data-step="${step}"]`);
  if (el) el.classList.add("active");

  prevBtn.style.display = step === 1 ? "none" : "none";
  nextBtn.style.display = step === questions.length ? "none" : "inline-block";
  submitBtn.style.display = step === questions.length ? "inline-block" : "none";
  progressBar.style.width = ((step - 1) / (questions.length - 1)) * 100 + "%";
}

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentStep < questions.length) {
    currentStep++;
    showStep(currentStep);
  }
});

quizForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let correctCount = 0;
  questions.forEach((q, i) => {
    const selected = Array.from(document.querySelectorAll(`input[name="q${i}"]:checked`)).map(cb => parseInt(cb.value)).sort();
    const correct = [...q.correct].sort();
    if (JSON.stringify(selected) === JSON.stringify(correct)) {
      correctCount++;
    }
  });

  const fullName = document.getElementById("firstName").value + " " + document.getElementById("lastName").value;
  const email = document.getElementById("email").value;

  let level = "Початковий рівень";
  let recommendation = "Варто пройти курс із самого початку.";
  if (correctCount === questions.length) {
    level = "Впевнений рівень";
    recommendation = "Можна переходити до складніших тем.";
  }

  document.getElementById("quizContainer").classList.add("hidden");
  const final = document.getElementById("finalScreen");
  final.classList.remove("hidden");
  document.getElementById("userName").textContent = fullName;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("totalQuestions").textContent = questions.length;
  document.getElementById("level").textContent = level;
  document.getElementById("recommendation").textContent = recommendation;
  document.getElementById("userEmail").textContent = email;
});

// Таймер
let time = 14 * 60;
const timer = setInterval(() => {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  timerElement.textContent = `${min}:${sec.toString().padStart(2, "0")}`;
  if (time <= 0) {
    clearInterval(timer);
    quizForm.requestSubmit();
  }
  time--;
}, 1000);

// Ховаємо splash і показуємо startScreen
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splashScreen").style.display = "none";
    document.getElementById("startScreen").classList.remove("hidden");
  }, 3000);
});
