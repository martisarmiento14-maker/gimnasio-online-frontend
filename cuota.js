const API_URL = "https://gimnasio-online-1.onrender.com";

// ======================================================
// Cargar todas las cuotas
// ======================================================
async function cargarCuotas() {
    const cont = document.getElementById("listaCuotas");
    cont.innerHTML = "<tr><td colspan='6'>Cargando cuotas...</td></tr>";

    try {
        const res = await fetch(`${API_URL}/cuotas`);
        const cuotas = await res.json();

        let html = "";

        for (let c of cuotas) {
            const fecha = c.fecha_pago ? c.fecha_pago.split("T")[0] : "-";

            html += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nombre ?? ""} ${c.apellido ?? ""}</td>
                    <td>$${c.monto}</td>
                    <td>${fecha}</td>
                    <td>${c.metodo_pago}</td>
                    <td>${c.comentarios ?? ""}</td>
                </tr>
            `;
        }

        cont.innerHTML = html;

    } catch (err) {
        console.error(err);
        cont.innerHTML = "<tr><td colspan='6'>Error cargando cuotas</td></tr>";
    }
}

// ======================================================
// Crear nueva cuota
// ======================================================
async function crearCuota() {
    const id_alumno = document.getElementById("id_alumno").value;
    const monto = document.getElementById("monto").value;
    const fecha_pago = document.getElementById("fecha_pago").value;
    const metodo_pago = document.getElementById("metodo_pago").value;
    const comentarios = document.getElementById("comentarios").value;

    if (!id_alumno || !monto || !fecha_pago) {
        alert("Faltan datos obligatorios.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/cuotas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_alumno,
                monto,
                fecha_pago,
                metodo_pago,
                comentarios
            })
        });

        const data = await res.json();
        alert("Cuota creada correctamente");

        window.location.href = "cuota.html";

    } catch (err) {
        console.error("❌ Error creando cuota:", err);
        alert("Error al crear cuota");
    }
}
