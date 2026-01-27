async function ensureEmbeddingForProduct(product) {
  if (!product) return

  if (Array.isArray(product.embedding) && product.embedding.length > 0) {
    return
  }

  try {
    const embedding = await generateEmbedding(
      `${product.name || ""} ${product.category || ""} ${product.description || ""}`
    )

    if (!Array.isArray(embedding)) return

    product.embedding = embedding
    await product.save()

  } catch (error) {
    console.log("Embedding generation skipped:", error.message)
  }
}
