import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    _id: false,
  }],
}, { timestamps: true });


cartSchema.plugin(aggregatePaginate);
export const Cart = mongoose.model('Cart', cartSchema);