const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

function sendZeptoMail(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.zeptomail.com',
      path: '/v1.1/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Zoho-enczapikey ' + process.env.ZEPTOMAIL_API_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(data));
        else reject(new Error(`ZeptoMail ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

app.post('/api/submit-assessment', async (req, res) => {
  const { firstName, lastName, firmName, email, phone, revenue } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sendZeptoMail({
      from: { address: 'noreply@yegamedia.com', name: 'YEGA Assessment' },
      to: [{ email_address: { address: 'dapotejuoso@gmail.com', name: 'Dapo' } }],
      subject: `New Assessment Request — ${firstName} ${lastName} (${firmName || 'Unknown Firm'})`,
      htmlbody: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#E5E5E5;padding:32px;border-radius:8px;">
          <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #2A2A2A;">
            <h2 style="color:#00D9D9;margin:0 0 4px;">New Assessment Request</h2>
            <p style="margin:0;color:#999;font-size:14px;">Submitted via accountant-assessment-landing.html</p>
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
      `
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('ZeptoMail error:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`YEGA backend running on port ${PORT}`);
});
