import { ProductDiscountSelectionStrategy } from "../generated/api";

/**
 * @param {import("../generated/api").RunInput} input
 * @returns {import("../generated/api").CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  console.log("===  Discount Function Debug Start ===");

  try {
    console.log(" Full input snapshot:", JSON.stringify(input, null, 2));
  } catch {
    console.log(" Could not stringify input");
  }

  let config = {};
  try {
    config = JSON.parse(input.discount?.metafield?.value || "{}");
  } catch (err) {
    console.error("⚠️ Invalid config metafield:", err);
  }

  console.log("⚙️ Parsed Config:", JSON.stringify(config, null, 2));

  const percentage = config.percentage || 0;
  const productIds = config.productIds || [];

  // -----------------------------------------------------------
  //  TIERED DISCOUNT LOGIC
  // -----------------------------------------------------------
  if (config.type === "TIERED") {
    const tiers = config.tiers || [];
  
    console.log("📊 Available Tiers:", JSON.stringify(tiers));
    console.log("🎯 Eligible Product IDs:", JSON.stringify(config.productIds));
  
    const eligibleLines = input.cart.lines.filter((l) =>
      (config.productIds || []).includes(l.merchandise.product.id)
    );
  
    console.log(
      "🛒 All Cart Lines:",
      input.cart.lines.map((l) => ({
        id: l.id,
        productId: l.merchandise.product.id,
        variantId: l.merchandise.id,
        qty: l.quantity,
      }))
    );
  
    if (!eligibleLines.length) {
      console.error("⚠️ No matching lines for tiered discount");
      return { operations: [] };
    }
  
    const productQtyMap = {};
    for (const line of eligibleLines) {
      const pid = line.merchandise.product.id;
      productQtyMap[pid] = (productQtyMap[pid] || 0) + (line.quantity || 1);
    }
  
    console.log("📦 Product Quantity Map:", JSON.stringify(productQtyMap, null, 2));
  
    const totalQty = Object.values(productQtyMap).reduce((a, b) => a + b, 0);
    console.log("🔢 Total eligible quantity:", totalQty);
  
    const applicableTier = tiers
      .filter((t) => totalQty >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];
  
    console.log("🎯 Applicable Tier:", applicableTier || "none");
  
    if (!applicableTier) {
      console.error("⚠️ No applicable tier for qty", totalQty);
      return { operations: [] };
    }
  
    const targets = eligibleLines.map((line) => ({ cartLine: { id: line.id } }));
  
    console.error(
      `✅ Applying ${applicableTier.discount}% tiered discount on ${targets.length} lines (totalQty=${totalQty})`
    );
  
    return {
      operations: [
        {
          productDiscountsAdd: {
            candidates: [
              {
                message: `${applicableTier.discount}% off (Tiered discount)`,
                targets,
                value: { percentage: { value: applicableTier.discount } },
              },
            ],
            selectionStrategy: ProductDiscountSelectionStrategy.All,
          },
        },
      ],
    };
  }
  

  // -----------------------------------------------------------
  //  VOLUME DISCOUNT LOGIC
  // -----------------------------------------------------------
  if (config.type === "VOLUME") {
    const tiers = config.tiers || [];
    const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);
    const applicable = tiers
      .filter((t) => subtotal >= t.minAmount)
      .sort((a, b) => b.minAmount - a.minAmount)[0];

    console.log("💰 Subtotal:", subtotal);
    console.log("🎯 Applicable volume tier:", applicable || "none");

    if (!applicable) return { operations: [] };

    const targets = input.cart.lines.map((l) => ({ cartLine: { id: l.id } }));

    return {
      operations: [
        {
          productDiscountsAdd: {
            candidates: [
              {
                message: `${applicable.discount}% off over ${applicable.minAmount}`,
                targets,
                value: { percentage: { value: applicable.discount } },
              },
            ],
            selectionStrategy: ProductDiscountSelectionStrategy.All,
          },
        },
      ],
    };
  }

  // -----------------------------------------------------------
  //  SIMPLE DISCOUNT LOGIC (fallback)
  // -----------------------------------------------------------
  if (!config.type) {
    const targets = input.cart.lines
      .filter((line) => productIds.includes(line.merchandise.product.id))
      .map((line) => ({ cartLine: { id: line.id } }));

    if (!targets.length || !percentage) {
      console.error("⚠️ Missing configuration — skip");
      return { operations: [] };
    }

    console.error(
      `✅ Applying ${percentage}% simple discount to ${targets.length} lines`
    );

    return {
      operations: [
        {
          productDiscountsAdd: {
            candidates: [
              {
                message: `${percentage}% off (Simple discount)`,
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
}
