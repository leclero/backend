require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Render asigna un puerto automáticamente en process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuración de Middleware
app.use(cors()); // Permite que tu Vercel se comunique con Render
app.use(express.json());

// --- CONEXIÓN A MONGODB ---
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

// 1. Guardar un nuevo mensaje (POST)
app.post("/api/mensajes", async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;
    const nuevoMensaje = new Mensaje({ nombre, email, mensaje });
    await nuevoMensaje.save();
    res.status(201).json({ mensaje: "Guardado correctamente en la nube" });
  } catch (err) {
    res.status(500).json({ error: "Error al guardar el mensaje" });
  }
});

// 2. Obtener todos los mensajes (GET)
app.get("/api/mensajes", async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ fecha: -1 });
    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los mensajes" });
  }
});

// 3. Eliminar un mensaje por ID (DELETE)
app.delete("/api/mensajes/:id", async (req, res) => {
  try {
    await Mensaje.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// 4. Login con contraseña segura
app.post("/api/login", (req, res) => {
  const { clave } = req.body;
  // IMPORTANTE: Debes agregar ADMIN_PASSWORD en las variables de entorno de Render
  if (clave === process.env.ADMIN_PASSWORD) {
    res.json({ acceso: true });
  } else {
    res.status(401).json({ acceso: false, error: "Contraseña incorrecta" });
  }
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor profesional corriendo en puerto ${PORT}`);
});