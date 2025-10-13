import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";


export const loader = () => {
  throw new Response("Not Found", { status: 404 });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const title = form.get("title") || "Product Discount";
  const percentage = Number(form.get("percentage") || 15);
  const productId = form.get("productId");

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
  }`;
  

  const variables = {
    automaticAppDiscount: {
      title,
      startsAt: new Date().toISOString(),
      combinesWith: { orderDiscounts: true, productDiscounts: true },
      functionId: "0199c43b-d785-7df0-88e2-933692e4a623",
      discountClasses: ["PRODUCT"], 
      metafields: [
        {
          namespace: "$app:product-discount",
          key: "configuration",
          type: "json",
          value: JSON.stringify({
            percentage,
            productIds: [productId],
          }),
        },
      ],
    },
  };

  const response = await admin.graphql(mutation, { variables });
  const data = await response.json();
  return json(data);
};
