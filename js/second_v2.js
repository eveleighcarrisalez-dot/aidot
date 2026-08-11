(() => {
  "use strict";

  const CONFIG = {
    targetUrl: "https://vn777.brtv24.com/hs/", // 点击的跳转链接
    edgeSpacing: "24px", // 图片距离页面边缘的距离
    zIndex: "2147483647", // 图片的z-index
    placements: [
      {
        position: "middle-left",
        imageUrl:
          "https://eveleighcarrisalez-dot.github.io/aidot/images/AK168-1.gif",
      },
      {
        position: "middle-right",
        imageUrl:
          "https://eveleighcarrisalez-dot.github.io/aidot/images/KS168-1.gif",
      },
      {
        position: "bottom-center",
        imageUrl:
          "https://eveleighcarrisalez-dot.github.io/aidot/images/jin88-1.gif",
      },
    ],
  };

  function chooseRandomPlacements() {
    const shuffled = [...CONFIG.placements];

    // Fisher-Yates 洗牌，确保三个位置被公平地随机抽取。
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    const visibleCount = Math.floor(Math.random() * shuffled.length) + 1;
    return shuffled.slice(0, visibleCount);
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
        throw new Error(`Unknown position：${position}`);
    }
  }

  function createFixedImage(placement) {
    const { position, imageUrl } = placement;
    const link = document.createElement("a");
    const image = document.createElement("img");

    link.dataset.test2RandomFixedImage = "true";
    link.dataset.position = position;
    link.href = CONFIG.targetUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "click there");
    link.style.display = "block";
    link.style.lineHeight = "0";
    link.style.width = "max-content";

    image.src = imageUrl;
    image.alt = "Click There";
    image.style.display = "block";
    image.style.setProperty("width", "auto", "important");
    image.style.setProperty("height", "auto", "important");
    image.style.setProperty("max-width", "none", "important");
    image.style.setProperty("max-height", "none", "important");

    image.addEventListener("load", () => {
      console.log(` Load Success：${position}`);
    });

    image.addEventListener("error", () => {
      console.error(`Load Failed：${imageUrl}`);
    });

    applyPosition(link, position);
    link.appendChild(image);
    document.body.appendChild(link);
  }

  function createRandomFixedImages() {
    if (document.querySelector('[data-test2-random-fixed-image="true"]')) {
      return;
    }

    const selectedPlacements = chooseRandomPlacements();
    selectedPlacements.forEach(createFixedImage);

    // console.log(
    //   `[test2_1] 本次随机展示 ${selectedPlacements.length} 张图片：`,
    //   selectedPlacements.map(({ position }) => position),
    // );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createRandomFixedImages, {
      once: true,
    });
  } else {
    createRandomFixedImages();
  }
})();
