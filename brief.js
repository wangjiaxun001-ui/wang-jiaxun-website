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

const directory = document.querySelector('#directory');
const menuToggle = document.querySelector('.menu-toggle');
const chapterLinks = document.querySelectorAll('.chapter-links a, #directory nav a');
const chapters = Array.from(document.querySelectorAll('main > section[id]'));
const cover = document.querySelector('.cover');
let lastChapter;
let scrollFrame;

function markCurrentChapter() {
  scrollFrame = null;
  let current = '#top';
  if (!cover.getClientRects().length) {
    const visible = chapters.filter(section => section.getBoundingClientRect().top <= 110);
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const section = atEnd ? chapters.at(-1) : visible.at(-1) || chapters[0];
    current = '#' + section.id;
  }
  if (lastChapter === current) return;
  lastChapter = current;
  chapterLinks.forEach(link => {
    if (link.hash === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function scheduleChapterUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(markCurrentChapter);
}
window.addEventListener('scroll', scheduleChapterUpdate, {passive: true});
window.addEventListener('resize', scheduleChapterUpdate);
window.addEventListener('hashchange', scheduleChapterUpdate);
markCurrentChapter();

menuToggle.addEventListener('click', () => {
  directory.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
});

document.querySelector('.menu-close').addEventListener('click', () => directory.close());
directory.addEventListener('close', () => menuToggle.setAttribute('aria-expanded', 'false'));
directory.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => directory.close());
});

window.addEventListener('hashchange', () => {
  const section = document.getElementById(location.hash.slice(1));
  const heading = section?.matches('section') ? section.querySelector('h2') : null;
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
  }
});

document.querySelector('#example').addEventListener('click', () => {
  form.elements.guest.value = '刚剪完短片的摄影师';
  form.elements.topic.value = '剪掉最喜欢的镜头';
  form.requestSubmit();
  output.focus();
});

const viewer = document.querySelector('#viewer');
const archiveLinks = Array.from(document.querySelectorAll('.archive-gallery a'));
let currentImage = 0;
function displayImage(index) {
  currentImage = (index + archiveLinks.length) % archiveLinks.length;
  const link = archiveLinks[currentImage];
  const image = viewer.querySelector('img');
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  document.querySelector('#viewer-note').textContent = link.dataset.caption;
  document.querySelector('#viewer-source').href = link.dataset.source;
  document.querySelector('#position').textContent = (currentImage + 1) + ' / ' + archiveLinks.length;
}

archiveLinks.forEach((link, index) => link.addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  displayImage(index);
  viewer.showModal();
}));
document.querySelector('#previous').addEventListener('click', () => displayImage(currentImage - 1));
document.querySelector('#next').addEventListener('click', () => displayImage(currentImage + 1));
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') displayImage(currentImage - 1);
  if (event.key === 'ArrowRight') displayImage(currentImage + 1);
});

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('arrived');
        reveal.unobserve(entry.target);
      }
    });
  });
  document.querySelectorAll('.case-cards a, .archive-gallery a, .profile-lead').forEach((item) => reveal.observe(item));
}

const promptPanel = document.querySelector('#prompt-panel');
function hidePrompt() { promptPanel.hidden = true; }
form.addEventListener('input', hidePrompt);
form.addEventListener('submit', hidePrompt);
document.querySelector('#ai-prompt').addEventListener('click', () => {
  const promptText = document.querySelector('#prompt-text');
  promptText.value = '请帮我打磨这张人物采访提纲。保留人物已有的信息，围绕具体动作、环境和选择分别给出一个追问。请把尚未核实的事实列为待确认问题。\n\n' + output.value;
  promptPanel.hidden = false;
  promptText.focus();
  promptText.select();
});

const studioClock = document.querySelector('#studio-time');
const beijingTime = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});
function updateStudioClock() {
  const now = new Date();
  studioClock.textContent = beijingTime.format(now);
  studioClock.dateTime = now.toISOString();
}
updateStudioClock();
window.setInterval(updateStudioClock, 1000);

const typeBand = document.querySelector('.type-band');
const typePause = typeBand.querySelector('.type-pause');
typePause.addEventListener('click', () => {
  const paused = typeBand.dataset.paused !== 'true';
  typeBand.dataset.paused = String(paused);
  typePause.textContent = paused ? '播放 ▷' : '暂停 Ⅱ';
  typePause.setAttribute('aria-label', paused ? '继续滚动字带' : '暂停滚动字带');
});
