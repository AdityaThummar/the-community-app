import { Request } from "express";
import jwtToken, { JwtPayload, SignOptions } from "jsonwebtoken";
require("dotenv").config();

export type TokenType = "refresh" | "access";

const jwtOptions = (uid: string, type: TokenType = "access") =>
  ({
    issuer: "shadowclone",
    expiresIn: type === "access" ? "1d" : "15d",
    audience: uid,
    algorithm: "HS256",
  } as SignOptions);

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "";

const generateToken = (uid: string, type: TokenType) =>
  new Promise((res, rej) => {
    try {
      const options = jwtOptions(uid, type);
      const secret = type === "refresh" ? refreshSecret : accessSecret;
      jwtToken.sign({}, secret, options, (error, response) => {
        if (error) {
          rej(error);
        } else {
          res(response);
        }
      });
    } catch (error) {
      console.log("🚀 ~ generateAccessToken ~ error:", error);
      return rej(error);
    }
  });

const verifyToken: (token: string, type: TokenType) => JwtPayload = (
  token,
  type = "access"
) =>
  new Promise((res, rej) => {
    try {
      const secret = type === "refresh" ? refreshSecret : accessSecret;
      jwtToken.verify(token, secret, {}, (error, response) => {
        if (error) {
          rej(error);
        } else {
          res(response);
        }
      });
    } catch (error) {
      console.log("🚀 ~ generateAccessToken ~ error:", error);
      return rej(error);
    }
  });

const getTokenFromRequest = (req: Request) => {
  try {
    const token = req?.headers?.["authorization"]
      ?.replace("undefined", "")
      ?.split(" ")
      ?.reverse()?.[0];
    return token ?? "";
  } catch (error) {
    console.log("🚀 ~ getTokenFromRequest ~ error:", error);
    return "";
  }
};

export { generateToken, verifyToken, getTokenFromRequest };
