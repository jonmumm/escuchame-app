import { p as products } from './_id_.ts.f0c01515.mjs';

function get() {
  return {
    body: JSON.stringify(products)
  };
}

export { get };
