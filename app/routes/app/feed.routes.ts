import { Router } from "express";
import { RouterPoints } from "../points.routes";
import { validator } from "@middlewares";
import { craeteFeedSchema } from "@validators";
import {
  createFeedController,
  deleteFeedController,
  editFeedController,
  getFeedController,
  reactFeedController,
  getAllFeedController,
} from "@controllers";

const router = Router();

router.get(RouterPoints.ALL_FEEDS, getAllFeedController);

router.post(
  RouterPoints.FEED_CREATE,
  validator(craeteFeedSchema),
  createFeedController
);
router.patch(
  RouterPoints.SINGLE_FEED,
  validator(craeteFeedSchema),
  editFeedController
);
router.get(RouterPoints.SINGLE_FEED, getFeedController);
router.delete(RouterPoints.SINGLE_FEED, deleteFeedController);

router.post(RouterPoints.REACT_FEED, reactFeedController);

export { router as FeedRouter };
