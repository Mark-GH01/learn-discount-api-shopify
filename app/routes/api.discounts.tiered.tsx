import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = () => {
  throw new Response("Not Found", { status: 404 });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const title = form.get("title") || "Tiered Discount";
  const productIds = JSON.parse(form.get("productIds") || "[]");


  const tiers = JSON.parse(
    form.get("tiers") ||
      JSON.stringify([
        { minQty: 2, discount: 10 },
        { minQty: 4, discount: 20 },
        { minQty: 6, discount: 30 },
      ])
  );

  const mutation = `#graphql
    mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
        automaticAppDiscount {
          title
          startsAt
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = {
    automaticAppDiscount: {
      title,
      startsAt: new Date().toISOString(),
      combinesWith: { orderDiscounts: true, productDiscounts: true },
      functionHandle: "discount-function-js",
      discountClasses: ["PRODUCT"],
      metafields: [
        {
          namespace: "$app:product-discount",
          key: "configuration",
          type: "json",
          value: JSON.stringify({
            type: "TIERED",
            tiers,
            productIds,
          }),
        },
      ],
    },
  };

  const response = await admin.graphql(mutation, { variables });
  const data = await response.json();
  return json(data);
};
