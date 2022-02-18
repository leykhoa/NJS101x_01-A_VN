const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this)
      .then(user => console.log('check user', user))
      .catch((err) => {
        console.log(err);
      });

  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(item => {
      return item.productId.toString() === product._id.toString()
    })
    let newQuantity = 1;
    const updateCartItems = [...this.cart.items]

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updateCartItems[cartProductIndex].quantity = newQuantity
    } else {
      updateCartItems.push({
        productId: product._id,
        quantity: newQuantity
      })
    }

    const updatedCart = { items: updateCartItems };
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      )
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => i.productId)
    return db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => products.map(
        p => ({
          ...p, quantity: this.cart.items.find(
            i => i.productId.toString() === p._id.toString()).quantity
        }
        )))
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      item => item.productId.toString() !== productId.toString())
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      )
  }
  addOrder() {
    const db = getDb()
    return db
      .collection('orders')
      .insertOne(this.cart)
      .then(result => {
        this.cart = { items: [] }
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          )
      })
  }
  static findByPk(userId) {
    const db = getDb();
    return db
      .collection('users')
      .find({ _id: new ObjectId(userId) })
      .next()
  }
}

module.exports = User;
