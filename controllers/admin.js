const Product = require('../models/product');
const mongodb = require('mongodb');

const objectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		isAuthenticated: req.isLoggedIn
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, userId: req.user });
	product
		.save()
		.then((product) => {
			console.log("Create Product")
			res.redirect('/admin/products');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	// Product.findByPk(prodId)
	// req.user.getProducts({where:{id: prodId}})
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				isAuthenticated: req.isLoggedIn
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;

	Product.findById(prodId)
		.then(product => {
			product.title = updatedTitle;
			product.price = updatedPrice,
				product.description = updatedDesc,
				product.imageUrl = updatedImageUrl
			return product.save()
		})
		.then((result) => {
			console.log('Updated@@');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getProducts = (req, res, next) => {
	// Product.findAll()
	// req.user
	//     .getProducts()
	//     .then((products) => {
	//         res.render('admin/products', {
	//             prods: products,
	//             pageTitle: 'Admin Products',
	//             path: '/admin/products',
	//         });
	//     })
	//     .catch((err) => {
	//         console.log(err);
	//     });
	Product.find()
		// .populate('userId')
		.then((products) => {
			console.log('connect product');
			console.log(req.isLoggedIn)
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
				isAuthenticated: req.isLoggedIn
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findByIdAndRemove(prodId)
		.then((result) => {
			res.redirect('/admin/products');
			console.log('Delete Success!!!');
		})
		.catch((err) => {
			console.log(err);
		});
};
