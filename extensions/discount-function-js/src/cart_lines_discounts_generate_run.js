import { ProductDiscountSelectionStrategy } from "../generated/api";

/**
 * @param {import("../generated/api").RunInput} input
 * @returns {import("../generated/api").CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  console.log("=== Discount Function Debug ===", JSON.stringify(input));
  
  let config = {};
  try {
    config = JSON.parse(input.discount?.metafield?.value || "{}");
  } catch (err) {
    console.error("⚠️ Invalid config metafield:", err);
  }

  const percentage = config.percentage || 0;
  const productIds = config.productIds || [];

  console.error("=== Discount Function Debug ===");
  console.error("Configured productIds:", productIds);
  console.error("Cart products:", input.cart.lines.map(l => l.merchandise?.product?.id));
  console.error("Percentage:", percentage);

  if (!percentage || productIds.length === 0) {
    console.error("⚠️ Missing configuration — skip");
    return { operations: [] };
  }

  const targets = input.cart.lines
    .filter(line => productIds.includes(line.merchandise.product.id))
    .map(line => ({ cartLine: { id: line.id } }));

  if (targets.length === 0) {
    console.error("⚠️ No matching products in cart");
    return { operations: [] };
  }

  console.error("✅ Applying", percentage, "% discount to", targets.length, "lines");

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [
            {
              message: `${percentage}% OFF`,
              targets,
              value: { percentage: { value: percentage } },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
