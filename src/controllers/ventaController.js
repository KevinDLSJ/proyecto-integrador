const { v4: uuidv4 } = require('uuid');


function ticket(req, res) {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

   
        conn.query(
            'SELECT producto_id, nombre_p, precio, stock_actual FROM producto',
            (err, productos) => {
                if (err) return res.status(500).send('Error al obtener productos');

                res.render('main/ticket_main', {
                    productos,
                  
                    productosJSON: JSON.stringify(productos || [])
                });
            }
        );
    });
}
function getFechaLocalSQL() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function guardarVenta(req, res) {
    let productos = [];
    try {
        productos = JSON.parse(req.body.productos || "[]");
    } catch (e) {
        console.error("Error parseando productos:", e);
    }

 
    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).send('No se seleccionaron productos');
    }

    const venta_id = uuidv4();
    const fechaSQL = getFechaLocalSQL();
    const estado = 'completada';


    let total = 0;
    productos.forEach(p => total += p.cantidad * p.precio);

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

      
        conn.query(
            'INSERT INTO venta SET ?',
            { venta_id, fecha: fechaSQL, total, estado },
            (err) => {
                if (err) {
                    console.error("Error al registrar venta:", err);
                    return res.status(500).send('Error al registrar venta');
                }

                
                let pendientes = productos.length;

                productos.forEach(p => {
                    const detalle_id = uuidv4();
                    const subtotal = p.cantidad * p.precio;

                    
                    conn.query('INSERT INTO detalle_venta SET ?', {
                        detalle_id,
                        venta_id,
                        producto_id: p.id,
                        cantidad: p.cantidad,
                        precio_unitario: p.precio,
                        subtotal
                    }, (err) => {
                        if (err) console.error("Error insertando detalle:", err);
                    });

                    
                    conn.query(
                        'UPDATE producto SET stock_actual = stock_actual - ? WHERE producto_id = ?',
                        [p.cantidad, p.id],
                        (err) => {
                            if (err) console.error("Error actualizando stock:", err);

                            
                            pendientes--;
                            if (pendientes === 0) {
                                res.redirect('/ticket_main');
                            }
                        }
                    );
                });
            }
        );
    });
}
function buscarVentas(req, res) {
    const texto = req.query.texto || '';
    const fechaInicio = req.query.fechaInicio || '';
    const fechaFin = req.query.fechaFin || '';
    
    const buscarTexto = `%${texto}%`;
    
    let query = 'SELECT * FROM venta WHERE 1=1';
    const params = [];
    
    if (texto) {
        query += ' AND (venta_id LIKE ? OR estado LIKE ?)';
        params.push(buscarTexto, buscarTexto);
    }
    
    if (fechaInicio) {
        query += ' AND fecha >= ?';
        params.push(fechaInicio);
    }
    
    if (fechaFin) {
        // Añadir un día para incluir todo el día de la fecha fin
        const fechaFinAjustada = new Date(fechaFin);
        fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
        query += ' AND fecha < ?';
        params.push(fechaFinAjustada.toISOString().split('T')[0]);
    }
    
    query += ' ORDER BY fecha DESC';
    
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({ error: 'Error de conexión' });
        }
        
        conn.query(query, params, (err, ventas) => {
            if (err) {
                console.error('Error al buscar ventas:', err);
                return res.status(500).json({ error: 'Error al buscar ventas' });
            }
            
            res.json(ventas);
        });
    });
}
// Añade esta función al controlador
function listarVentas(req, res) {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('SELECT * FROM venta ORDER BY fecha DESC', (err, ventas) => {
            if (err) return res.status(500).send('Error al listar ventas');
            
            // Formatear fechas para la vista inicial
            const ventasFormateadas = ventas.map(venta => ({
                ...venta,
                fechaFormateada: new Date(venta.fecha).toLocaleString()
            }));
            
            res.render('main/ver_ventas', { 
                ventas: ventasFormateadas,
                helpers: {
                    formatCurrency: function(value) {
                        return '$' + parseFloat(value).toFixed(2);
                    },
                    formatDate: function(date) {
                        return new Date(date).toLocaleString();
                    }
                }
            });
        });
    });
}

function buscarVentas(req, res) {
    const texto = req.query.texto || '';
    const pagina = parseInt(req.query.pagina) || 1;
    const porPagina = 20; // Número de ventas por página
    
    const buscarTexto = `%${texto}%`;
    const offset = (pagina - 1) * porPagina;
    
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).json({ error: 'Error de conexión' });
        }
        
        // Consulta para obtener las ventas paginadas
        conn.query(
            'SELECT * FROM venta WHERE (venta_id LIKE ? OR estado LIKE ?) ORDER BY fecha DESC LIMIT ? OFFSET ?',
            [buscarTexto, buscarTexto, porPagina, offset],
            (err, ventas) => {
                if (err) {
                    console.error('Error al buscar ventas:', err);
                    return res.status(500).json({ error: 'Error al buscar ventas' });
                }
                
                res.json(ventas);
            }
        );
    });
}

// Exporta la nueva función
module.exports = { ticket, guardarVenta, listarVentas, buscarVentas };
