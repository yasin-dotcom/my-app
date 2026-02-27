// Random objects used as creativity prompts
const objects = [
  "paperclip", "brick", "shoe", "umbrella", "rubber band",
  "tennis ball", "fork", "newspaper", "bucket", "rope",
  "mirror", "blanket", "ladder", "candle", "tire",
  "bottle cap", "clothespin", "sponge", "coat hanger", "pencil",
  "cardboard box", "tin can", "pillowcase", "wooden spoon", "marble",
  "ice cube tray", "binder clip", "coffee filter", "zip tie", "ping pong ball",
  "corkscrew", "mason jar", "pool noodle", "chopsticks", "safety pin",
  "toothbrush", "paper plate", "funnel", "key ring", "shoelace",
  "rolling pin", "tape measure", "flyswatter", "colander", "thimble",
  "magnifying glass", "whistle", "feather", "domino", "dice",
  "balloon", "straw", "button", "magnet", "spring",
  "spool of thread", "rubber duck", "comb", "battery", "bookmark",
  "thumbtack", "eraser", "chalk", "playing card", "coin",
  "paper bag", "aluminum foil", "bubble wrap", "cotton ball", "popsicle stick"
];

function getRandomObject() {
  return objects[Math.floor(Math.random() * objects.length)];
}

module.exports = { objects, getRandomObject };
