import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, { timestamps: true });


wishlistSchema.plugin(aggregatePaginate);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);