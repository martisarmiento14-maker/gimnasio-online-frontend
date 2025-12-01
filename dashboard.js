// redirección
function goTo(page) {
    window.location.href = page;
}

// logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    alert("Sesión cerrada");
    window.location.href = "index.html";
});
