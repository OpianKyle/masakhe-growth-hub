import { Router } from "express";
import { workspaceRouter } from "./workspace";
import { accountsRouter } from "./accounts";
import { postsRouter } from "./posts";
import { mediaRouter } from "./media";
import { analyticsRouter } from "./analytics";
import { auditRouter } from "./audit";

export const socialRouter = Router();

socialRouter.use("/workspaces", workspaceRouter);
socialRouter.use("/ws", accountsRouter);
socialRouter.use("/ws", postsRouter);
socialRouter.use("/ws", mediaRouter);
socialRouter.use("/ws", analyticsRouter);
socialRouter.use("/ws", auditRouter);
