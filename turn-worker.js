// Cloudflare Worker: يطلّع بيانات دخول TURN مؤقتة (24 ساعة) من Cloudflare Realtime TURN.
// المتغيرات (Settings > Variables and Secrets):
//   TURN_KEY_ID     = معرّف الـ TURN key
//   TURN_API_TOKEN  = الـ API token (اعمله Secret)
//   ALLOW_ORIGIN    = (اختياري) دومين موقعك، مثال: https://yourname.github.io
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (env.ALLOW_ORIGIN && origin && origin !== env.ALLOW_ORIGIN)
      return new Response('{"error":"forbidden"}', { status: 403, headers: cors });

    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.TURN_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: 86400 }),
      }
    );
    if (!r.ok) return new Response(JSON.stringify({ error: r.status }), { status: 502, headers: cors });
    return new Response(await r.text(), { headers: cors });
  },
};
