import "module-alias/register";
import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import "@db";
import { AppRouter } from "@routes";

dotenv.config();
const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

app.use(AppRouter);

app.listen(PORT);

export default app;
