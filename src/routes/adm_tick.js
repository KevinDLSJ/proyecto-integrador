const express = require('express');
const principalController = require('../controllers/principalController');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoriaController = require('../controllers/categoriaController');
const ventaController = require('../controllers/ventaController');

const router = express.Router();

//router.get('/ticket_main', principalController.ticket);

router.get('/admin', adminController.admin);
router.get('/buscar', adminController.buscarReal);
router.get('/prov_new', adminController.provnew);
router.post('/prov_new', adminController.newprov);
router.get('/prov_edit', adminController.editar);
router.post('/prov_edit', adminController.prov_edit);
router.post('/eliminar', adminController.eliminar);


router.get('/product', productController.listar);
router.get('/product_new', productController.nuevo);
router.post('/product_new', productController.crear);
router.get('/product_edit', productController.editar);
router.post('/product_edit', productController.actualizar);
router.post('/product_delete', productController.eliminar);
router.get('/product_search', productController.buscar);


router.get('/categorias', categoriaController.listar);
router.get('/categoria_new', categoriaController.nueva);
router.post('/categoria_new', categoriaController.guardar);
router.get('/categoria_edit', categoriaController.editar);
router.post('/categoria_edit', categoriaController.actualizar);
router.post('/categoria_delete', categoriaController.eliminar);


router.get('/ticket_main', ventaController.ticket);
router.post('/guardar_venta', ventaController.guardarVenta);




module.exports = router;