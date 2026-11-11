/**
 * Post-build fix for static exports made on Windows.
 *
 * Next.js writes one prefetch file per route segment, named by joining the
 * segment path with dots: `__next.(group).book.__PAGE__.txt`. The exporter
 * only replaces forward slashes, so on Windows (where paths use backslashes)
 * it produces nested folders instead: `__next.(group)/book/__PAGE__.txt`.
 * The browser then asks for the dotted name and gets a 404.
 *
 * This script flattens those folders back into the dotted file names. On
 * Linux and macOS the exporter is already correct and there is nothing to do.
 */
import { readdir, rename, rm } from "node:fs/promises"
import { join, relative, sep } from "node:path"

const OUT_DIR = join(process.cwd(), "out")
const SEGMENT_PREFIX = "__next."

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(path)))
    else files.push(path)
  }
  return files
}

async function flattenSegmentFolders(directory) {
  let fixed = 0
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const path = join(directory, entry.name)

    if (!entry.name.startsWith(SEGMENT_PREFIX)) {
      // `_next` holds the built assets; route folders may hold more segments.
      if (entry.name !== "_next") fixed += await flattenSegmentFolders(path)
      continue
    }

    for (const file of await listFiles(path)) {
      const dottedName = relative(directory, file).split(sep).join(".")
      await rename(file, join(directory, dottedName))
      fixed += 1
    }
    await rm(path, { recursive: true })
  }

  return fixed
}

try {
  const fixed = await flattenSegmentFolders(OUT_DIR)
  if (fixed > 0) {
    console.log(`fix-export-segments: renamed ${fixed} segment file(s) in out/`)
  }
} catch (error) {
  if (error?.code === "ENOENT") {
    console.log("fix-export-segments: no out/ folder, nothing to do")
  } else {
    throw error
  }
}
