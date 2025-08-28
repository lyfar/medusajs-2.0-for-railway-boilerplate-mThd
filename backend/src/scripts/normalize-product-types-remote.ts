// Normalize product type metadata for White and Fancy diamond types (remote)
// - Renames keys to consistent schema (color->color_grade, cut->cut_grade, *_mm)
// - Unifies options lists across both types

const BACKEND_URL = process.env.BACKEND_URL || "https://backend-production-c68b.up.railway.app"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@yourmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bnmugz7hs4gsk65l0566eos2s4kxmeho"

type Meta = Record<string, any>

async function login() {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const j = await res.json() as any
  return j.token as string
}

async function getTypes(token: string) {
  const res = await fetch(`${BACKEND_URL}/admin/product-types`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`List types failed: ${res.status} ${await res.text()}`)
  const j = await res.json() as any
  return (j.product_types || []) as any[]
}

async function updateType(token: string, id: string, metadata: Meta) {
  // Try POST (observed supported on this backend)
  let res = await fetch(`${BACKEND_URL}/admin/product-types/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ metadata }),
  })
  if (!res.ok) {
    // Fallback to PATCH
    res = await fetch(`${BACKEND_URL}/admin/product-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ metadata }),
    })
  }
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`)
  return res.json()
}

function normalizeWhite(meta: Meta): Meta {
  const out: Meta = { ...(meta || {}) }
  // Rename keys
  if (out.color && !out.color_grade) { out.color_grade = { ...out.color, label: out.color.label || "Color Grade" }; delete out.color }
  if (out.cut && !out.cut_grade) { out.cut_grade = { ...out.cut, label: out.cut.label || "Cut Grade" }; delete out.cut }
  if (out.length && !out.length_mm) { out.length_mm = { ...out.length, label: out.length.label || "Length (mm)" }; delete out.length }
  if (out.width && !out.width_mm) { out.width_mm = { ...out.width, label: out.width.label || "Width (mm)" }; delete out.width }
  if (out.depth && !out.depth_mm) { out.depth_mm = { ...out.depth, label: out.depth.label || "Depth (mm)" }; delete out.depth }

  // Unify options
  out.shape = unifyShape(out.shape)
  out.clarity = unifyClarity(out.clarity)
  out.cut_grade = unifyCut(out.cut_grade)
  out.lab_certificate = unifyLabs(out.lab_certificate)
  out.color_grade = unifyWhiteColor(out.color_grade)

  // Ensure removal of non-essential/advanced keys (backend merges metadata)
  return {
    ...out,
    // drop old names
    color: null,
    cut: null,
    length: null,
    width: null,
    depth: null,
    // drop advanced/overcomplicated fields
    length_mm: null,
    width_mm: null,
    depth_mm: null,
    table_percentage: null,
    depth_percentage: null,
    polish: null,
    symmetry: null,
    fluorescence: null,
  }
}

function normalizeFancy(meta: Meta): Meta {
  const out: Meta = { ...(meta || {}) }
  // Ensure expected keys exist
  out.shape = unifyShape(out.shape)
  out.clarity = unifyClarity(out.clarity)
  out.cut_grade = unifyCut(out.cut_grade || out.cut); if (out.cut) delete out.cut
  out.lab_certificate = unifyLabs(out.lab_certificate)
  out.fancy_color = unifyFancyColor(out.fancy_color)
  out.color_intensity = unifyFancyIntensity(out.color_intensity)
  // Measurements
  if (out.length && !out.length_mm) { out.length_mm = { ...out.length, label: out.length.label || "Length (mm)" }; delete out.length }
  if (out.width && !out.width_mm) { out.width_mm = { ...out.width, label: out.width.label || "Width (mm)" }; delete out.width }
  if (out.depth && !out.depth_mm) { out.depth_mm = { ...out.depth, label: out.depth.label || "Depth (mm)" }; delete out.depth }
  return {
    ...out,
    cut: null,
    length: null,
    width: null,
    depth: null,
    length_mm: null,
    width_mm: null,
    depth_mm: null,
    table_percentage: null,
    depth_percentage: null,
    polish: null,
    symmetry: null,
    fluorescence: null,
  }
}

function unifyShape(field?: Meta) { return withOptions(field, ["Round","Oval","Cushion","Princess","Emerald","Asscher","Radiant","Pear","Marquise","Heart"], "select", "Shape") }
function unifyClarity(field?: Meta) { return withOptions(field, ["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2","I1","I2","I3"], "select", "Clarity") }
function unifyCut(field?: Meta) { return withOptions(field, ["Excellent","Very Good","Good","Fair","Poor"], "select", "Cut Grade") }
function unifyLabs(field?: Meta) { return withOptions(field, ["GIA","IGI","GCAL","EGL","AGS","Other"], "select", "Lab Certificate") }
function unifyWhiteColor(field?: Meta) { return withOptions(field, ["D","E","F","G","H","I","J","K","L","M"], "select", "Color Grade") }
function unifyFancyColor(field?: Meta) { return withOptions(field, ["Yellow","Pink","Blue","Green","Orange","Red","Purple","Violet","Gray","Brown","Champagne","Cognac"], "select", "Fancy Color") }
function unifyFancyIntensity(field?: Meta) { return withOptions(field, ["Faint","Very Light","Light","Fancy Light","Fancy","Fancy Dark","Fancy Deep","Fancy Intense","Fancy Vivid"], "select", "Color Intensity") }

function withOptions(field: any, options: string[], type: string, label: string) {
  const f = { ...(field || {}) }
  return { type, label: f.label || label, options }
}

async function main() {
  const token = await login()
  const types = await getTypes(token)
  const white = types.find((t) => t.value === "White Lab Diamonds")
  const fancy = types.find((t) => t.value === "Fancy Color Lab Diamonds")
  if (!white || !fancy) throw new Error("Required types not found")

  console.log("Normalizing White Lab Diamonds…")
  await updateType(token, white.id, normalizeWhite(white.metadata || {}))
  console.log("Normalizing Fancy Color Lab Diamonds…")
  await updateType(token, fancy.id, normalizeFancy(fancy.metadata || {}))
  console.log("✅ Done")
}

main().catch((e) => { console.error("❌ Normalize failed:", e); process.exit(1) })


