import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  }
}, { timestamps: true });


categorySchema.plugin(aggregatePaginate);
export const Category = mongoose.model('Category', categorySchema);