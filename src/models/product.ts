import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    default: null,
  },
  rating: {
    type: Number,
    required: true,
  },
  reviews: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  metaTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  productOverview: {
    type: String,
  },
  benefits: {
    type: String,
  },
  howToUse: {
    type: String,
  },
  ingredients: {
    type: String,
  },
  additionalInformation: {
    type: String,
  },
  faqs: {
    type: [
      {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
        _id: false,
      },
    ],
    default: [],
  }

}, { timestamps: true });

productSchema.plugin(aggregatePaginate);
export const Product = mongoose.model('Product', productSchema);