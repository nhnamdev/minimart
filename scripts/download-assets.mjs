import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const assets = [
  ["store-avatar.jpg", "https://feige-img-hub.oss-cn-hangzhou.aliyuncs.com/1611302706246-yzmjMpaNj6.jpg"],
  ["product-01.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1781668824282-RGx3SYfWXy.jpeg?x-oss-process=style/x100"],
  ["product-02.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1781668709522-7Q5bdwPA4h.jpeg?x-oss-process=style/x100"],
  ["product-03.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1779676146548-JBMDPYBKwA.jpeg?x-oss-process=style/x100"],
  ["product-04.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1779764213380-PeRBAwRAZz.jpeg?x-oss-process=style/x100"],
  ["product-05.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1779247679705-a4nMJtiGnk.jpeg?x-oss-process=style/x100"],
  ["product-06.jpg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1778677674427-3WszeD26Rt.jpg?x-oss-process=style/x100"],
  ["product-07.jpg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1778226653161-2hc54AMSrt.jpg?x-oss-process=style/x100"],
  ["product-08.webp", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1778206025932-dWYMSp4aSk.webp?x-oss-process=style/x100"],
  ["product-09.jpeg", "https://feigeoss.blob.core.windows.net/feige-img-hub/toanh5116@gmail.com/1781668773691-5z7SerRihS.jpeg?x-oss-process=style/x100"],
];

const output = path.resolve("public/images/order-multi");
await mkdir(output, { recursive: true });

for (let index = 0; index < assets.length; index += 4) {
  await Promise.all(assets.slice(index, index + 4).map(async ([name, url]) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    await writeFile(path.join(output, name), Buffer.from(await response.arrayBuffer()));
  }));
}

console.log(`Downloaded ${assets.length} OrderMulti assets.`);
