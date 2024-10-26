import mongoose, { Document, model } from "mongoose";
import { hashPassword } from "@utils";

export type UserProfileType = {
  email: string;
  newUser: boolean;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  _id: string;
};

export type UserSchemaType = {
  password: string;
} & Omit<UserProfileType, "_id"> &
  Document;

const Schema = mongoose.Schema;

const User = new Schema<UserSchemaType>({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  newUser: {
    type: Boolean,
    required: true,
  },
  firstName: {
    type: String,
    min: 3,
  },
  lastName: {
    type: String,
    min: 3,
  },
  gender: {
    type: String,
  },
  bio: {
    type: String,
    max: 500,
  },
});

User.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hashedPassword = await hashPassword(this.password);

  if (hashedPassword) {
    this.password = hashedPassword;
  }

  next();
});

const UserModel = model<UserSchemaType>("user", User);
export { UserModel };
