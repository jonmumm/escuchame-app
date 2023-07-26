import { c as createAstro, a as createComponent, r as renderTemplate, b as renderHead } from '../astro.32479da3.mjs';
import 'html-escaper';
import { g as getProducts } from './index.astro.300708e4.mjs';
/* empty css                           *//* empty css                            */import 'path-to-regexp';
import 'cookie';
import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import 'node:fs';
import 'node:http';
import 'node:tls';
import 'mime';
import 'string-width';
/* empty css                           */
const $$Astro = createAstro();
const $$Listen = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Listen;
  await getProducts(Astro2.request);
  return renderTemplate`<html lang="en" class="astro-6GLP6CFO">
  <head>
    <title>Listen</title>
    
  ${renderHead()}</head>
  <body class="astro-6GLP6CFO">
    <h2 class="product-listing-title astro-6GLP6CFO" slot="title">Listen</h2>
  </body></html>`;
}, "/Users/jonathanmumm/src/escuchame.app/src/pages/listen.astro", void 0);

const $$file = "/Users/jonathanmumm/src/escuchame.app/src/pages/listen.astro";
const $$url = "/listen";

export { $$Listen as default, $$file as file, $$url as url };
