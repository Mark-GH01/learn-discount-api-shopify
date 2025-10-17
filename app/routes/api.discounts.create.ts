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

  let productIds = [];
  try {
    productIds = JSON.parse(form.get("productIds") || "[]").filter(Boolean);
  } catch {
    productIds = [];
  }

  const mutation = `#graphql
    mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
        automaticAppDiscount {
          title
          startsAt
          appDiscountType {
            title
            functionId
          }
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
      combinesWith: {
        orderDiscounts: true,
        productDiscounts: true,
        shippingDiscounts: false,
      },
      functionHandle: "discount-function-js",
      discountClasses: ["PRODUCT"],
      metafields: [
        {
          namespace: "$app:product-discount",
          key: "configuration",
          type: "json",
          value: JSON.stringify({
            percentage,
            productIds,
          }),
        },
      ],
    },
  };


  const response = await admin.graphql(mutation, { variables });
  const data = await response.json();

  if (data?.data?.discountAutomaticAppCreate?.userErrors?.length) {
    console.error("Discount creation error:", data.data.discountAutomaticAppCreate.userErrors);
  }

  return json(data);
};
