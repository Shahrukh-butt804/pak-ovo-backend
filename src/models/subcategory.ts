import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const subCategorySchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true
  }
}, { timestamps: true });


subCategorySchema.plugin(aggregatePaginate);
export const SubCategory = mongoose.model('SubCategory', subCategorySchema);