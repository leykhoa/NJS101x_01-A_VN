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
    // const cartProduct = this.cart.items.findIndex(cp => cp._id === product._id)
    const updatedCart = { item: [{ productId: new ObjectId(product._id), quantity: 1 }] };
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
