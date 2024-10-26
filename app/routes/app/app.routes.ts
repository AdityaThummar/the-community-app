import { Router } from "express";
import { FEED_ROUTE } from "../points.routes";
import { FeedRouter } from "./feed.routes";

const router = Router();

router.use(FEED_ROUTE, FeedRouter);

export { router as AppRotuer };
