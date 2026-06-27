const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { firstName, lastName, firmName, email, phone, revenue } = body;

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const emailPayload = {
      from: { address: 'noreply@yegamedia.com', name: 'YEGA Assessment' },
      to: [{ email_address: { address: 'dapotejuoso@gmail.com', name: 'Dapo' } }],
      subject: `New Assessment Request — ${firstName} ${lastName} (${firmName || 'Unknown Firm'})`,
      htmlbody: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#E5E5E5;padding:32px;border-radius:8px;">
          <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #2A2A2A;">
            <h2 style="color:#00D9D9;margin:0 0 4px;">New Assessment Request</h2>
            <p style="margin:0;color:#999;font-size:14px;">Submitted via YEGA accountant landing page</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;width:140px;vertical-align:top;">Name</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;font-weight:600;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;vertical-align:top;border-top:1px solid #1A1A1A;">Firm</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;border-top:1px solid #1A1A1A;">${firmName || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;vertical-align:top;border-top:1px solid #1A1A1A;">Email</td>
              <td style="padding:10px 0;font-size:14px;border-top:1px solid #1A1A1A;"><a href="mailto:${email}" style="color:#00D9D9;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;vertical-align:top;border-top:1px solid #1A1A1A;">Phone</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;border-top:1px solid #1A1A1A;">${phone || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#999;font-size:13px;vertical-align:top;border-top:1px solid #1A1A1A;">Annual Revenue</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;border-top:1px solid #1A1A1A;">${revenue || '—'}</td>
            </tr>
          </table>
          <div style="margin-top:28px;padding:16px;background:rgba(0,217,217,0.08);border:1px solid rgba(0,217,217,0.2);border-radius:6px;">
            <p style="margin:0;font-size:13px;color:#00D9D9;">They have been redirected to your Calendly to book a call.</p>
          </div>
        </div>
      `,
    };

    try {
      const zepto = await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': env.ZEPTOMAIL_API_KEY,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!zepto.ok) {
        const err = await zepto.text();
        console.error('ZeptoMail error:', err);
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Worker error:', err.message);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
