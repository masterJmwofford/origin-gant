const counterName = 'site_views'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

async function ensureCounter(database) {
  await database
    .prepare(
      'CREATE TABLE IF NOT EXISTS counters (name TEXT PRIMARY KEY, value INTEGER NOT NULL)',
    )
    .run()

  await database
    .prepare('INSERT OR IGNORE INTO counters (name, value) VALUES (?, ?)')
    .bind(counterName, 0)
    .run()
}

async function readViews(database) {
  const row = await database
    .prepare('SELECT value FROM counters WHERE name = ?')
    .bind(counterName)
    .first()

  return typeof row?.value === 'number' ? row.value : 0
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ error: 'Missing D1 binding named DB' }, 500)
  }

  await ensureCounter(env.DB)
  return json({ views: await readViews(env.DB) })
}

export async function onRequestPost({ env }) {
  if (!env.DB) {
    return json({ error: 'Missing D1 binding named DB' }, 500)
  }

  await ensureCounter(env.DB)

  await env.DB
    .prepare('UPDATE counters SET value = value + 1 WHERE name = ?')
    .bind(counterName)
    .run()

  return json({ views: await readViews(env.DB) })
}
