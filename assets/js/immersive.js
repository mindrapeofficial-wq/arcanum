(() => {
  const root = document.documentElement;
  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  if (!isTouchDevice) return;

  const isNativeShell = /(?:^|\s)ArcanumNative\//.test(navigator.userAgent);

  const isDisplayFullscreen = () =>
    isNativeShell || window.matchMedia("(display-mode: fullscreen)").matches;

  const syncImmersiveClass = () => {
    root.classList.toggle(
      "arcanum-immersive",
      Boolean(document.fullscreenElement || isDisplayFullscreen())
    );
  };

  const requestImmersive = async () => {
    if (document.fullscreenElement || isDisplayFullscreen()) {
      syncImmersiveClass();
      return;
    }

    const target = document.documentElement;
    const request =
      target.requestFullscreen?.bind(target) ||
      target.webkitRequestFullscreen?.bind(target);

    if (!request) return;

    try {
      await request({ navigationUI: "hide" });
    } catch (_) {
      try {
        await request();
      } catch (_) {
        // Some WebViews/PWAs do not expose the Fullscreen API.
        // The manifest fullscreen mode still applies when launched as an installed app.
      }
    }

    syncImmersiveClass();
  };

  let armed = false;
  const armFirstGesture = () => {
    if (armed || document.fullscreenElement || isDisplayFullscreen()) return;
    armed = true;

    const run = () => {
      armed = false;
      requestImmersive();
    };

    window.addEventListener("pointerup", run, { once: true, capture: true, passive: true });
    window.addEventListener("touchend", run, { once: true, capture: true, passive: true });
    window.addEventListener("click", run, { once: true, capture: true, passive: true });
  };

  document.addEventListener("fullscreenchange", syncImmersiveClass);
  document.addEventListener("webkitfullscreenchange", syncImmersiveClass);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncImmersiveClass();
      armFirstGesture();
    }
  });

  syncImmersiveClass();
  armFirstGesture();
})();
