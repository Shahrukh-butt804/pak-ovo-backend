import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },

  shippingAddress: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      effectivePrice: {
        type: Number,
        required: true,
      },
    },
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled"],
    default: "pending",
  },

  // stripeSource: {
  //   type: String,
  //   required: true,
  // },

  metaData: {
    type: Object,
    default: {}
    // required: true,
  },

}, { timestamps: true });

orderSchema.plugin(aggregatePaginate)
export const Order = mongoose.model("Order", orderSchema);