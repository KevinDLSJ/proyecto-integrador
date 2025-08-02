const { v4: uuidv4 } = require('uuid'); // Para generar UUID

function listar(req, res) {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('SELECT p.*, c.nombre FROM producto p LEFT JOIN categoria c ON p.categoria_id = c.categoria_id', (err, productos) => {
      if (err) return res.status(500).send('Error al obtener productos');
      res.render('main/prod/product', { productos });
    });
  });
}

function nuevo(req, res) {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('SELECT * FROM categoria', (err, categorias) => {
      if (err) return res.status(500).send('Error al obtener categorías');
      console.log("Categorias cargadas:", categorias);
      res.render('main/prod/product_new', { categorias });
    });
  });
}


function crear(req, res) {
  const { nombre_p, descripcion, precio, stock_actual, stock_minimo, categoria_id } = req.body;

  const nuevoProducto = {
    producto_id: uuidv4(),
    nombre_p,
    descripcion,
    precio,
    stock_actual,
    stock_minimo,
    categoria_id,
    fecha_creacion: new Date(),
    fecha_actualizacion: null
  };

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('INSERT INTO producto SET ?', nuevoProducto, (err) => {
      if (err) return res.status(500).send('Error al agregar producto');
      res.redirect('/product');
    });
  });
}

function editar(req, res) {
  const id = req.query.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('SELECT * FROM producto WHERE producto_id = ?', [id], (err, productos) => {
      if (err) return res.status(500).send('Error al obtener producto');

      conn.query('SELECT * FROM categoria', (err, categorias) => {
        if (err) return res.status(500).send('Error al obtener categorías');

        res.render('main/prod/product_edit', {
          producto: productos[0],
          categorias
        });
      });
    });
  });
}

function actualizar(req, res) {
  const { id, nombre_p, descripcion, precio, stock_actual, stock_minimo, categoria_id } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query(
      `UPDATE producto 
       SET nombre_p=?, descripcion=?, precio=?, stock_actual=?, stock_minimo=?, categoria_id=?, fecha_actualizacion=NOW() 
       WHERE producto_id=?`,
      [nombre_p, descripcion, precio, stock_actual, stock_minimo, categoria_id, id],
      (err) => {
        if (err) return res.status(500).send('Error al actualizar producto');
        res.redirect('/product');
      }
    );
  });
}

function eliminar(req, res) {
  const id = req.body.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('DELETE FROM producto WHERE producto_id = ?', [id], (err) => {
      if (err) return res.status(500).send('Error al eliminar producto');
      res.redirect('/product');
    });
  });
}

function buscar(req, res) {
  const texto = req.query.texto || '';
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      `SELECT p.*, c.nombre 
       FROM producto p 
       LEFT JOIN categoria c ON p.categoria_id = c.categoria_id
       WHERE p.nombre_P LIKE ?`,
      [`%${texto}%`],
      (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error al buscar' });
        res.json(resultados);
      }
    );
  });
}

module.exports = {
  listar,
  nuevo,
  crear,
  editar,
  actualizar,
  eliminar,
  buscar
};
