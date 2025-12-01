// gimnasio-frontend/form-alumno.js

document.addEventListener("DOMContentLoaded", iniciar);

// Valores originales que NO queremos cambiar al editar
let equipoOriginal = "blanco";
let activoOriginal = 1;
let fechaVencimientoOriginal = null;

// URL backend en Render
const API_URL = "https://gimnasio-online-1.onrender.com";

function sumarUnMes(fecha) {
    const [year, month, day] = fecha.split("-").map(Number);
    let f = new Date(year, month - 1, day);
    f.setMonth(f.getMonth() + 1);
    return f.toISOString().split("T")[0];
}


async function iniciar() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const btnRenovar = document.getElementById("btnRenovar");

    // listeners de planes
    plan_eg.addEventListener("change", onCambioPlanes);
    plan_personalizado.addEventListener("change", onCambioPlanes);
    plan_running.addEventListener("change", onCambioPlanes);

    if (!id) {
        // MODO NUEVO ALUMNO
        document.getElementById("tituloForm").textContent = "Nuevo Alumno";
        btnRenovar.style.display = "none"; 
    } else {
        // MODO EDITAR
        document.getElementById("tituloForm").textContent = "Editar Alumno";
        await cargarAlumno(id);
    }

    btnRenovar.addEventListener("click", () => {
        const fecha = document.getElementById("fecha_vencimiento");
        const base =
            fecha.value ||
            fechaVencimientoOriginal ||
            new Date().toISOString().split("T")[0];

        fecha.value = sumarUnMes(base);
    });

    actualizarOpcionesDias();

    document.getElementById("formAlumno").addEventListener("submit", guardar);
}

// pequeña ayuda para interpretar true/1/"1"
function esVerdadero(v) {
    return v === true || v === 1 || v === "1";
}

async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}/detalle`);

    if (!res.ok) {
        alert("Error al cargar los datos del alumno");
        return;
    }

    // ⬇️ AHORA el backend devuelve directamente el alumno
    const al = await res.json();

    // Rellenar campos básicos
    nombre.value = al.nombre || "";
    apellido.value = al.apellido || "";
    dni.value = al.dni || "";
    celular.value = al.telefono || "";
    nivel.value = al.nivel || "";

    // Valores que no se modifican desde acá (por ahora)
    equipoOriginal = al.equipo;
    activoOriginal = al.activo;

    // Fecha de vencimiento
    fecha_vencimiento.value = al.fecha_vencimiento
        ? al.fecha_vencimiento.split("T")[0]
        : "";
    fechaVencimientoOriginal = fecha_vencimiento.value || null;

    // Planes (aceptamos boolean o 1/0)
    plan_eg.checked = esVerdadero(al.plan_eg);
    plan_personalizado.checked = esVerdadero(al.plan_personalizado);
    plan_running.checked = esVerdadero(al.plan_running);

    // Días por semana (total guardado en la BD)
    const diasTotales = al.dias_semana || "";
    actualizarOpcionesDias(diasTotales);
}

/**
 * Manejo de cambios en los checkboxes de planes
 * - EG y Personalizado nunca juntos.
 * - Se actualizan las opciones del select de días.
 */
function onCambioPlanes(e) {
    if (plan_eg.checked && plan_personalizado.checked) {
        e.target.checked = false;
        alert("No se puede combinar Plan EG con Personalizado.");
    }
    actualizarOpcionesDias();
}

/**
 * Actualiza el <select> de días según la combinación de planes.
 * Si se pasa diasTotales, intenta dejar seleccionada la opción correcta al editar.
 */
function actualizarOpcionesDias(diasTotales = null) {
    const sel = document.getElementById("dias_semana");
    const ayuda = document.getElementById("ayudaDias");

    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;

    sel.innerHTML = "";
    sel.disabled = false;
    ayuda.textContent = "";

    // Sin ningún plan
    if (!eg && !pers && !run) {
        sel.innerHTML = `<option value="">Elegí un plan primero</option>`;
        sel.disabled = true;
        return;
    }

    // RUNNING SOLO -> 2 días fijos
    if (run && !eg && !pers) {
        sel.innerHTML = `<option value="2">2 días (Running)</option>`;
        sel.value = "2";
        sel.disabled = true;
        ayuda.textContent = "Running siempre son 2 días por semana.";
        return;
    }

    // EG o Personalizado SOLO -> 3 o 5 días (total)
    if ((eg || pers) && !run) {
        sel.innerHTML = `
            <option value="">Elegí cantidad de días</option>
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        ayuda.textContent = "Plan EG o Personalizado: solo 3 o 5 días.";
        if (diasTotales) sel.value = String(diasTotales);
        return;
    }

    // COMBINACIÓN con Running (EG + Running o Pers + Running)
    if (run && (eg || pers)) {
        sel.innerHTML = `
            <option value="">Días del plan principal</option>
            <option value="3">3 días (total = 5 con Running)</option>
            <option value="5">5 días (total = 7 con Running)</option>
        `;
        ayuda.textContent = "Running suma 2 días extra. Acá elegís los días del otro plan.";

        // si estamos editando, traducir total -> parte principal
        if (diasTotales) {
            const base = diasTotales - 2; // total - 2 de running
            if (base === 3 || base === 5) {
                sel.value = String(base);
            }
        }
        return;
    }
}

async function guardar(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const esNuevo = !id;

    let eg = plan_eg.checked ? 1 : 0;
    let pers = plan_personalizado.checked ? 1 : 0;
    let run = plan_running.checked ? 1 : 0;

    // Validaciones de planes
    if (eg && pers) {
        alert("No se puede combinar Plan EG con Personalizado.");
        return;
    }
    if (!eg && !pers && !run) {
        alert("Tenés que elegir al menos un plan.");
        return;
    }

    const selDias = document.getElementById("dias_semana");
    let valorSel = Number(selDias.value);

    let diasTotales = 0;

    // Running solo
    if (run && !eg && !pers) {
        diasTotales = 2;
    }
    // EG o Pers solo
    else if ((eg || pers) && !run) {
        if (![3, 5].includes(valorSel)) {
            alert("Elegí 3 o 5 días.");
            return;
        }
        diasTotales = valorSel;
    }
    // Combinación con Running
    else if (run && (eg || pers)) {
        if (![3, 5].includes(valorSel)) {
            alert("Elegí 3 o 5 días para el plan principal.");
            return;
        }
        diasTotales = valorSel + 2; // sumamos 2 días de Running
    }

    if (!fecha_vencimiento.value) {
        alert("Tenés que indicar la fecha de vencimiento.");
        return;
    }

    const data = {
        nombre: nombre.value,
        apellido: apellido.value,
        dni: dni.value,
        telefono: celular.value,
        nivel: nivel.value,
        plan_eg: eg,
        plan_personalizado: pers,
        plan_running: run,
        dias_semana: diasTotales,
        fecha_vencimiento: fecha_vencimiento.value
    };

    if (esNuevo) {
        await fetch(`${API_URL}/alumnos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        alert("Alumno creado");
    } else {
        await fetch(`${API_URL}/alumnos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        alert("Alumno editado");
    }

    window.location.href = "alumnos.html";
}
