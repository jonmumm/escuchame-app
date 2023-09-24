import type { MiddlewareResponseHandler } from "astro";
import { defineMiddleware, sequence } from "astro/middleware";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import db from "./db";
import { sessions, users } from "./schema";
import { assert, assertNotNull } from "./utils";

const privateKey = "my_private_key";

const sessionMiddleware: MiddlewareResponseHandler = defineMiddleware(
  async ({ locals, cookies }, next) => {
    let sessionToken = cookies.get("sessionToken")?.value;
    let refreshToken = cookies.get("refreshToken")?.value;
    let sessionId: string;

    const oneYearFromNow = new Date();
    oneYearFromNow.setDate(oneYearFromNow.getFullYear() + 1); // Set date to 1 years from now

    // If no refreshToken is present we've never seen this user
    // create a new user and session.
    if (!refreshToken) {
      const userId = crypto.randomUUID();
      sessionId = crypto.randomUUID();

      await db.insert(users).values({ id: userId });
      await db.insert(sessions).values({
        id: sessionId,
        userId: userId,
      });

      refreshToken = jwt.sign({}, privateKey, {
        expiresIn: "90d", // 90 days
        subject: userId,
      });
      cookies.set("refreshToken", refreshToken, {
        expires: oneYearFromNow,
        path: "/",
      });
    } else if (sessionToken) {
      // if we already have a refresh token
      sessionId = jwt.verify(sessionToken, privateKey).sub as string;
    } else {
      // If refreshToken but no sessionToken, just make a new sessionId
      // this shouldn't happen unless user deletes one cookie but not other
      sessionId = crypto.randomUUID();
    }

    const { sub: userId } = jwt.verify(refreshToken, privateKey);

    sessionToken = jwt.sign(
      {
        userId,
      },
      privateKey,
      {
        subject: sessionId,
        expiresIn: "1h",
      },
    );

    cookies.set("sessionToken", sessionToken, {
      expires: oneYearFromNow,
      path: "/",
    });

    const parsed = jwt.verify(sessionToken, privateKey);
    // const sessionId = parsed.sub as string | undefined;
    assertNotNull(sessionId);
    assert(
      typeof parsed === "object" && "userId" in parsed,
      "expeced userId in sessionToken",
    );

    locals.userId = parsed.userId;
    locals.sessionId = sessionId;

    return next();
  },
);

// Export the middleware using sequence
export const onRequest = sequence(sessionMiddleware);
