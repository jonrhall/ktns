const colors = {
  positive: 'green',
  negative: 'red',
  text: '#bbb',
  highlight: 'white',
  marker: 'red'
};

// CSS
GM_addStyle(`
  #ktns-button {
    position: absolute;
    bottom: 3rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 30px;
    cursor: pointer;
    border:1px solid #495267; display:inline-block;text-shadow: -1px -1px 0 rgba(0,0,0,0.3);
    background-color: #606c88; background-image: -webkit-gradient(linear, left top, left bottom, from(#606c88), to(#3f4c6b));
    background-image: -webkit-linear-gradient(top, #606c88, #3f4c6b);
    background-image: -moz-linear-gradient(top, #606c88, #3f4c6b);
    background-image: -ms-linear-gradient(top, #606c88, #3f4c6b);
    background-image: -o-linear-gradient(top, #606c88, #3f4c6b);
    background-image: linear-gradient(to bottom, #606c88, #3f4c6b);filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=#606c88, endColorstr=#3f4c6b);
  }

  #ktns-button:hover {
    border:1px solid #363d4c;
    background-color: #4b546a; background-image: -webkit-gradient(linear, left top, left bottom, from(#4b546a), to(#2c354b));
    background-image: -webkit-linear-gradient(top, #4b546a, #2c354b);
    background-image: -moz-linear-gradient(top, #4b546a, #2c354b);
    background-image: -ms-linear-gradient(top, #4b546a, #2c354b);
    background-image: -o-linear-gradient(top, #4b546a, #2c354b);
    background-image: linear-gradient(to bottom, #4b546a, #2c354b);filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=#4b546a, endColorstr=#2c354b);
  }

  #ktns-button img {
    position: relative;
    left: 9px;
    top: 9px;
  }

  #ktns-hook {
    position: absolute;
    bottom: 7rem;
    right: 5rem;
    padding: 1rem 0;
    border: 1px solid #737373;
    background-color: #1a1815;
    font-family: "Arial", sans-serif;
    width: 400px;
    overflow: hidden;
    display: none;
  }

  #ktns-hook.active {
    display: block;
  }

  .bullet { font: 10px sans-serif; }
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
`);

export default { colors };