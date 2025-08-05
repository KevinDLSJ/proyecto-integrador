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
    const fechaSQL = new Date().toISOString().slice(0, 19).replace('T', ' ');
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

module.exports = { ticket, guardarVenta };
