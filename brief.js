const form = document.querySelector('#brief');
const output = document.querySelector('#output');
const statusLine = document.querySelector('#status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const guest = form.elements.guest.value.trim();
  const topic = form.elements.topic.value.trim();
  if (!guest || !topic) {
    statusLine.textContent = '请写下采访对象和想聊的事。';
    return;
  }
  output.value = [
    '采访对象：' + guest,
    '采访主题：' + topic,
    '① 回到“' + topic + '”的现场，你最先记得哪个细节？',
    '② 当时发生了什么，让你决定迈出下一步？',
    '③ 如果现在再经历一次，你会做出什么不同的选择？',
    '拍摄备忘：记录现场原声，补拍人物提到的物件和动作。'
  ].join('\n');
  document.querySelector('#result').hidden = false;
  statusLine.textContent = '提问卡已生成，可以直接修改。';
});

document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    statusLine.textContent = '已复制提问卡。';
  } catch {
    output.select();
    statusLine.textContent = '文字已选中，可用系统复制命令复制。';
  }
});
