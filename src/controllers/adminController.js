// ... (funciones existentes)
const { v4: uuidv4 } = require('uuid');

function admin(req, res) {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('SELECT * FROM proveedor', (err, proveedores) => {
      if (err) return res.status(500).send('Error al obtener proveedores');
      res.render('main/admin/admin_main', { proveedores });
    });
  });
}

function buscarReal(req, res) {
  const texto = req.query.texto || '';
  const buscar = `%${texto}%`;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      'SELECT * FROM proveedor WHERE nombre LIKE ? OR contacto LIKE ? OR telefono LIKE ? OR email LIKE ? LIMIT 10',
      [buscar, buscar, buscar, buscar],
      (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en consulta' });
        res.json(resultados);
      }
    );
  });
}

function newprov(req, res) {
  // Manejar el método GET para mostrar el formulario
  if (req.method === 'GET') {
    return     res.render('main/admin/prov_new'); // Asegúrate de que esta es la ruta correcta a tu archivo HTML
  }

  // Manejar el método POST para guardar los datos
  const data = {
    proveedor_id: uuidv4(),
    nombre: req.body.nombre,
    contacto: req.body.contacto,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    fecha_registro: new Date().toISOString().slice(0, 19).replace('T', ' '),
    email: req.body.email,
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return res.status(500).send('Error de conexión');
    }

    conn.query('INSERT INTO proveedor SET ?', data, (err, resultados) => {
      if (err) {
        console.error('Error al guardar proveedor:', err);
        return res.status(500).send('Error al guardar proveedor');
      }
      // Redirige al usuario a la página de administración después de guardar
      res.redirect('/admin');
    });
  });
}

function prov_edit(req, res) {
  const { id, nombre, contacto, telefono, email, direccion } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      'UPDATE proveedor SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ? WHERE proveedor_id = ?',
      [nombre, contacto, telefono, email, direccion, id],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar proveedor:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error al actualizar proveedor' 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'Proveedor no encontrado' 
          });
        }

        res.json({ 
          success: true,
          message: 'Proveedor actualizado correctamente'
        });
      }
    );
  });
}
// Agrega esta función al archivo adminController.js
function eliminar(req, res) {
    const id = req.body.id;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ success: false, error: 'Error de conexión' });

        conn.query('DELETE FROM proveedor WHERE proveedor_id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar proveedor:', err);
                return res.status(500).json({ success: false, error: 'Error al eliminar proveedor' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
            }

            res.json({ success: true, message: 'Proveedor eliminado correctamente' });
        });
    });
}

// ... (en la exportación del módulo, asegúrate de incluirla)
module.exports = {
  admin,
  buscarReal,
  newprov,
  prov_edit,
  eliminar // Asegúrate de agregar esta línea
};
