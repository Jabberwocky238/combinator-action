import * as core from '@actions/core';
import crypto from 'crypto';

async function run() {
  try {
    // 1. 获取输入参数
    const secretKey = core.getInput('secret-key', { required: true });
    const workerId = core.getInput('worker-id', { required: true });
    const userId = core.getInput('user-id', { required: true });
    const image = core.getInput('image', { required: true }).toLowerCase();
    const port = core.getInput('port', { required: true });

    // 2. 构建请求体
    const body = JSON.stringify({
      worker_id: workerId,
      owner_id: userId,
      image: image,
      port: parseInt(port, 10)
    });

    // 3. 生成 HMAC-SHA256 签名
    const timestamp = Date.now().toString();
    const payload = body + timestamp;
    const signature = crypto.createHmac('sha256', secretKey)
      .update(payload)
      .digest('base64url');

    // 4. 发起 HTTPS 请求
    const response = await fetch('https://console.app238.com/api/worker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Combinator-Signature': signature,
        'X-Combinator-User-ID': userId,
        'X-Combinator-Timestamp': timestamp
      },
      body: body
    });

    const result = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result}`);
    }

    console.log('部署成功:', result);
    core.setOutput('response', result);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();