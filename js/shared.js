const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
  });
}
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");
if (hamburger && sidebar && main) {
  hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
    main.classList.toggle("expanded");
    hamburger.classList.toggle("open");
  });
}
function showMessage(msg, isError = false) {
  alert(msg);
}
