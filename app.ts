import express, { Application } from "express";
import getTimeSlotsController from "./routes/getTimeSlots";

const app: Application = express();

app.use(express.json());
app.use("/", getTimeSlotsController);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
