function post({ cookies, params, request }) {
  cookies.set("user-id", "1", {
    path: "/",
    maxAge: 2592e3
  });
  return new Response(null, {
    status: 301,
    headers: {
      Location: "/"
    }
  });
}

export { post };
