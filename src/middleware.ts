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
    if (!sessionToken) {
      const userId = crypto.randomUUID();
      const sessionId = crypto.randomUUID();

      await db.insert(users).values({ id: userId });
      await db.insert(sessions).values({
        id: sessionId,
        userId: userId,
      });

      sessionToken = jwt.sign(
        {
          userId,
        },
        privateKey,
        {
          subject: sessionId,
        },
      );

      cookies.set("sessionToken", sessionToken);
    }

    const parsed = jwt.verify(sessionToken, privateKey);
    const sessionId = parsed.sub as string | undefined;
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
