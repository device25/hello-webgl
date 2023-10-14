/**
 * @typedef {Object} Theme
 * @property {string} background
 * @property {string} main
 * @returns {Theme}
 */
const getTheme = () => {
  let colorScheme = "light";

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    colorScheme = "dark";
  }

  return {
    light: {
      background: "#fff",
      main: "#333",
    },
    dark: {
      background: "#333",
      main: "#fff",
    },
  }[colorScheme];
};

/** @type HTMLCanvasElement */
const canvas = document.getElementById("canvas");
const dpr = window.devicePixelRatio;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

const { background, main } = getTheme();

const ctx = canvas.getContext("2d");
ctx.fillStyle = background;
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = main;
ctx.moveTo(canvas.width / 2, canvas.height / 2);
ctx.lineTo(canvas.width / 2, 0);
ctx.stroke();
