import { Router } from "express";
import { workspaceRouter } from "./workspace";
import { accountsRouter } from "./accounts";
import { postsRouter } from "./posts";
import { mediaRouter } from "./media";
import { analyticsRouter } from "./analytics";
import { auditRouter } from "./audit";
import { metaOAuthRouter } from "./meta-oauth";
import { linkedinOAuthRouter } from "./linkedin-oauth";

export const socialRouter = Router();

socialRouter.use(metaOAuthRouter);
socialRouter.use(linkedinOAuthRouter);
socialRouter.use("/workspaces", workspaceRouter);
socialRouter.use("/ws", accountsRouter);
socialRouter.use("/ws", postsRouter);
socialRouter.use("/ws", mediaRouter);
socialRouter.use("/ws", analyticsRouter);
socialRouter.use("/ws", auditRouter);
