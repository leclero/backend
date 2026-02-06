require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middleware
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A MONGODB ---
// Asegúrate de añadir MONGO_URI en tu archivo .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error de conexión:", err));

// --- MODELO DE DATOS ---
const MensajeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});

const Mensaje = mongoose.model("Mensaje", MensajeSchema);

// --- RUTAS ---

// 1. Guardar un nuevo mensaje
app.post("/api/mensajes", async (req, res) => {
  try {
    const nuevoMensaje = new Mensaje({
      nombre: req.body.nombre,
      email: req.body.email,
      mensaje: req.body.mensaje
    });
    await nuevoMensaje.save();
    res.status(201).json({ mensaje: "Guardado correctamente en la nube" });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar el mensaje" });
  }
});

// 2. Obtener todos los mensajes
app.get("/api/mensajes", async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ fecha: -1 }); // Los más nuevos primero
    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
});

// 3. Eliminar un mensaje por ID (Más seguro que por fecha)
app.delete("/api/mensajes/:id", async (req, res) => {
  try {
    await Mensaje.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// 4. Login con contraseña desde .env
app.post("/api/login", (req, res) => {
  const { clave } = req.body;
  if (clave === process.env.ADMIN_PASSWORD) {
    res.json({ acceso: true });
  } else {
    res.status(401).json({ acceso: false, error: "Contraseña incorrecta" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor profesional corriendo en puerto ${PORT}`);
});