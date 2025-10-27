import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import {
  Button,
  TextField,
  Card,
  Page,
  Layout,
  ResourceItem,
  ResourceList,
  Thumbnail,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function DiscountCreator() {
  const fetcher = useFetcher();
  const app = useAppBridge();

  const [title, setTitle] = useState("Product Discount");
  const [percentage, setPercentage] = useState(15);
  const [products, setProducts] = useState([]);

  const [tiers, setTiers] = useState([
    { minQty: 2, discount: 10 },
    { minQty: 4, discount: 20 },
  ]);

  
  const handleAddTier = () => {
    setTiers((prev) => [...prev, { minQty: 0, discount: 0 }]);
  };
  
  const handleRemoveTier = (index) => {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleTierChange = (index, field, value) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };
  

  const handleProductSelect = async () => {
    try {
      const result = await app.resourcePicker({
        type: "product",
        multiple: true,
      });

      if (result && result.length > 0) {
        setProducts(result);
      }
    } catch (err) {
      console.error("Product picker cancelled or failed:", err);
    }
  };

  const handleSubmit = () => {
    if (!products.length) return alert("Select at least one product first!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("percentage", percentage.toString());
    formData.append("productIds", JSON.stringify(products.map((p) => p.id)));

    fetcher.submit(formData, {
      method: "post",
      action: "/api/discounts/create",
    });
  };

  const handleRemoveProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTieredSubmit = () => {
    if (!products.length) return alert("Select at least one product first!");
  
    const formData = new FormData();
    formData.append("title", `${title} (Tiered)`);
    formData.append("productIds", JSON.stringify(products.map((p) => p.id)));
    formData.append("tiers", JSON.stringify(tiers));
  
    fetcher.submit(formData, {
      method: "post",
      action: "/api/discounts/tiered",
    });
  };
  

  return (
    <Page title="Create Discount">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ marginBottom: "1rem" }}>
              <Button onClick={handleProductSelect}>
                {products.length
                  ? `Selected: ${products.length} product${
                      products.length > 1 ? "s" : ""
                    }`
                  : "Select Products"}
              </Button>
            </div>

            {products.length > 0 && (
              <Card>
                <ResourceList
                  resourceName={{ singular: "product", plural: "products" }}
                  items={products}
                  renderItem={(item) => {
                    const { id, title, images } = item;
                    const media = (
                      <Thumbnail
                        source={images?.[0]?.originalSrc || ""}
                        alt={title}
                      />
                    );

                    return (
                      <ResourceItem id={id} media={media} accessibilityLabel={title}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <p>{title}</p>
                          <Button plain destructive onClick={() => handleRemoveProduct(id)}>
                            Remove
                          </Button>
                        </div>
                      </ResourceItem>
                    );
                  }}
                />
              </Card>
            )}

            <TextField
              label="Title"
              value={title}
              onChange={setTitle}
              autoComplete="off"
            />

            <TextField
              label="Discount %"
              type="number"
              value={percentage}
              onChange={(v) => setPercentage(Number(v))}
              autoComplete="off"
            />

<div style={{ marginTop: "1rem" }}>
  <h2 style={{ fontWeight: 600 }}>Tiered Discounts</h2>
  {tiers.map((tier, i) => (
    <div key={i} style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
      <input
        type="number"
        min="1"
        placeholder="Min Qty"
        value={tier.minQty}
        onChange={(e) => handleTierChange(i, "minQty", Number(e.target.value))}
        style={{ width: "100px" }}
      />
      <input
        type="number"
        min="1"
        max="100"
        placeholder="% Discount"
        value={tier.discount}
        onChange={(e) =>
          handleTierChange(i, "discount", Number(e.target.value))
        }
        style={{ width: "120px" }}
      />
      <button onClick={() => handleRemoveTier(i)}>✕</button>
    </div>
  ))}
  <button onClick={handleAddTier} style={{ marginTop: "0.5rem" }}>
    + Add Tier
  </button>
</div>


            <div style={{ marginTop: "1rem" }}>
              <Button
                primary
                onClick={handleSubmit}
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting"
                  ? "Creating..."
                  : "Create Discount"}
              </Button>

              <Button onClick={handleTieredSubmit}>Create Tiered Discount</Button>

            </div>

            

            {fetcher.data && (
              <pre
                style={{
                  background: "#f6f6f7",
                  marginTop: 20,
                  padding: 10,
                  borderRadius: 6,
                }}
              >
                {JSON.stringify(fetcher.data, null, 2)}
              </pre>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
