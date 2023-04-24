import express, { Application } from "express";
import { getTimeSlotsController } from "./controller";

const app: Application = express();

app.use(express.json());

app.post("/getTimeSlots", getTimeSlotsController);

const port = 3000; // 포트 번호
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
