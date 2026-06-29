import { Router } from "express";
import { productService } from "../services/productService.ts";

const router = Router();

// Route to check global inventory status
router.get("/status", async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    const summary = products.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      status: p.stock < 10 ? 'LOW' : 'OK'
    }));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory status" });
  }
});

// Route for external system synchronization
router.post("/sync", async (req, res) => {
  const { updates } = req.body; // Array of { productId, newStock }
  try {
    // Logic to sync with external ERP
    res.json({ message: "Inventory synced successfully", received: updates.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync inventory" });
  }
});

export default router;
