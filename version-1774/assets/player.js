import { H as Hls } from "./hls-dru42stk.js";

export function setupPlayer(source) {
  const video = document.querySelector("[data-player]");
  const overlay = document.querySelector("[data-player-overlay]");
  const button = document.querySelector("[data-play-action]");
  if (!video || !source) {
    return;
  }

  let attached = false;
  let hls = null;

  const attach = () => {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const play = () => {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  };

  if (button) {
    button.addEventListener("click", play);
  }
  if (overlay) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });
  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
}
