import { UserModel, UserProfileType, UserSchemaType } from "@models";
import { Request } from "express";
import { Unauthorized, NotFound } from "http-errors";
import { RootFilterQuery } from "mongoose";

const getAudElseError = (req: Request) => {
  try {
    const id = req?.headers?.aud?.toString();
    if (!id) {
      throw Unauthorized("Unauthorized");
    }
    return id;
  } catch (error) {
    console.log("🚀 ~ getAudElseError ~ error:", error);
    throw error;
  }
};

const getUserProfile = async (filter: RootFilterQuery<UserSchemaType>) => {
  try {
    return await UserModel.findOne(filter).select("-password").select("-__v");
  } catch (error) {
    console.log("🚀 ~ getAudElseError ~ error:", error);
    return error;
  }
};

export { getAudElseError, getUserProfile };
