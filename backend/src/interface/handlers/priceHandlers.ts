import type { Response } from "express";

import { getPrice } from "@/application/usecases/getPrice.js";

export async function getPriceHandler(res: Response) {
  try {
    res.json(await getPrice());
  } catch {
    res.status(503).json({ error: "Price data unavailable" });
  }
}
