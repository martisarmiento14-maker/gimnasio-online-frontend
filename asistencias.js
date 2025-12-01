document.addEventListener("DOMContentLoaded", () => {
    const inputDni = document.getElementById("dni");
    const btn = document.getElementById("btnAsistencia");
    const mensaje = document.getElementById("mensaje");

    // AUDIOS (con verificación)
    const sonidoOk = document.getElementById("sonidoOk");
    const sonidoError = document.getElementById("sonidoError");

    function reproducir(sonido) {
        if (sonido && sonido.readyState > 0) {
            sonido.currentTime = 0;
            sonido.play().catch(() => {});
        }
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.style.color = tipo === "ok" ? "green" : "red";
    }

    btn.addEventListener("click", async () => {
        const dni = inputDni.value.trim();

        if (!dni) {
            mostrarMensaje("Debés ingresar un DNI", "error");
            reproducir(sonidoError);
            return;
        }

        try {
            const res = await fetch("https://gimnasio-online-1.onrender.com/asistencias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni })
            });

            const data = await res.json();
            console.log("Respuesta backend:", data);

            if (!data.se_registro) {
                mostrarMensaje(data.alerta_dias || data.alerta_cuota || data.error, "error");
                reproducir(sonidoError);
                return;
            }

            // OK
            mostrarMensaje("Asistencia registrada exitosamente", "ok");
            reproducir(sonidoOk);

        } catch (err) {
            console.error("Error front:", err);
            mostrarMensaje("Error del servidor", "error");
            reproducir(sonidoError);
        }
    });
});

