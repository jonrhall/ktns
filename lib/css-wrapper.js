const colors = {
  positive: 'green',
  negative: 'red',
  text: '#bbb',
  highlight: 'white',
  marker: 'red'
};

// CSS
GM_addStyle(`
  #observeButton {
    position: relative;
  }

  #ktns-button {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  #ktns-button a {
    cursor: pointer;
  }

  #ktns-button span {
    padding: 0 0.4rem;
  }

  #ktns-hook {
    padding: 1rem 0;
    min-width: 405px;
    border-top: 1px solid gray;
    overflow: hidden;
    display: none;
  }

  #ktns-hook.active {
    display: block;
  }

  #log-group.disabled {
    display: none !important;
  }

  .bullet {
    font: 10px sans-serif;
    width: 405px !important;
  }
  .bullet .marker { stroke: transparent; stroke-width: 2px; transition: stroke 0.2s; transition-delay: 0.4s  }
  .bullet .marker.selected { stroke: ${colors.marker}; transition: stroke 0.2s; }
  .bullet .tick line { stroke: #666; stroke-width: .5px; }
  .bullet .tick text { fill: ${colors.text}; }
  .bullet:hover .tick text, .bullet.selected .tick text { fill: ${colors.highlight}; }
  .bullet .range.s0 { fill: #eee; }
  .bullet .range.s1 { fill: #c9c9c9; }
  .bullet .range.s2 { fill: #a2a2a2; }
  .bullet .measure.s0 { fill: lightsteelblue; }
  .bullet .measure.s1 { fill: steelblue; }
  .bullet .title { font-size: 14px; font-weight: bold; fill: ${colors.text}; letter-spacing: 0.5px; }
  .bullet:hover .title, .bullet.selected .title { fill: ${colors.highlight}; }
  .bullet .subtitle { fill: ${colors.text}; }
  .bullet:hover .subtitle, .bullet.selected .subtitle { fill: ${colors.highlight}; }

  #rightColumn {
    margin-bottom: 40px !important;
  }

  .scheme_sleek #tooltip {
    right: 45% !important;
  }
`);

export default { colors };