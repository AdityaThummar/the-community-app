import { NextFunction, Request, Response } from "express";
import { InternalServerError, NotFound, BadRequest } from "http-errors";
import { getAudElseError, handleError, sendSuccessResponse } from "@utils";
import {
  ChildCommentType,
  CommentType,
  FeedCommentType,
  FeedModel,
  LikeType,
  ReactionModel,
  ReactionType,
} from "@models";

const getFeed = async (_id: string) => {
  try {
    const feed = await FeedModel.findOne({
      _id,
    }).select("-__v");
    const reactions = await ReactionModel?.findOne({ feedId: feed?.id }).select(
      "-__v"
    );
    if (!feed) {
      throw NotFound("Feed not found !!");
    }

    const data = {
      feed: {
        id: feed?.id ?? "",
        title: feed?.title ?? "",
        user: feed?.user ?? "",
        commentsCounts: reactions?.comments ? reactions?.comments?.length : 0,
        likesCounts: reactions?.likes ? reactions?.likes?.length : 0,
        date: feed?.date ?? "",
        reactions: reactions ?? {},
      },
    };

    console.log("🚀 ~ getFeed ~ feed:", data);
    return data;
  } catch (error) {
    console.log("🚀 ~ getFeed ~ error:", error);
    throw NotFound("Feed not found !!");
  }
};

const getAllFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getAudElseError(req);
    const feed = await FeedModel.find({ user: _id }).select(["-__v"]);
    const type = req?.query?.type;
    const reaction = await ReactionModel?.find({
      feedId: { $in: feed?.map((_) => _.id) },
    }).select(["-__v"]);
    let feeds = feed?.map((feedItem) => {
      const reactions: any =
        reaction?.find(
          (reactionItem) => reactionItem?.feedId === feedItem?.id
        ) ?? {};
      return {
        id: feedItem?.id ?? "",
        title: feedItem?.title ?? "",
        user: feedItem?.user ?? "",
        commentsCounts: reactions?.comments ? reactions?.comments?.length : 0,
        likesCounts: reactions?.likes ? reactions?.likes?.length : 0,
        date: feedItem?.date ?? "",
        ...(type === "full" ? { reactions } : {}),
      };
    });
    sendSuccessResponse(res, { feeds }, "");
  } catch (error) {
    console.log("🚀 ~ getFeed ~ error:", error);
    throw InternalServerError("Something went wrong !!");
  }
};

const createFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = getAudElseError(req);
    const feed = {
      ...req.body,
      date: new Date().getTime().toString(),
      user: _id,
    };
    const updated = await FeedModel.create(feed);
    if (!updated?.id) {
      next(InternalServerError("Feed creation failed."));
      return;
    }
    const feedData = await getFeed(updated?.id);
    const data = { feed: feedData };
    sendSuccessResponse(res, data, "Feed created successfully !!");
  } catch (error) {
    console.log("🚀 ~ createFeedController ~ error:", error);
    next(handleError(error));
  }
};

const editFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedId = req?.params?.id;
    const newFeedData = req?.body;
    const foundFeed = await getFeed(feedId);
    if (!foundFeed) {
      next(NotFound("Feed not found !!"));
      return;
    }
    await FeedModel.updateOne({ _id: feedId }, newFeedData);
    const newData = await getFeed(feedId);
    const data = { feed: newData };
    sendSuccessResponse(res, data, "Feed updated successfully !!");
  } catch (error) {
    console.log("🚀 ~ editFeedController ~ error:", error);
    next(handleError(error));
  }
};

const getFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedId = req?.params?.id;
    if (!feedId) {
      next(BadRequest("Please provide id !!"));
      return;
    }
    const feedData = await getFeed(feedId);
    const data = { feed: feedData };
    sendSuccessResponse(res, data, "Feed fetched successfully !!");
  } catch (error) {
    console.log("🚀 ~ getFeedController ~ error:", error);
    next(handleError(error));
  }
};

const deleteFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const feedId = req?.params?.id;
    if (!feedId) {
      next(BadRequest("Please provide id !!"));
      return;
    }
    const deleted = await FeedModel.deleteOne({ _id: feedId });
    await ReactionModel.deleteOne({ feedId });
    if (deleted?.deletedCount == 0) {
      next(NotFound("Feed not found !!"));
      return;
    }
    sendSuccessResponse(res, null, "Feed deleted successfully !!");
  } catch (error: any) {
    console.log("🚀 ~ deleteFeedController ~ error:", error?.message);
    next(NotFound("Feed not found !!"));
  }
};

const likeFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAudElseError(req);
    const data = req?.body;
    const feedId = data?.feedId;
    const emoji = data?.emoji;
    const feed = await FeedModel.findOne({ _id: feedId });
    if (!feed) {
      next(NotFound("Feed not found !!"));
      return;
    }
    const oldReaction: any = await ReactionModel.findOne({ feedId });
    let newReaction: ReactionType = { media: "feed", feedId };
    console.log("🚀 ~ oldReaction:", oldReaction);
    if (oldReaction?.id) {
      newReaction = {
        ...newReaction,
        comments: oldReaction?.comments ?? [],
        likes: oldReaction?.likes ?? [],
      };
      const oldLikes = oldReaction?.likes as LikeType[];
      const alreadyLiked = oldLikes?.findIndex((_) => _.user === userId);
      if (alreadyLiked !== -1) {
        sendSuccessResponse(res, {}, "Feed is already liked !!");
      } else {
        const newLikes: LikeType[] = [
          ...(oldLikes ?? []),
          { emoji: "like", user: userId },
        ];
        newReaction = {
          ...newReaction,
          likes: newLikes ?? [],
        };
        await ReactionModel.updateOne({ feedId }, newReaction);
      }
    } else {
      newReaction = {
        ...newReaction,
        comments: [],
        likes: [{ user: userId, emoji: emoji ?? "like" }],
      };
      const created = await ReactionModel.create(newReaction);
      if (!created?.id) {
        next(InternalServerError("Reaction failed."));
        return;
      }
    }
    sendSuccessResponse(res, {}, "Feed reacted successfully !!");
  } catch (error) {
    console.log("🚀 ~ likeFeedController ~ error:", error);
    next(InternalServerError("Something went wrong !!"));
  }
};

const unlikeFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAudElseError(req);
    const data = req?.body;
    const feedId = data?.feedId;
    const feed = await FeedModel.findOne({ _id: feedId });
    if (!feed) {
      next(NotFound("Feed not found !!"));
      return;
    }
    const oldReaction: any = await ReactionModel.findOne({ feedId });
    let newReaction: ReactionType = { media: "feed", feedId };
    console.log("🚀 ~ oldReaction:", oldReaction);
    if (oldReaction?.id) {
      newReaction = {
        ...newReaction,
        comments: oldReaction?.comments ?? [],
        likes: oldReaction?.likes ?? [],
      };
      const oldLikes = (oldReaction?.likes ?? []) as LikeType[];
      const alreadyLiked = oldLikes?.findIndex((_) => _.user === userId);
      if (alreadyLiked !== -1) {
        const filteredLikes = oldLikes?.filter((_) => _.user !== userId);
        newReaction = {
          ...newReaction,
          likes: filteredLikes ?? [],
        };
        console.log("🚀 ~ newReaction:", newReaction, "///", oldReaction?._id);
        await ReactionModel.updateOne({ feedId }, newReaction);
      }
    }
    sendSuccessResponse(res, {}, "Feed unliked successfully !!");
  } catch (error) {
    console.log("🚀 ~ likeFeedController ~ error:", error);
    next(InternalServerError("Something went wrong !!"));
  }
};

const getCommentId = (type: string, index: number) =>
  `${type === "main" ? "comment" : "child"}-${index}`;

const commentFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAudElseError(req);
    const data = req?.body;
    const feedId = data?.feedId;
    const feed = await FeedModel.findOne({ _id: feedId });
    if (!feed) {
      next(NotFound("Feed not found !!"));
      return;
    }
    const commentType = data?.commentType ?? "main";
    const mainCommentId = data?.mainCommentId;
    const text = data?.text;
    if (!text) {
      next(BadRequest("Please enter text !!"));
      return;
    }
    let newCommentItem: CommentType | ChildCommentType | FeedCommentType = {
      id: getCommentId(commentType, 0),
      date: new Date().getTime().toString(),
      commentType,
      text,
      user: userId,
      likes: [],
    };
    const oldReaction: any = await ReactionModel.findOne({ feedId });
    let newReaction: ReactionType = { media: "feed", feedId };
    console.log("🚀 ~ oldReaction:", oldReaction);
    if (oldReaction?.id) {
      const oldComments = oldReaction?.comments;
      const oldLikes = oldReaction?.likes;
      newReaction = {
        ...newReaction,
        comments: oldComments ?? [],
        likes: oldLikes ?? [],
      };

      if (commentType === "child") {
        if (!mainCommentId) {
          next(BadRequest("Please provide mainCommentId !!"));
          return;
        }

        newCommentItem = {
          ...newCommentItem,
          mainCommentId,
        };

        let newChildComments: ChildCommentType[] = [];
        const oldCommentObj: any = oldComments?.find(
          (_: any) => _.id === mainCommentId
        );
        if (oldCommentObj && Object.keys(mainCommentId).length !== 0) {
          const oldChildComments = oldCommentObj?.childComments ?? [];
          newCommentItem = {
            ...newCommentItem,
            id: getCommentId(commentType, oldChildComments?.length ?? 1),
          };
          newChildComments = [...(oldChildComments ?? []), newCommentItem];
        } else {
          next(NotFound("Main comment not found !!"));
          return;
        }
        const newComment: FeedCommentType = {
          commentType: "main",
          id: mainCommentId,
          likes: oldCommentObj?.likes ?? [],
          date: oldCommentObj?.date ?? "",
          text: oldCommentObj?.text ?? "",
          user: oldCommentObj?.user ?? "",
          childComments: newChildComments ?? [],
        };
        const newComments = [...(oldComments ?? [])]?.map((__) =>
          __?.id === newComment?.id ? newComment : __
        );
        newReaction = {
          ...newReaction,
          comments: newComments ?? [],
        };
        console.log("🚀 ~ newComment:", newReaction);
        await ReactionModel.updateOne({ feedId }, newReaction);
      } else {
        console.log("running");
        newReaction = {
          ...newReaction,
          comments: oldComments ?? [],
          likes: oldLikes ?? [],
        };
        let newComments: FeedCommentType[] = [
          ...((oldComments as FeedCommentType[]) ?? []),
          {
            ...newCommentItem,
            childComments: [],
            id: getCommentId(commentType, oldComments?.length ?? 1),
          },
        ];
        newReaction = {
          ...newReaction,
          comments: newComments ?? [],
        };
        await ReactionModel.updateOne({ feedId }, newReaction);
      }
    } else {
      newReaction = {
        ...newReaction,
        likes: [],
        comments: [
          {
            ...newCommentItem,
            childComments: [],
          },
        ],
      };
      const created = await ReactionModel.create(newReaction);
      if (!created?.id) {
        next(InternalServerError("Reaction failed."));
        return;
      }
    }
    sendSuccessResponse(res, {}, "Feed reacted successfully !!");
  } catch (error) {
    console.log("🚀 ~ likeFeedController ~ error:", error);
    next(InternalServerError("Something went wrong !!"));
  }
};

const uncommentFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAudElseError(req);
    const data = req?.body;
    const feedId = data?.feedId;
    const feed = await FeedModel.findOne({ _id: feedId });
    if (!feed) {
      next(NotFound("Feed not found !!"));
      return;
    }
    const commentType = data?.commentType ?? "main";
    const mainCommentId = data?.mainCommentId;
    const childCommentId = data?.childCommentId;
    if (!mainCommentId) {
      next(BadRequest("Please provide mainCommentId !!"));
      return;
    }
    const oldReaction: any = await ReactionModel.findOne({ feedId });
    let newReaction: ReactionType = { media: "feed", feedId };
    console.log("🚀 ~ oldReaction:", oldReaction);
    if (oldReaction?.id) {
      const oldComments = oldReaction?.comments;
      const oldLikes = oldReaction?.likes;
      newReaction = {
        ...newReaction,
        comments: oldComments ?? [],
        likes: oldLikes ?? [],
      };

      if (commentType === "child") {
        if (!childCommentId) {
          next(BadRequest("Please provide childCommentId !!"));
          return;
        }

        let newChildComments: ChildCommentType[] = [];
        const oldCommentObj: any = oldComments?.find(
          (_: any) => _.id === mainCommentId
        );
        if (oldCommentObj && Object.keys(mainCommentId).length !== 0) {
          const oldChildComments = oldCommentObj?.childComments ?? [];
          newChildComments = [...(oldChildComments ?? [])]?.filter(
            (__) => __?.id !== childCommentId
          );

          const newComment: FeedCommentType = {
            commentType: "main",
            id: mainCommentId,
            likes: oldCommentObj?.likes ?? [],
            date: oldCommentObj?.date ?? "",
            text: oldCommentObj?.text ?? "",
            user: oldCommentObj?.user ?? "",
            childComments: newChildComments ?? [],
          };

          const newComments = [...(oldComments ?? [])]?.map((__) =>
            __?.id === newComment?.id ? newComment : __
          );

          newReaction = {
            ...newReaction,
            comments: newComments ?? [],
          };

          console.log("🚀 ~ newComment:", newReaction);
          await ReactionModel.updateOne({ feedId }, newReaction);
        }
      } else {
        console.log("running");
        newReaction = {
          ...newReaction,
          comments: oldComments ?? [],
          likes: oldLikes ?? [],
        };
        let newComments: FeedCommentType[] = [
          ...((oldComments as FeedCommentType[]) ?? []),
        ]?.filter((__) => __?.id !== mainCommentId);
        newReaction = {
          ...newReaction,
          comments: newComments ?? [],
        };
        await ReactionModel.updateOne({ feedId }, newReaction);
      }
    }
    sendSuccessResponse(res, {}, "Comment deleted successfully !!");
  } catch (error) {
    console.log("🚀 ~ likeFeedController ~ error:", error);
    next(InternalServerError("Something went wrong !!"));
  }
};

const reactFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req?.body;
    const type = data?.type;
    const feedId = data?.feedId;
    if (!feedId) {
      next(BadRequest("Please provide id !!"));
      return;
    }
    if (!type) {
      next(BadRequest("Please provide type !!"));
      return;
    }
    switch (type) {
      case "like":
        return likeFeedController(req, res, next);
      case "unlike":
        return unlikeFeedController(req, res, next);
      case "comment":
        return commentFeedController(req, res, next);
      case "uncomment":
        return uncommentFeedController(req, res, next);
      default:
        next(InternalServerError("Reaction action failed !!"));
        return;
    }

    // sendSuccessResponse(res, null, "Feed deleted successfully !!");
  } catch (error: any) {
    console.log("🚀 ~ deleteFeedController ~ error:", error?.message);
    next(NotFound("Feed not found !!"));
  }
};

export {
  createFeedController,
  getFeedController,
  editFeedController,
  deleteFeedController,
  reactFeedController,
  getAllFeedController,
  commentFeedController,
  uncommentFeedController,
};
