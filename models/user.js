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
    console.log('check cart', this.cart)
    const cartProductIndex = this.cart.items.findIndex(item => {
      console.log('check item', item)
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

  static findByPk(userId) {
    const db = getDb();
    return db
      .collection('users')
      .find({ _id: new ObjectId(userId) })
      .next()
  }
}

module.exports = User;
