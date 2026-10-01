async (page) => {
  const ownedTestContexts = [];
  const createTestContext = async (options) => {
    const context = await page.context().browser().newContext(options);
    ownedTestContexts.push(context);
    return context;
  };
  try {
    const origin = new URL(page.url()).origin,
      c = await createTestContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: "no-preference",
      });
    await c.addInitScript(() => {
      window.__renderEvidence = {
        calls: 0,
        triangles: 0,
        lastCalls: 0,
        lastTriangles: 0,
        draws: 0,
      };
      const s = window.__renderEvidence,
        proto = WebGL2RenderingContext.prototype;
      const resources = new Map(),
        register = (gl) => {
          if (!resources.has(gl)) {
            const owned = new Map();
            resources.set(gl, owned);
            gl.canvas.addEventListener("webglcontextlost", () => {
              owned.clear();
            });
          }
          return resources.get(gl);
        };
      for (const kind of [
        "Buffer",
        "Texture",
        "Program",
        "Shader",
        "Framebuffer",
        "Renderbuffer",
        "VertexArray",
      ]) {
        const make = proto["create" + kind],
          drop = proto["delete" + kind];
        if (!make || !drop) continue;
        proto["create" + kind] = function (...args) {
          const object = make.apply(this, args);
          if (object) register(this).set(object, kind);
          return object;
        };
        proto["delete" + kind] = function (object) {
          register(this).delete(object);
          return drop.call(this, object);
        };
      }
      window.__resourceCounts = () => {
        const counts = {};
        for (const owned of resources.values())
          for (const kind of owned.values())
            counts[kind] = (counts[kind] || 0) + 1;
        return counts;
      };
      const clear = proto.clear;
      proto.clear = function (...args) {
        if (s.calls) {
          s.lastCalls = s.calls;
          s.lastTriangles = s.triangles;
        }
        s.calls = 0;
        s.triangles = 0;
        return clear.apply(this, args);
      };
      for (const name of [
        "drawElements",
        "drawArrays",
        "drawElementsInstanced",
        "drawArraysInstanced",
      ]) {
        const original = proto[name];
        proto[name] = function (...args) {
          s.calls++;
          s.draws++;
          const count = args[name.startsWith("drawElements") ? 1 : 2],
            instances = name.includes("Instanced") ? args[args.length - 1] : 1;
          if (args[0] === 4) s.triangles += (count / 3) * instances;
          return original.apply(this, args);
        };
      }
      const add = EventTarget.prototype.addEventListener,
        remove = EventTarget.prototype.removeEventListener,
        records = [];
      EventTarget.prototype.addEventListener = function (
        type,
        listener,
        options,
      ) {
        if (
          this === window ||
          this === document ||
          this === document.documentElement
        ) {
          const capture =
            typeof options === "boolean" ? options : Boolean(options?.capture);
          if (
            !records.some(
              (r) =>
                r.target === this &&
                r.type === type &&
                r.listener === listener &&
                r.capture === capture,
            )
          )
            records.push({ target: this, type, listener, capture });
        }
        return add.call(this, type, listener, options);
      };
      EventTarget.prototype.removeEventListener = function (
        type,
        listener,
        options,
      ) {
        const capture =
            typeof options === "boolean" ? options : Boolean(options?.capture),
          i = records.findIndex(
            (r) =>
              r.target === this &&
              r.type === type &&
              r.listener === listener &&
              r.capture === capture,
          );
        if (i >= 0) records.splice(i, 1);
        return remove.call(this, type, listener, options);
      };
      window.__listenerCounts = () =>
        records.reduce((a, r) => {
          const key =
            (r.target === window
              ? "window"
              : r.target === document
                ? "document"
                : "root") +
            ":" +
            r.type;
          a[key] = (a[key] || 0) + 1;
          return a;
        }, {});
    });
    // Keep the CLI source page from running a second decorative scene during sampling.
    await page.goto(origin + "/project", { waitUntil: "domcontentloaded" });
    const p = await c.newPage();
    await p.goto(origin, { waitUntil: "domcontentloaded" });
    await p.locator("canvas").waitFor();
    await p.waitForTimeout(2000);
    const sample = (scroll) =>
      p.evaluate(async (scrolling) => {
        const times = [];
        let previous;
        for (let i = 0; i < 121; i++) {
          const t = await new Promise(requestAnimationFrame);
          if (previous) times.push(t - previous);
          previous = t;
          if (scrolling)
            scrollTo(
              0,
              (i / 120) *
                Math.min(
                  2400,
                  document.documentElement.scrollHeight - innerHeight,
                ),
            );
        }
        times.sort((a, b) => a - b);
        return {
          medianMs: +times[Math.floor(times.length * 0.5)].toFixed(2),
          p95Ms: +times[Math.floor(times.length * 0.95)].toFixed(2),
          samples: times.length,
        };
      }, scroll);
    const idle = await sample(false),
      scrolling = await sample(true),
      gpu = await p.evaluate(() => {
        const gl = document.querySelector("canvas").getContext("webgl2"),
          ext = gl.getExtension("WEBGL_debug_renderer_info");
        return {
          renderer: ext
            ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER),
          ...window.__renderEvidence,
          pixelRatio:
            document.querySelector("canvas").width /
            document.querySelector("canvas").getBoundingClientRect().width,
        };
      });
    const resourceBaseline = await p.evaluate(() => window.__resourceCounts());
    const baseline = await p.evaluate(() => window.__listenerCounts());
    for (let i = 0; i < 3; i++) {
      await p
        .getByRole("link", {
          name: "Explore all eight projects ↗",
          exact: true,
        })
        .click();
      await p.waitForURL("**/project");
      await p.getByRole("link", { name: "Inzamam Idrees home" }).click();
      await p.waitForURL(origin + "/");
      await p.locator("canvas").waitFor();
      await p.waitForTimeout(600);
      if ((await p.locator("canvas").count()) !== 1)
        throw new Error("Canvas remount leak");
    }
    await p.waitForTimeout(800);
    const resourceFinal = await p.evaluate(() => window.__resourceCounts());
    for (const kind of Object.keys(resourceFinal))
      if (resourceFinal[kind] > (resourceBaseline[kind] || 0))
        throw new Error(
          "GPU resource growth " +
            kind +
            ": " +
            JSON.stringify({ resourceBaseline, resourceFinal }),
        );
    const final = await p.evaluate(() => window.__listenerCounts());
    const growth = Object.keys(final).filter(
      (k) =>
        /scroll|resize|visibility|pointer|wheel|touch/.test(k) &&
        final[k] > (baseline[k] || 0),
    );
    if (growth.length)
      throw new Error(
        "Listener growth " +
          JSON.stringify(growth.map((k) => [k, baseline[k], final[k]])),
      );
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForTimeout(200);
    const before = await p.evaluate(() => window.__renderEvidence.draws);
    await p.waitForTimeout(900);
    const after = await p.evaluate(() => window.__renderEvidence.draws);
    if (after !== before) throw new Error("Hidden canvas still rendering");
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: "Pause motion", exact: true }).click();
    await p.waitForTimeout(300);
    const pauseBefore = await p.evaluate(() => window.__renderEvidence.draws);
    await p.waitForTimeout(500);
    if ((await p.evaluate(() => window.__renderEvidence.draws)) !== pauseBefore)
      throw new Error("Paused canvas still rendering");
    await c.close();
    return {
      viewport: "1440x900",
      idle,
      scrolling,
      gpu,
      hiddenRendering: "stopped",
      pausedRendering: "stopped",
      remounts: 3,
      listenerCountsBounded: true,
      gpuResourcesBounded: true,
      resourceBaseline,
      resourceFinal,
    };
  } finally {
    await Promise.allSettled(
      ownedTestContexts.map((context) => context.close()),
    );
  }
}
