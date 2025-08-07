const { v4: uuidv4 } = require('uuid');

function listar(req, res) {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('SELECT * FROM categoria', (err, categorias) => {
            if (err) return res.status(500).send('Error al listar categorías');
            res.render('main/cate/categoria_main', { categorias });
        });
    });
}

function nueva(req, res) {
    res.render('main/cate/categoria_new');
}

function guardar(req, res) {
    const { categoria_id, nombre, descripcion } = req.body;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        // Verificar si el ID ya existe
        conn.query('SELECT * FROM categoria WHERE categoria_id = ?', [categoria_id], (err, results) => {
            if (err) return res.status(500).send('Error al verificar ID');
            
            if (results.length > 0) {
                return res.status(400).send('El ID de categoría ya existe');
            }

            conn.query('INSERT INTO categoria SET ?', { categoria_id, nombre, descripcion }, (err) => {
                if (err) return res.status(500).send('Error al agregar categoría');
                res.redirect('/categorias');
            });
        });
    });
}

function editar(req, res) {
    const id = req.query.id;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('SELECT * FROM categoria WHERE categoria_id = ?', [id], (err, categorias) => {
            if (err) return res.status(500).send('Error al obtener categorías');
            res.render('main/cate/categoria_edit', { categoria: categorias[0] });
        });
    });
}

function actualizar(req, res) {
    const { id, categoria_id, nombre, descripcion } = req.body;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ error: 'Error de conexión' });
        
        // Verificar si el nuevo ID ya existe (si es diferente al original)
        if (categoria_id !== id) {
            conn.query('SELECT * FROM categoria WHERE categoria_id = ?', [categoria_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Error al verificar ID' });
                
                if (results.length > 0) {
                    return res.status(400).json({ error: 'El nuevo ID de categoría ya existe' });
                }

                // Actualizar con el nuevo ID
                conn.query('UPDATE categoria SET categoria_id = ?, nombre = ?, descripcion = ? WHERE categoria_id = ?', 
                    [categoria_id, nombre, descripcion, id], 
                    (err, result) => {
                        if (err) return res.status(500).json({ error: 'Error al actualizar categoría' });
                        res.json({ 
                            success: true,
                            message: 'Categoría actualizada correctamente'
                        });
                    });
            });
        } else {
            // ID no ha cambiado, actualizar normalmente
            conn.query('UPDATE categoria SET nombre = ?, descripcion = ? WHERE categoria_id = ?', 
                [nombre, descripcion, id], 
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Error al actualizar categoría' });
                    res.json({ 
                        success: true,
                        message: 'Categoría actualizada correctamente'
                    });
                });
        }
    });
}

function eliminar(req, res) {
    const id = req.body.id;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('DELETE FROM categoria WHERE categoria_id = ?', [id], (err, result) => {
            if (err) return res.status(500).send('Error al eliminar categoría');
            res.json({ success: true });
        });
    });
}

function buscar(req, res) {
    const texto = req.query.texto || '';
    const buscarTexto = `%${texto}%`;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión a la base de datos:', err);
            return res.status(500).json({ error: 'Error de conexión' });
        }

        // Search for the given text in the 'categoria' table
        conn.query(
            'SELECT * FROM categoria WHERE categoria_id LIKE ? OR nombre LIKE ? OR descripcion LIKE ?',
            [buscarTexto, buscarTexto, buscarTexto],
            (err, resultados) => {
                if (err) {
                    console.error('Error al ejecutar la consulta SQL:', err);
                    return res.status(500).json({ error: 'Error en la búsqueda' });
                }
                // Send the search results as a JSON response
                res.json(resultados);
            }
        );
    });
}

module.exports = {
    listar,
    nueva,
    guardar,
    editar,
    actualizar,
    eliminar,
    buscar
};