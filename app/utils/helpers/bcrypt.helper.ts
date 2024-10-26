import { compare, genSalt, hash } from "bcrypt";

const hashPassword = async (plain: string) => {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(plain, salt);
    return hashedPassword;
  } catch (error) {
    console.log("🚀 ~ hashPassword ~ error:", error);
    return false;
  }
};

const checkPassword = async (provided: string, dbValue: string) => {
  try {
    const isMatched = await compare(provided, dbValue);
    return isMatched;
  } catch (error) {
    console.log("🚀 ~ checkPassword ~ error:", error);
    return false;
  }
};

export { hashPassword, checkPassword };
