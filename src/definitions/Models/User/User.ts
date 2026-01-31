import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../../interfaces/User";

export type UserDocument = IUser & Document;

export const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
});

export const User = mongoose.model<UserDocument>("User", UserSchema);
