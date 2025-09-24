const DEFAULT_INTERVAL = 500;
const PLACEHOLDER = "-- FPS";

/**
 * <fps-counter> web component that calculates and renders frames per second.
 */
export class FpsCounterElement extends HTMLElement {
  #frames = 0;
  #lastUpdate = 0;
  #label;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          --bg-color: rgba(0, 0, 0, 0.6);
          --color: #fff;

          position: fixed;
          inset-block-start: 12px;
          inset-inline-end: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: var(--bg-color);
          color: var(--color);
          font-family: monospace;
          font-size: 14px;
          letter-spacing: 0.02em;
        }
      </style>
      <span part="value">${PLACEHOLDER}</span>
    `;
    this.#label = root.querySelector("span");
  }

  connectedCallback() {
    this.reset();
  }

  /** Resets internal counters and restores the placeholder text. */
  reset() {
    this.#frames = 0;
    this.#lastUpdate = 0;
    this.#setLabel(PLACEHOLDER);
  }

  /** Time between FPS updates in ms. */
  get updateInterval() {
    const attr = this.getAttribute("update-interval");
    const parsed = Number.parseInt(attr ?? "", 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INTERVAL;
  }

  /**
   * Should be invoked once per animation frame with the RAF timestamp.
   * @param {number} time
   */
  update(time) {
    if (typeof time !== "number" || Number.isNaN(time)) {
      return;
    }

    if (this.#lastUpdate === 0) {
      this.#lastUpdate = time;
    }

    this.#frames += 1;
    const elapsed = time - this.#lastUpdate;

    if (elapsed < this.updateInterval) {
      return;
    }

    const fps = (this.#frames * 1000) / elapsed;
    this.#setLabel(`${fps.toFixed(1)} FPS`);
    this.#frames = 0;
    this.#lastUpdate = time;
  }

  #setLabel(text) {
    if (this.#label) {
      this.#label.textContent = text;
    }
  }
}

customElements.define("fps-counter", FpsCounterElement);
