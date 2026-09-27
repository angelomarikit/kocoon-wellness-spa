/**
 * Convert logo JPG (black square backdrop) into a transparent PNG.
 * Flood-fills near-black pixels connected to the image edges so the
 * circular emblem's intentional black fill is preserved.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = path.join(root, 'public', 'logo-source.jpg')
const outputPng = path.join(root, 'public', 'logo.png')
const outputJpgFallback = path.join(root, 'public', 'logo.jpg')

if (!fs.existsSync(input)) {
  throw new Error(`Missing source logo at ${input}`)
}

const THRESHOLD = 28 // near-black tolerance for backdrop removal

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const pixels = Buffer.from(data)
const visited = new Uint8Array(width * height)
const queue = []

function idx(x, y) {
  return (y * width + x) * channels
}

function isNearBlack(i) {
  return pixels[i] <= THRESHOLD && pixels[i + 1] <= THRESHOLD && pixels[i + 2] <= THRESHOLD
}

function enqueue(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const p = y * width + x
  if (visited[p]) return
  const i = p * channels
  if (!isNearBlack(i)) return
  visited[p] = 1
  queue.push(p)
}

// Seed from all edge pixels
for (let x = 0; x < width; x++) {
  enqueue(x, 0)
  enqueue(x, height - 1)
}
for (let y = 0; y < height; y++) {
  enqueue(0, y)
  enqueue(width - 1, y)
}

while (queue.length) {
  const p = queue.pop()
  const x = p % width
  const y = (p / width) | 0
  const i = p * channels
  pixels[i + 3] = 0 // transparent

  enqueue(x + 1, y)
  enqueue(x - 1, y)
  enqueue(x, y + 1)
  enqueue(x, y - 1)
}

// Soften fringe: lightly fade remaining near-black border pixels adjacent to transparency
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const p = y * width + x
    const i = p * channels
    if (pixels[i + 3] === 0) continue
    if (!isNearBlack(i)) continue
    let touchingClear = false
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const ni = ((y + dy) * width + (x + dx)) * channels
      if (pixels[ni + 3] === 0) {
        touchingClear = true
        break
      }
    }
    if (touchingClear) pixels[i + 3] = 0
  }
}

await sharp(pixels, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(outputPng)

// Keep jpg only as opaque archive; primary asset is PNG
fs.copyFileSync(input, outputJpgFallback)

console.log(`Wrote transparent logo: ${outputPng}`)
console.log(`Source dims: ${width}x${height}`)
