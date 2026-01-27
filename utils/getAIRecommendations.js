const productModel = require("../models/products")

async function getAIRecommendations(product) {

  // ✅ PLACE YOUR CHECK HERE
  if (
    !product.embedding ||
    !Array.isArray(product.embedding) ||
    product.embedding.length === 0
  ) {
    console.log("Embedding missing, skipping AI similarity")
    return []
  }

  // Fetch same-category products
  const candidates = await productModel.find({
    _id: { $ne: product._id },
    category: product.category,
    embedding: { $exists: true }
  }).lean()

  // Filter products that REALLY have embeddings
  const validProducts = candidates.filter(
    p => Array.isArray(p.embedding) && p.embedding.length > 0
  )

  // Calculate similarity
  const scored = validProducts.map(p => ({
    product: p,
    score: cosineSimilarity(product.embedding, p.embedding)
  }))

  // Sort by similarity
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 4).map(s => s.product)
}

module.exports = getAIRecommendations
