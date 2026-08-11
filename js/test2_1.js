(() => {
  "use strict";

  const CONFIG = {
    imageUrl:
      "https://pic.616pic.com/photoone/00/06/02/618e27a728fd34751.jpg?x-oss-process=image/resize,w_220", // 图片url
    targetUrl: "https://vn777.brtv24.com/hs/", // 点击的跳转链接
    elementId: "test2-random-fixed-image",
    edgeSpacing: "24px", // 图片距离页面边缘的距离
    zIndex: "2147483647", // 图片的z-index
  };

  // 图片的位置
  const POSITIONS = ["middle-left", "middle-right", "bottom-center"];

  function chooseRandomPosition() {
    const index = Math.floor(Math.random() * POSITIONS.length);
    return POSITIONS[index];
  }

  function applyPosition(element, position) {
    element.style.position = "fixed";
    element.style.zIndex = CONFIG.zIndex;

    switch (position) {
      case "middle-left":
        element.style.left = CONFIG.edgeSpacing;
        element.style.top = "50%";
        element.style.transform = "translateY(-50%)";
        break;

      case "middle-right":
        element.style.right = CONFIG.edgeSpacing;
        element.style.top = "50%";
        element.style.transform = "translateY(-50%)";
        break;

      case "bottom-center":
        element.style.left = "50%";
        element.style.bottom = CONFIG.edgeSpacing;
        element.style.transform = "translateX(-50%)";
        break;

      default:
        throw new Error(`未知图片位置：${position}`);
    }
  }

  function createRandomFixedImage() {
    if (document.getElementById(CONFIG.elementId)) {
      return;
    }

    const position = chooseRandomPosition();
    const link = document.createElement("a");
    const image = document.createElement("img");

    link.id = CONFIG.elementId;
    link.href = CONFIG.targetUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "点击图片访问 Google");
    link.style.display = "block";
    link.style.lineHeight = "0";
    link.style.width = "max-content";

    image.src = CONFIG.imageUrl;
    image.alt = "点击访问 Google"; // 图片的alt文本
    image.style.display = "block";
    image.style.setProperty("width", "auto", "important");
    image.style.setProperty("height", "auto", "important");
    image.style.setProperty("max-width", "none", "important");
    image.style.setProperty("max-height", "none", "important");

    image.addEventListener("load", () => {
      console.log(`[test2] 图片加载成功，随机位置：${position}`);
    });

    image.addEventListener("error", () => {
      console.error(`[test2] 图片加载失败：${CONFIG.imageUrl}`);
    });

    applyPosition(link, position);
    link.appendChild(image);
    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createRandomFixedImage, {
      once: true,
    });
  } else {
    createRandomFixedImage();
  }
})();
