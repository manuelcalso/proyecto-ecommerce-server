import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  cart: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
    },
  ],
  country: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  zipcode: {
    type: String,
    default: "00000",
  },
  receipts: {
    type: Array,
    default: [],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
