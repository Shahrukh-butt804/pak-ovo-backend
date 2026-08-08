import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

routeSchema.plugin(aggregatePaginate);
export const Route = mongoose.model("Route", routeSchema);