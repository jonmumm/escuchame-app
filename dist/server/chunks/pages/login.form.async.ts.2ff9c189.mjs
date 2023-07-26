const post = ({ cookies, params, request }) => {
  cookies.set("user-id", "1", {
    path: "/",
    maxAge: 2592e3
  });
  return {
    body: JSON.stringify({
      ok: true,
      user: 1
    })
  };
};

export { post };
