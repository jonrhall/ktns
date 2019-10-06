const formatNumber = (num) => {
  if (num > 999999) {
    return `${Math.round((num / 1000000) * 100) / 100}m`;
  } else if (num > 999) {
    return `${Math.round((num / 1000) * 100) / 100}k`;
  }
  return `${Math.round(num * 100) / 100}`;
};

const generateSubtitle = (res) => `${formatNumber(res.value)} / ${formatNumber(res.maxValue)}`;

const generateRate = (res) => Math.round(game.getResourcePerTick(res.type, true) * game.getTicksPerSecondUI() * 100) / 100;

const generateRange = (res, d) => {
  const max = res.maxValue > res.value ? res.maxValue : res.value;
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