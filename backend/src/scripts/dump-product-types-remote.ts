// Dump product types (id, value, metadata) for inspection

const BACKEND_URL = process.env.BACKEND_URL || "https://backend-production-c68b.up.railway.app"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@yourmail.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bnmugz7hs4gsk65l0566eos2s4kxmeho"

async function main() {
  const login = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!login.ok) {
    console.error("Login failed:", login.status, await login.text())
    process.exit(1)
  }
  const { token } = await login.json() as any

  const res = await fetch(`${BACKEND_URL}/admin/product-types`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    console.error("List failed:", res.status, await res.text())
    process.exit(1)
  }
  const json = await res.json() as any
  const types: any[] = json.product_types || []
  const keys = ["White Lab Diamonds", "Fancy Color Lab Diamonds"]
  for (const k of keys) {
    const t = types.find((p) => p.value === k)
    console.log(`\n=== ${k} ===`)
    if (!t) { console.log("Not found"); continue }
    console.log(JSON.stringify({ id: t.id, value: t.value, metadata: t.metadata }, null, 2))
  }
}

main().catch((e) => { console.error(e); process.exit(1) })


