import * as core from '@actions/core';
import crypto from 'crypto';

async function run() {
  try {
    // 1. 获取输入参数
    const privateKey = core.getInput('private-key', { required: true });
    const workerId = core.getInput('worker-id', { required: true });
    const userId = core.getInput('user-id', { required: true });
    const image = core.getInput('image', { required: true });
    const port = core.getInput('port', { required: true });

    // 2. 构建请求体
    const body = JSON.stringify({
      worker_id: workerId,
      owner_id: userId,
      image: image,
      port: parseInt(port, 10)
    });

    // 3. 生成签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(body);
    const signature = sign.sign(privateKey, 'base64');

    // 4. 发起 HTTPS 请求
    const response = await fetch('https://console.app238.com/worker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Combinator-Signature': signature,
        'X-Combinator-UserID': userId
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