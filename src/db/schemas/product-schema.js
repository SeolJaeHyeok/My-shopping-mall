import { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    img: {
      type: String,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    keyword: {
      type: [String],
      required: false,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    detailDescription: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    collection: "products",
    timestamps: true,
  }
);

export { ProductSchema };
