const formatNumber = (num) => {
  if (num > 999) {
    return `${Math.round((num / 1000) * 100) / 100}k`;
  }
  return `${num}`;
};

const generateSubtitle = (res) => `${Math.round(res.value * 100) / 100} / ${formatNumber(res.maxValue)}`;

const generateRate = (res) => Math.round(game.getResourcePerTick(res.type, true) * game.getTicksPerSecondUI() * 100) / 100;

const generateRange = (res, d) => {
  const max = res.maxValue;
  const rate = (d.rate * 60);
  let fiveMinRate = res.value + (rate * 5);
  let fifteenMinRate = res.value + (rate * 15);

  if (fiveMinRate < 0) fiveMinRate = 0;
  if (fifteenMinRate < 0) fifteenMinRate = 0;

  return [d3.min([fiveMinRate, max]), d3.min([fifteenMinRate, max]), max]
};

const displayRate = ({ rate }) => {
  if (rate > 0) {
    return `+${rate}/s`;
  } else if (rate < 0) {
    return `${rate}/s`;
  }
  
  return '0/s';
};

export default {
  formatNumber,
  generateSubtitle,
  generateRate,
  generateRange,
  displayRate
}