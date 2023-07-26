import { c as createAstro, a as createComponent, r as renderTemplate, b as renderHead } from '../astro.32479da3.mjs';
import 'html-escaper';
/* empty css                           *//* empty css                           */
function getOrigin(request) {
  return new URL(request.url).origin.replace("localhost", "127.0.0.1");
}
async function get(incomingReq, endpoint, cb) {
  const response = await fetch(`${getOrigin(incomingReq)}${endpoint}`, {
    credentials: "same-origin",
    headers: incomingReq.headers
  });
  if (!response.ok) {
    return null;
  }
  return cb(response);
}
async function getProducts(incomingReq) {
  return get(incomingReq, "/api/products", async (response) => {
    const products = await response.json();
    return products;
  });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  await getProducts(Astro2.request);
  return renderTemplate`<html lang="en" class="astro-J7PV25F6">
  <head>
    <title>Online Store</title>
    
  ${renderHead()}</head>
  <body class="astro-J7PV25F6">
    <h2 class="product-listing-title astro-J7PV25F6" slot="title">Product Listing</h2>
  </body></html>`;
}, "/Users/jonathanmumm/src/escuchame.app/src/pages/index.astro", void 0);

const $$file = "/Users/jonathanmumm/src/escuchame.app/src/pages/index.astro";
const $$url = "";

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { getProducts as g, index as i };
