const API_URL = "https://gimnasio-online-1.onrender.com";
 // Ajustalo si tu backend cambia

const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const dniInput = document.getElementById("dni");
const celularInput = document.getElementById("celular");
const nivelInput = document.getElementById("nivel");
const vencInput = document.getElementById("fecha_vencimiento");

const planEG = document.getElementById("plan_eg");
const planPers = document.getElementById("plan_personalizado");
const planRun = document.getElementById("plan_running");

const diasEgPersContainer = document.getElementById("diasEgPersContainer");
const diasEgPers = document.getElementById("dias_eg_pers");

const diasSemanaSelect = document.getElementById("dias_semana");
const ayudaDias = document.getElementById("ayudaDias");

const btnRenovar = document.getElementById("btnRenovar");
const tituloForm = document.getElementById("tituloForm");

let modoEditar = false;
let alumnoID = null;

/* ─────────────────────────────────────────────── */
/* 🔹 VER SI ESTAMOS EDITANDO O CREANDO NUEVO      */
/* ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("editar")) {
        modoEditar = true;
        alumnoID = params.get("editar");

        tituloForm.textContent = "Editar Alumno";
        cargarAlumno(alumnoID);
    } else {
        tituloForm.textContent = "Nuevo Alumno";
        hoyComoVencimiento();
    }
});

/* ─────────────────────────────────────────────── */
/* 🔹 FECHA DE VENCIMIENTO POR DEFECTO             */
/* ─────────────────────────────────────────────── */
function hoyComoVencimiento() {
    const hoy = new Date().toISOString().split("T")[0];
    vencInput.value = hoy;
}

/* ─────────────────────────────────────────────── */
/* 🔹 CARGAR DATOS DEL ALUMNO (EDITAR)             */
/* ─────────────────────────────────────────────── */
async function cargarAlumno(id) {
    try {
        const res = await fetch(`${API_URL}/alumnos/${id}`);
        const data = await res.json();

        nombreInput.value = data.nombre;
        apellidoInput.value = data.apellido;
        dniInput.value = data.dni;
        celularInput.value = data.celular;
        nivelInput.value = data.nivel;
        vencInput.value = data.fecha_vencimiento;

        planEG.checked = data.plan_eg;
        planPers.checked = data.plan_personalizado;
        planRun.checked = data.plan_running;

        if (data.plan_eg || data.plan_personalizado) {
            diasEgPersContainer.style.display = "flex";
            diasEgPers.value = data.dias_eg_pers;
        }

        actualizarDiasSemana();

    } catch (error) {
        alert("Error cargando alumno");
        console.log(error);
    }
}

/* ─────────────────────────────────────────────── */
/* 🔹 BOTÓN RENOVAR FECHA                          */
/* ─────────────────────────────────────────────── */
btnRenovar.addEventListener("click", () => {
    let fecha = new Date(vencInput.value);
    fecha.setMonth(fecha.getMonth() + 1);

    vencInput.value = fecha.toISOString().split("T")[0];
});

/* ─────────────────────────────────────────────── */
/* 🔹 LÓGICA DE PLANES Y DÍAS POR SEMANA           */
/* ─────────────────────────────────────────────── */
const actualizarDiasSemana = () => {
    diasSemanaSelect.innerHTML = "";

    let totalDias = 0;
    let texto = "";

    // RUNNING — SIEMPRE SUMA 2
    if (planRun.checked) {
        totalDias += 2;
        texto += "Running suma 2 días. ";
    }

    // EG y PERSONALIZADO no pueden estar juntos
    if (planEG.checked && planPers.checked) {
        alert("No podés elegir EG y Personalizado juntos.");
        planPers.checked = false;
        return actualizarDiasSemana();
    }

    // EG o PERSONALIZADO
    if (planEG.checked || planPers.checked) {
        diasEgPersContainer.style.display = "flex";
        totalDias += parseInt(diasEgPers.value);
        texto += `+ ${diasEgPers.value} días del plan principal. `;
    } else {
        diasEgPersContainer.style.display = "none";
    }

    if (totalDias === 0) {
        diasSemanaSelect.innerHTML = `<option value="">Elegí un plan primero</option>`;
        ayudaDias.textContent = "";
        return;
    }

    diasSemanaSelect.innerHTML = `<option value="${totalDias}">${totalDias} días por semana</option>`;
    ayudaDias.textContent = texto;
};

// Eventos
planEG.addEventListener("change", actualizarDiasSemana);
planPers.addEventListener("change", actualizarDiasSemana);
planRun.addEventListener("change", actualizarDiasSemana);
diasEgPers.addEventListener("change", actualizarDiasSemana);

/* ─────────────────────────────────────────────── */
/* 🔹 ASIGNACIÓN AUTOMÁTICA DE EQUIPO              */
/* ─────────────────────────────────────────────── */
async function asignarEquipo() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json();

        let blancos = alumnos.filter(a => a.equipo === "blanco").length;
        let morados = alumnos.filter(a => a.equipo === "morado").length;

        return blancos <= morados ? "blanco" : "morado";

    } catch (error) {
        console.log("Error asignando equipo:", error);
        return "blanco";
    }
}

/* ─────────────────────────────────────────────── */
/* 🔹 ENVIAR FORMULARIO                            */
/* ─────────────────────────────────────────────── */
document.getElementById("formAlumno").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dias_totales = parseInt(diasSemanaSelect.value);

    if (!dias_totales) {
        return alert("Elegí un plan para calcular los días por semana.");
    }

    const datos = {
        nombre: nombreInput.value,
        apellido: apellidoInput.value,
        dni: dniInput.value,
        celular: celularInput.value,
        nivel: nivelInput.value,
        fecha_vencimiento: vencInput.value,

        plan_eg: planEG.checked,
        plan_personalizado: planPers.checked,
        plan_running: planRun.checked,

        dias_eg_pers: planEG.checked || planPers.checked ? diasEgPers.value : null,
        dias_semana: dias_totales
    };

    // Crear → asignar equipo
    if (!modoEditar) {
        datos.equipo = await asignarEquipo();
    }

    try {
        let url = `${API_URL}/alumnos`;
        let metodo = "POST";

        if (modoEditar) {
            url = `${API_URL}/alumnos/${alumnoID}`;
            metodo = "PUT";
        }

        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error("Error guardando alumno");

        alert("Alumno guardado con éxito ✔");
        window.location.href = "alumnos.html";

    } catch (error) {
        alert("Error guardando el alumno.");
        console.log(error);
    }
});
