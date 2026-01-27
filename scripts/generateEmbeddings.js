require("dotenv").config()
const mongoose = require("mongoose")
const productModel = require("../models/products")
const { generateEmbedding } = require("../utils/embedding")


async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected")

    const products = await productModel.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    })

    console.log(`Found ${products.length} products without embeddings`)

    for (const product of products) {
     const text = `
  Category: ${product.category}
  Brand: ${product.brand}
  Fabrics: ${product.fabrics?.join(", ") || ""}
  Description: ${product.description}
`

product.embedding = await generateEmbedding(text)
await product.save()

      console.log(`Embedding saved for: ${product.name}`)
    }

    console.log("Embedding generation completed")
    process.exit()
  } catch (err) {
    console.error("Embedding generation failed", err)
    process.exit(1)
  }
}

run()
