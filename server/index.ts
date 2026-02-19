import express from "express";
import cors from "cors";
import { runMigrations } from "./db";
import { seedIfEmpty } from "./seed";
import { router } from "./routes";

runMigrations();
seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);

const port = Number(process.env.PORT || 5000);
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on 0.0.0.0:${port}`);
});
