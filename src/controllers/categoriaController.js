const { v4: uuidv4 } = require('uuid');

function listar (req, res){
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexion');

        conn.query('SELECT * FROM categoria', (err, categorias) => {{
            if (err) return res.status(500).send ('Error al listar categorias');
            res.render('main/cate/categoria_main', {categorias});
        }});
    });
}

function nueva(req, res) {
    res.render('main/cate/categoria_new');
}

function guardar(req, res) {
    const { nombre, descripcion } = req.body;
    const categoria_id = uuidv4();

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('INSERT INTO categoria SET ?', { categoria_id, nombre, descripcion }, (err) => {
            if (err) return res.status(500).send('Error al agregar categoría');
            res.redirect('/categorias');
        });
    })
    
}

function editar(req, res) {
    const id = req.query.id;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('SELECT * FROM categoria WHERE categoria_id = ?', [id], (err, categorias) => {
            if (err) return res.status(500).send('Error al obtener categorías');
            res.render('main/cate/categoria_edit', { categoria: categorias[0] });
        })
    })
}

function actualizar (req, res){
    const { id, nombre, descripcion } = req.body;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');
        conn.query('UPDATE categoria SET ? WHERE categoria_id = ?', [nombre, descripcion, id], (err) => {
            if (err) return res.status(500).send('Error al actualizar categoría');
            res.redirect('/categorias');
        });
    });
}

function eliminar(req, res) {
    const id = req.body.id;

    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error de conexión');

        conn.query('DELETE FROM categoria WHERE categoria_id = ?', [id], (err, result) => {
            if (err) return res.status(500).send('Error al eliminar categoría');
            res.redirect('/categorias');
        })
    })
}

module.exports = {
    listar,
    nueva,
    guardar,
    editar,
    actualizar,
    eliminar
};