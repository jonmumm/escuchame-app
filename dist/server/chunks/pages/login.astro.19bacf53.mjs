import { c as createAstro, a as createComponent, r as renderTemplate, b as renderHead } from '../astro.32479da3.mjs';
import 'html-escaper';
/* empty css                           */import 'path-to-regexp';
import 'cookie';
import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import 'node:fs';
import 'node:http';
import 'node:tls';
import 'mime';
import 'string-width';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="astro-SGPQYURT">\n  <head>\n    <title>Online Store</title>\n    \n\n    <script type="module">\n      document.addEventListener("DOMContentLoaded", () => {\n        console.log("loaded");\n        document.querySelector("form").addEventListener("submit", (e) => {\n          e.preventDefault();\n          const form = e.target;\n          const formData = new FormData(form);\n          const data = Object.fromEntries(formData);\n\n          fetch("/login.form.async", {\n            method: "POST",\n            body: JSON.stringify(data),\n          })\n            .then((res) => res.json())\n            .then((data) => {\n              document.querySelector("#result").innerHTML =\n                "Progressive login was successful! you will be redirected to the store in 3 seconds";\n              setTimeout(() => (location.href = "/"), 3000);\n            });\n        });\n      });\n    <\/script>\n  ', '</head>\n  <body class="astro-SGPQYURT">\n    <h1 class="astro-SGPQYURT">Login</h1>\n    <form action="/login.form" method="POST" class="astro-SGPQYURT">\n      <label for="name" class="astro-SGPQYURT">Name</label>\n      <input type="text" name="name" class="astro-SGPQYURT">\n\n      <label for="password" class="astro-SGPQYURT">Password</label>\n      <input type="password" name="password" class="astro-SGPQYURT">\n\n      <input type="submit" value="Submit" class="astro-SGPQYURT">\n    </form>\n    <!-- <Container tag="main">\n			<h1>Login</h1>\n			<form action="/login.form" method="POST">\n				<label for="name">Name</label>\n				<input type="text" name="name" />\n\n				<label for="password">Password</label>\n				<input type="password" name="password" />\n\n				<input type="submit" value="Submit" />\n			</form>\n			<div id="result"></div>\n		</Container> -->\n  </body></html>'])), renderHead());
}, "/Users/jonathanmumm/src/escuchame.app/src/pages/login.astro", void 0);

const $$file = "/Users/jonathanmumm/src/escuchame.app/src/pages/login.astro";
const $$url = "/login";

export { $$Login as default, $$file as file, $$url as url };
