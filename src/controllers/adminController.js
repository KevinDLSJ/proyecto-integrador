const { connect } = require("../routes/adm_tick");

function admin(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM proveedor', (err, proveedores) => {
      if (err) {
        res.json(err);
        console.log(err);
      }
      console.log(proveedores);
      res.render('main/admin_main', { proveedores: proveedores });

    })
  })

}

function buscarReal(req, res) {
  const texto = req.query.texto || '';
  const buscar = `%${texto}%`;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      'SELECT * FROM proveedor WHERE nombre LIKE ? OR contacto LIKE ? OR telefono LIKE ? LIMIT 10',
      [buscar, buscar, buscar],
      (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en consulta' });

        res.json(resultados);
      }
    );
  });
}

function newprov(req, res) {
  const data = {
    proveedor_id: req.body.proveedor_id,
    nombre: req.body.nombre,
    contacto: req.body.contacto,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    fecha_registro: req.body.fecha_registro,
    email: req.body.email,
  };

  console.log('Datos recibidos:', data);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return res.status(500).send('Error de conexión');
    }

    conn.query('INSERT INTO proveedor SET ?', data, (err, resultados) => {
      if (err) {
        console.error('Error al guardar proveedor:', err);
        return res.status(500).send('Error al guardar');
      }
      console.log('Proveedor agregado:', resultados);
      res.redirect('/admin');
    });
  });
}


function prov_edit(req, res) {
  const id = req.query.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return res.status(500).send('Error de conexión');
    }

    conn.query(
      'UPDATE proveedor SET ? WHERE proveedor_id = ?',
      [req.body, id],
      (err, resultados) => {
        if (err) {
          console.error('Error al actualizar proveedor:', err);
          return res.status(500).send('Error al actualizar proveedor');
        }
        console.log('Proveedor actualizado:', resultados);
        res.redirect('/admin');
      }
    );
  });
}

function provnew(req, res) {
  res.render('main/admin/prov_new');

}

function editar(req, res) {
  console.log('Ejecutando editar con ID:', req.query.id);
  const proveedor_id = req.query.id;


  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error de conexión');
    }

    conn.query(
      "SELECT proveedor_id, nombre, contacto, telefono, email, fecha_registro, direccion FROM proveedor WHERE proveedor_id=?",
      [proveedor_id],
      (err, prov) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Error en la consulta');
        }

        console.log('Resultado de la consulta:', prov);

        res.render('main/admin/prov_edit', { resultado: prov });
      }
    );
  });
}

function eliminar(req, res) {
  const id = req.body.id; // ahora funciona con POST
  console.log('ID recibido para eliminar:', id);

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return res.status(500).send('Error de conexión');
    }

    conn.query('DELETE FROM proveedor WHERE proveedor_id = ?', [id], (err, resultados) => {
      if (err) {
        console.error('Error al eliminar proveedor:', err);
        return res.status(500).send('Error al eliminar proveedor');
      }

      console.log('Proveedor eliminado:', resultados);
      res.redirect('/admin');
    });
  });
}



module.exports = {
  admin: admin,
  buscarReal: buscarReal,
  provnew: provnew,
  newprov: newprov,
  editar: editar,
  eliminar,
  prov_edit,
}