// app.js
const API_URL = "https://gimnasio-online-1.onrender.com";

// BOTÓN LOGIN
document.getElementById("loginBtn").addEventListener("click", login);

async function login() {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const mensaje = document.getElementById("loginMensaje");

    if (!usuario || !clave) {
        mensaje.textContent = "Ingresá usuario y contraseña";
        mensaje.style.color = "red";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, clave })
        });

        const data = await res.json();

        if (!res.ok) {
            mensaje.textContent = data.error || "Credenciales incorrectas";
            mensaje.style.color = "red";
            return;
        }

        // GUARDAR TOKEN
        localStorage.setItem("token", data.token);

        mensaje.textContent = "Ingreso exitoso ✔";
        mensaje.style.color = "green";

        // REDIRECCIÓN
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 800);

    } catch (err) {
        console.error("ERROR LOGIN:", err);
        mensaje.textContent = "Error al conectar con el servidor";
        mensaje.style.color = "red";
    }
}
