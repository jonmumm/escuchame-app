import type { MiddlewareResponseHandler } from "astro";
import { defineMiddleware, sequence } from "astro/middleware";
import crypto from "crypto";
import * as JWT from "jsonwebtoken";
import db from "./db";
import { users } from "./schema";
import { assertNotNull } from "./utils";

const privateKey = "my_private_key";

const sessionMiddleware: MiddlewareResponseHandler = defineMiddleware(
  async ({ locals, cookies }, next) => {
    let sessionToken = cookies.get("sessionToken").value;
    if (!sessionToken) {
      const userId = crypto.randomUUID();

      await db.insert(users).values({ id: userId });

      sessionToken = JWT.sign({}, privateKey, {
        subject: userId,
      });
      cookies.set("sessionToken", sessionToken);
    }

    const parsed = JWT.verify(sessionToken, privateKey);
    const userId = parsed.sub as string | undefined;
    assertNotNull(userId);
    locals.userId = userId;

    return next();
  }
);

// Export the middleware using sequence
export const onRequest = sequence(sessionMiddleware);
