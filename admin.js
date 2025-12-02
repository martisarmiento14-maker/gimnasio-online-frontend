// routes/admin.js
import express from "express";
import db from "../database/db.js";

const router = express.Router();

// LISTA ALUMNOS
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM alumnos ORDER BY apellido ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR GET /admin:", err);
        res.status(500).json({ error: "Error al obtener alumnos" });
    }
});

// CAMBIAR EQUIPO
router.put("/equipo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { equipo } = req.body;

        const result = await db.query(`
            UPDATE alumnos SET equipo = $1 WHERE id = $2 RETURNING *;
        `, [equipo, id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /admin/equipo:", err);
        res.status(500).json({ error: "Error al actualizar equipo" });
    }
});

// ACTIVAR ALUMNO
router.put("/activar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            UPDATE alumnos SET activo = 1 WHERE id = $1 RETURNING *;
        `, [id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /admin/activar:", err);
        res.status(500).json({ error: "Error al activar alumno" });
    }
});

// DESACTIVAR ALUMNO
router.put("/desactivar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(`
            UPDATE alumnos SET activo = 0 WHERE id = $1 RETURNING *;
        `, [id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /admin/desactivar:", err);
        res.status(500).json({ error: "Error al desactivar alumno" });
    }
});

// BORRAR ALUMNO (borra asistencias primero)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM asistencias WHERE id_alumno = $1", [id]);

        await db.query("DELETE FROM alumnos WHERE id = $1", [id]);

        res.json({ success: true, message: "Alumno eliminado correctamente" });

    } catch (err) {
        console.error("ERROR BORRANDO ALUMNO:", err);
        res.status(500).json({ error: "No se pudo eliminar el alumno" });
    }
});

export default router;
