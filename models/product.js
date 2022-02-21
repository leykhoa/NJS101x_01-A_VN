const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productShema = new Schema({
    title: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('Product', productShema)

const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
// 	constructor(title, price, description, imageUrl, id, userId) {
// 		this.title = title;
// 		this.price = price;
// 		this.description = description;
// 		this.imageUrl = imageUrl;
// 		this._id = id ? new mongodb.ObjectId(id) : null;
// 		this.userId = userId
// 	}

// 	save() {
// 		const db = getDb();
// 		let dbOp;
// 		if (this._id) {
// 			dbOp = db.collection('products').updateOne(
// 				{
// 					_id: this._id,
// 				},
// 				{ $set: this }
// 			);
// 		} else {
// 			dbOp = db.collection("products").insertOne(this);
// 		}
// 		return dbOp
// 			.then(result => { })
// 			.catch((err) => console.log(err));
// 	}

// 	static fetchAll() {
// 		const db = getDb();
// 		return db
// 			.collection('products')
// 			.find()
// 			.toArray()
// 			.then((products) => {
// 				console.log(products);
// 				return products;
// 			})
// 			.catch((err) => console.log(err));
// 	}

// 	static findByPk(prodId) {
// 		const db = getDb();
// 		return db
// 			.collection('products')
// 			.findOne({ _id: new mongodb.ObjectId(prodId) })
// 	}

// 	static deleteByPk(prodId) {
// 		const db = getDb();
// 		return db
// 			.collection('products')
// 			.deleteOne({ _id: new mongodb.ObjectId(prodId) })
// 			.then((product) => {
// 				console.log("Deleted!");
// 			})
// 			.catch((err) => console.log(err));
// 	}
// }

// module.exports = Product;
