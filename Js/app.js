const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const acercadeFilePath = path.join(__dirname, 'acercade.txt');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para obtener el contenido de "acercade.txt"
app.get('../Archivos/acercade', (req, res) => {
  fs.readFile(acercadeFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo leer el archivo.' });
    }

    // Procesar el archivo y enviarlo en un formato JSON
    const content = {};
    data.split('\n').forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        content[key.trim()] = value.trim();
      }
    });
    res.json(content);
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
