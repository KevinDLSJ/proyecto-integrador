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
  const { nombre_p, descripcion, precio, stock_actual, stock_minimo, stock_maximo, categoria_id } = req.body;

  const nuevoProducto = {
    producto_id: uuidv4(),
    nombre_p,
    descripcion,
    precio,
    stock_actual,
    stock_minimo,
    stock_maximo,
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

  // Validaciones
  if (!id || !nombre_p || !categoria_id) {
    return res.status(400).json({ 
      success: false,
      error: 'ID, nombre y categoría son obligatorios' 
    });
  }

  // Convertir valores numéricos
  const numericFields = {
    precio: parseFloat(precio),
    stock_actual: parseInt(stock_actual),
    stock_minimo: parseInt(stock_minimo)
  };

  // Verificar conversiones
  for (const [field, value] of Object.entries(numericFields)) {
    if (isNaN(value)) {
      return res.status(400).json({ 
        success: false,
        error: `${field} debe ser un número válido` 
      });
    }
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    const productoActualizado = {
      nombre_p,
      descripcion: descripcion || null, // Permitir null si es vacío
      precio: numericFields.precio,
      stock_actual: numericFields.stock_actual,
      stock_minimo: numericFields.stock_minimo,
      categoria_id,
      fecha_actualizacion: new Date()
    };

    conn.query(
      `UPDATE producto SET 
        nombre_p = ?, 
        descripcion = ?, 
        precio = ?, 
        stock_actual = ?, 
        stock_minimo = ?, 
        categoria_id = ?, 
        fecha_actualizacion = NOW() 
      WHERE producto_id = ?`,
      [
        productoActualizado.nombre_p,
        productoActualizado.descripcion,
        productoActualizado.precio,
        productoActualizado.stock_actual,
        productoActualizado.stock_minimo,
        productoActualizado.categoria_id,
        id
      ],
      (err, result) => {
        if (err) {
          console.error('Error SQL:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error al actualizar producto en la base de datos' 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false,
            error: 'Producto no encontrado' 
          });
        }

        res.json({ 
          success: true,
          message: 'Producto actualizado correctamente',
          producto: { id, ...productoActualizado }
        });
      }
    );
  });
}

function eliminar(req, res) {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, error: 'ID de producto es obligatorio' });
    }

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión a la base de datos:', err);
            return res.status(500).json({ success: false, error: 'Error de conexión' });
        }

        conn.query('DELETE FROM producto WHERE producto_id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar producto:', err);
                return res.status(500).json({ success: false, error: 'Error al eliminar el producto' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: 'Producto no encontrado' });
            }
            res.json({ success: true, message: 'Producto eliminado correctamente' });
        });
    });
}
function buscar(req, res) {
  const texto = req.query.texto || '';
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
     `SELECT p.producto_id, p.nombre_p, p.descripcion, p.precio, 
              p.stock_actual, p.fecha_actualizacion, c.nombre as categoria
       FROM producto p 
       LEFT JOIN categoria c ON p.categoria_id = c.categoria_id
       WHERE p.nombre_p LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ?
       ORDER BY p.nombre_p`,
      [`%${texto}%`, `%${texto}%`, `%${texto}%`],
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
