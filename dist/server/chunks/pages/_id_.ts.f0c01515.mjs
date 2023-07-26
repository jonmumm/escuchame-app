const products$1 = [
	{
		id: 1,
		name: "Cereal",
		price: 3.99,
		image: "/images/products/cereal.jpg"
	},
	{
		id: 2,
		name: "Yogurt",
		price: 3.97,
		image: "/images/products/yogurt.jpg"
	},
	{
		id: 3,
		name: "Rolled Oats",
		price: 2.89,
		image: "/images/products/oats.jpg"
	},
	{
		id: 4,
		name: "Muffins",
		price: 4.39,
		image: "/images/products/muffins.jpg"
	}
];
const db = {
	products: products$1
};

const products = db.products;
const productMap = new Map(products.map((product) => [product.id, product]));

function get({ params }) {
  const id = Number(params.id);
  if (productMap.has(id)) {
    const product = productMap.get(id);
    return {
      body: JSON.stringify(product)
    };
  } else {
    return new Response(null, {
      status: 400,
      statusText: "Not found"
    });
  }
}

const _id_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  get
}, Symbol.toStringTag, { value: 'Module' }));

export { _id_ as _, products as p };
