// Upload helper for AIDot
// Behavior:
// - Compute SHA-256 of password locally via SubtleCrypto
// - If local saved hash exists (in localStorage.LPASSWORD_HASH), compare against it
// - User supplies PAT at upload time; file is sent to GitHub Contents API and written to images/{filename}

const OWNER = "eveleighcarrisalez-dot";
const REPO = "aidot";
// If you want to bake a PASSWORD_HASH into the file, set it here as a hex string (lowercase).
// For security we leave it empty and provide a "save hash locally" flow.
const PASSWORD_HASH = "";

async function sha256Hex(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  return hex;
}

function readElem(id) { return document.getElementById(id); }

async function init() {
  const saveBtn = readElem('save-hash');
  const hashInfo = readElem('hash-info');
  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const pwd = readElem('password').value;
    if (!pwd) { alert('请输入密码以生成哈希'); return; }
    const hex = await sha256Hex(pwd);
    // Save locally in localStorage for future verification
    localStorage.setItem('LPASSWORD_HASH', hex);
    hashInfo.textContent = '已在本地保存密码哈希（仅保存在您当前浏览器），哈希值：' + hex;
  });

  readElem('upload').addEventListener('click', async (e) => {
    e.preventDefault();
    await handleUpload();
  });
}

async function handleUpload() {
  const status = readElem('status');
  const links = readElem('links');
  const result = readElem('result');
  status.textContent = '';
  links.innerHTML = '';
  result.style.display = 'none';

  const pwd = readElem('password').value;
  if (!pwd) { alert('请输入上传密码'); return; }

  // Decide which hash to compare against: in-file PASSWORD_HASH takes precedence; otherwise local saved one
  let expectedHash = PASSWORD_HASH || localStorage.getItem('LPASSWORD_HASH');
  if (!expectedHash) {
    if (!confirm('未找到仓库内的密码哈希或本地保存的哈希。您可以先使用“在本地生成并保存密码哈希”生成并保存（仅保存在当前浏览器），或者继续上传但不进行密码校验。是否继续不进行密码校验？')) {
      return;
    }
  }

  if (expectedHash) {
    const h = await sha256Hex(pwd);
    if (h !== expectedHash) {
      alert('密码不正确');
      return;
    }
  }

  const pat = readElem('pat').value.trim();
  if (!pat) { if (!confirm('未提供 PAT，无法把文件写入仓库。是否复制本地文件 URL（不上传）？')) { return; } }

  const fileInput = readElem('file');
  if (!fileInput.files || fileInput.files.length === 0) { alert('请选择要上传的图片'); return; }

  const file = fileInput.files[0];
  const originalName = file.name;
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filename = `${timestamp}_${safeName}`;

  status.textContent = '读取文件并准备上传...';

  const arrayBuffer = await file.arrayBuffer();
  const base64Content = arrayBufferToBase64(arrayBuffer);

  if (!pat) {
    status.textContent = '没有 PAT，跳过上传。';
    result.style.display = 'block';
    links.innerHTML = `<div>本地文件名：${filename}</div><div>您可以手动上传到仓库 images/ 下或提供 PAT 让页面上传。</div>`;
    return;
  }

  status.textContent = '正在通过 GitHub API 上传到仓库...';

  try {
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/images/${encodeURIComponent(filename)}`;
    const body = {
      message: `Upload image ${filename} via pages upload`,
      content: base64Content
    };

    const resp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + pat,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GitHub API 返回 ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/images/${encodeURIComponent(filename)}`;
    const pagesUrl = `https://${OWNER}.github.io/${REPO}/images/${encodeURIComponent(filename)}`;

    status.textContent = '上传成功';
    links.innerHTML = `<div>Raw 链接：<a href="${rawUrl}" target="_blank">${rawUrl}</a></div>
                       <div>Pages 链接：<a href="${pagesUrl}" target="_blank">${pagesUrl}</a></div>
                       <div>Commit: <a href="${data.content.html_url}" target="_blank">查看提交</a></div>`;
    result.style.display = 'block';

  } catch (err) {
    status.textContent = '上传失败：' + err.message;
    result.style.display = 'block';
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

// Initialize UI
init();
