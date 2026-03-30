import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { serviceCall } from "../utils/httpClient";
import { asyncHandler } from "../utils/asyncHandler";
import { setAuthCookie, clearAuthCookie } from "../auth/jwt";

const router = Router();

// POST /api/v1/auth/otp/send
router.post("/otp/send", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.IDENTITY_SERVICE_URL}/v1/otp/send`, {
    data: req.body,
  });
  res.json(result);
}));

// POST /api/v1/auth/otp/verify
router.post("/otp/verify", asyncHandler(async (req: Request, res: Response) => {
  const result = await serviceCall<any>("post", `${env.IDENTITY_SERVICE_URL}/v1/otp/verify`, {
    data: req.body,
  });

  // Set JWT as HttpOnly cookie
  if (result.token) {
    setAuthCookie(res, result.token);
    // Don't send token in response body — cookie only
    const { token, ...rest } = result;
    res.json(rest);
  } else {
    res.json(result);
  }
}));

// POST /api/v1/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

export { router as authRoutes };
