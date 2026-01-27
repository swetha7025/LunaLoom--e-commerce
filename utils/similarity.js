function cosineSimilarity(a, b) {
  if (!a.length || !b.length) return 0

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))

  return dot / (magA * magB)
}

module.exports = cosineSimilarity
