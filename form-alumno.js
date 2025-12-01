// gimnasio-frontend/form-alumno.js
// (versión corregida completa con fix de fecha)

document.addEventListener("DOMContentLoaded", iniciar);

let equipoOriginal = "blanco";
let activoOriginal = 1;
let fechaVencimientoOriginal = null;

const API_URL = "https://gimnasio-online-1.onrender.com";

// --------------------------------------
// 🔧 SUMAR 1 MES CORRECTAMENTE
// --------------------------------------
function sumarUnMes(fecha) {
    const [year, month, day] = fecha.split("-").map(Number);
    let f = new Date(year, month - 1, day);
    f.setMonth(f.getMonth() + 1);

    // FIX FECHA → agregar 1 día para evitar corrimientos por zona horaria
    f.setDate(f.getDate() + 1);

    return f.toISOString().split("T")[0];
}

async function iniciar() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const btnRenovar = document.getElementById("btnRenovar");

    plan_eg.addEventListener("change", onCambioPlanes);
    plan_personalizado.addEventListener("change", onCambioPlanes);
    plan_running.addEventListener("change", onCambioPlanes);

    if (!id) {
        document.getElementById("tituloForm").textContent = "Nuevo Alumno";
        btnRenovar.style.display = "none";
    } else {
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

function esVerdadero(v) {
    return v === true || v === 1 || v === "1";
}

// --------------------------------------
// 🔧 CARGAR ALUMNO (ARREGLADO)
// --------------------------------------
async function cargarAlumno(id) {
    const res = await fetch(`${API_URL}/alumnos/${id}/detalle`);

    if (!res.ok) {
        alert("Error al cargar el alumno");
        return;
    }

    const al = await res.json();

    nombre.value = al.nombre || "";
    apellido.value = al.apellido || "";
    dni.value = al.dni || "";
    celular.value = al.telefono || "";
    nivel.value = al.nivel || "";

    equipoOriginal = al.equipo;
    activoOriginal = al.activo;

    // --------------------------------------
    // 🔧 FIX FECHA → SUMAR 1 DÍA AL CARGAR
    // --------------------------------------
    if (al.fecha_vencimiento) {
        const f = new Date(al.fecha_vencimiento);
        f.setDate(f.getDate() + 1); // ← FIX
        fecha_vencimiento.value = f.toISOString().split("T")[0];
    }

    fechaVencimientoOriginal = fecha_vencimiento.value || null;

    plan_eg.checked = esVerdadero(al.plan_eg);
    plan_personalizado.checked = esVerdadero(al.plan_personalizado);
    plan_running.checked = esVerdadero(al.plan_running);

    const diasTotales = al.dias_semana || "";
    actualizarOpcionesDias(diasTotales);
}

function onCambioPlanes(e) {
    if (plan_eg.checked && plan_personalizado.checked) {
        e.target.checked = false;
        alert("No se puede combinar Plan EG con Personalizado.");
    }
    actualizarOpcionesDias();
}

function actualizarOpcionesDias(diasTotales = null) {
    const sel = document.getElementById("dias_semana");
    const ayuda = document.getElementById("ayudaDias");

    const eg = plan_eg.checked;
    const pers = plan_personalizado.checked;
    const run = plan_running.checked;

    sel.innerHTML = "";
    sel.disabled = false;
    ayuda.textContent = "";

    if (!eg && !pers && !run) {
        sel.innerHTML = `<option value="">Elegí un plan primero</option>`;
        sel.disabled = true;
        return;
    }

    if (run && !eg && !pers) {
        sel.innerHTML = `<option value="2">2 días (Running)</option>`;
        sel.value = "2";
        sel.disabled = true;
        return;
    }

    if ((eg || pers) && !run) {
        sel.innerHTML = `
            <option value="">Elegí cantidad de días</option>
            <option value="3">3 días</option>
            <option value="5">5 días</option>
        `;
        if (diasTotales) sel.value = String(diasTotales);
        return;
    }

    if (run && (eg || pers)) {
        sel.innerHTML = `
            <option value="3">3 días (total 5 con Running)</option>
            <option value="5">5 días (total 7 con Running)</option>
        `;
        if (diasTotales) {
            const base = diasTotales - 2;
            if (base === 3 || base === 5) sel.value = String(base);
        }
    }
}

// --------------------------------------
// 🔧 GUARDAR ALUMNO (ARREGLADO)
// --------------------------------------
async function guardar(e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const esNuevo = !id;

    let eg = plan_eg.checked ? 1 : 0;
    let pers = plan_personalizado.checked ? 1 : 0;
    let run = plan_running.checked ? 1 : 0;

    if (eg && pers) {
        alert("No se puede combinar Plan EG con Personalizado.");
        return;
    }
    if (!eg && !pers && !run) {
        alert("Elegí al menos un plan.");
        return;
    }

    const selDias = document.getElementById("dias_semana");
    let valorSel = Number(selDias.value);

    let diasTotales = 0;

    if (run && !eg && !pers) diasTotales = 2;
    else if ((eg || pers) && !run) {
        if (![3, 5].includes(valorSel)) {
            alert("Elegí 3 o 5 días.");
            return;
        }
        diasTotales = valorSel;
    } else if (run && (eg || pers)) {
        if (![3, 5].includes(valorSel)) {
            alert("Elegí 3 o 5 días.");
            return;
        }
        diasTotales = valorSel + 2;
    }

    if (!fecha_vencimiento.value) {
        alert("Tenés que indicar fecha de vencimiento.");
        return;
    }

    // --------------------------------------
    // 🔧 FIX FECHA → SUMAR 1 DÍA ANTES DE ENVIAR
    // --------------------------------------
    let fechaFix = null;
    if (fecha_vencimiento.value) {
        const f = new Date(fecha_vencimiento.value);
        f.setDate(f.getDate() + 1);
        fechaFix = f.toISOString().split("T")[0];
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
        fecha_vencimiento: fechaFix
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
