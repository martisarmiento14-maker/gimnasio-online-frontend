document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const errorMensaje = document.getElementById("errorMensaje");

    if (!form) return;

    // 👉 URL REAL DE TU BACKEND
    const API_URL = "https://gimnasio-online-1.onrender.com";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorMensaje.textContent = "";

        const usuario = document.getElementById("usuario").value;
        const clave = document.getElementById("clave").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ usuario, clave }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                errorMensaje.textContent = data.error || "Error en login";
                return;
            }

            alert("Login exitoso!");
            window.location.href = "dashboard.html";

        } catch (err) {
            console.error(err);
            errorMensaje.textContent = "No se pudo conectar con el servidor.";
        }
    });
});
