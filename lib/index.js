import css from './css-wrapper';

(() => {
  'use strict';

  let resources;

  // Interval needs to be declared up here because we need to be able to clearInterval() when a new createDisplay() has been called so that we don't have a leaky interval.
  let dataInterval;

  function init() {
    const initInterval = setInterval(() => {
      try {
        resources = game.resPool.resourceMap;
      } catch(e) {
        // Not ready yet
        return;
      }

      clearInterval(initInterval);

      // There's something about invoking D3 immediately after finding the resources object, sometimes the resource map isn't fully built yet and this timeout is enough to get around those load issues. Imperfect, but it works.
      setTimeout(() => {
        initD3();
        console.log('KTNS loaded');
      }, 300);
    }, 100);
  }

  function initD3() {
    const div = document.createElement('div');
    div.setAttribute('id', 'ktns-button');
    div.innerHTML = (`
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLYxhWIHjCmeboKec6sWHfvhNOUGXUB5FTz77ffuX9f3Q85/DT/6ETT0+FKqM+iJ9x4dX9D//+o+M9Nz6OWkxdQLTFvn2nrbGlQBAGpVCoMqIB0RZHTDnXAUpx2FIiKIVClRENSLIYJIhNMcgQqDKiwajFMDxq8eC32L/v1IWkWRefYMMgOagy6lscNunMDWxqQBgkB1U2ajEcj1o8ajEKHrUYmxoQHnoWE9P0ARmOTQ0II1tMdIPep+ekc/jkMzOw4aAJpyZBlTEE9J3Kx6YGhEFyUGUMID3Y1ICwV/cJb6iygQAMDABiLaLXLxFFNQAAAABJRU5ErkJggg==" />
    `);
    document.body.appendChild(div);

    const hook = document.createElement('div');
    hook.setAttribute('id', 'ktns-hook');
    document.body.appendChild(hook);

    let visible = false;

    div.onclick = () => {
      if (visible) {
        body.selectAll("svg").remove();
        visible = false;
        hook.setAttribute('class', '');
      } else {
        if (dataInterval) {
          clearInterval(dataInterval);
          dataInterval = null;
        }
        createDisplay();
      }
    };

    const body = d3.select('#ktns-hook');

    const margin = {top: 5, right: 100, bottom: 20, left: 100};
    const width = 440 - margin.left - margin.right;
    const height = 50 - margin.top - margin.bottom;

    const chart = d3.bullet()
      .width(width)
      .height(height)
      .tickFormat(formatNumber);
    
    let selections = gamePage.resPool.resources
      .filter(res => res.maxValue > 0 && !res.isHidden && res.unlocked && res.visible);

    const getData = () => selections
      .map(({ title, name }) => ({
        title: title.charAt(0).toUpperCase() + title.substr(1).toLowerCase(),
        type: name,
        subtitle: generateSubtitle(resources[name]),
        ranges: [0, 0, resources[name].maxValue],
        measures: [resources[name].value, resources[name].value],
        markers: [0],
        rate: generateRate({ type: name })
      }));
    
    // Set an interval to check for updates to the resource map. If any are found, deconstruct the old chart and build a new one with the resource added.
    // A full rebuild of the chart is necessary because bullet.js doesn't have a concept of its dataset changing out from underneath it like that. 
    // Ideally this should probably happen inside the function that updates data for the charts but then you run into a problem of the update function 
    // calling the createChart() function recursively, which (in theory) would make it so that the JS garbage collector wouldn't be able to cleanup the 
    // closure, thus growing the memory footprint of the script infinitely. To avoid that, we run the check for resource updates in a separate interval, 
    // which allows us the opportunity to cleanup any intervals set inside the createChart() function and also properly garbage collect the old createChart()
    // function that isn't needed once a new chart is created.
    setInterval(() => {
      // Only listen if the interval is set and the chart is visible
      if(dataInterval && visible) {
        const newSelections = gamePage.resPool.resources
          .filter(res => res.maxValue > 0 && !res.isHidden && res.unlocked && res.visible);

        if (newSelections.length !== selections.length) {
          clearInterval(dataInterval);
          selections = newSelections;
          body.selectAll("svg").remove();
          createDisplay();
        }
      }
    }, 1000);

    let prices = [];

    const registerButtonHandlers = () => {
      gamePage.tabs[0].buttons.forEach(button => {
        $(button.domNode).hover(
          () => {
            prices = button.model.prices;
          },
          () => {
            prices = [];
          }
        );
      });
    }

    registerButtonHandlers();

    const container = $('#gameContainerId')[0];

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    // Create an observer instance linked to the callback function
    const containerObserver = new MutationObserver((mutationsList) => {
      for(let mutation of mutationsList) {
        if (mutation.type == 'childList') {
          registerButtonHandlers();
        }
      }
    });

    // Start observing the target node for configured mutations
    containerObserver.observe(container, config);
    
    createDisplay();
    
    function createDisplay() {
      hook.setAttribute('class', 'active');
      visible = true;
      
      const data = getData();
      
      const svg = body.selectAll("svg")
          .data(data)
        .enter().append("svg")
          .attr("class", "bullet")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(chart);
  
      const title = svg.append("g")
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + height / 2 + ")");
  
      const rate = svg.append('g')
        .attr('transform', `translate(${width+5},${(height / 2)+1})`)
      
      const appendRate = () => rate.append('text')
        .attr("class", "rate")
        .attr('fill', d => d.rate > -1 ? css.colors.positive : css.colors.negative)
        .text(displayRate);
      
      appendRate();
  
      title.append("text")
        .attr("class", "title")
        .text(function(d) { return d.title; });
  
      const appendSubtitle = () => title.append("text")
        .attr("class", "subtitle")
        .attr("dy", "1em")
        .text(function(d) { return d.subtitle; });

      appendSubtitle();

      const updateData = () => {
        svg.datum(updateMetric).call(chart.duration(400));

        svg.selectAll('.bullet .marker').attr('class', d => {
          return `marker ${d > 0 ? 'selected' : ''}`;
        });

        body.selectAll("svg").attr('class', d => {
          if (prices.find(p => p.name === d.type)) {
            return 'bullet selected';
          }
          return 'bullet'
        });
  
        // Bullet.js doesn't provide an update to the subtitle, which we want in this case.
        title.selectAll('.subtitle').remove();
        appendSubtitle();
  
        rate.selectAll('.rate').remove();
        appendRate();
      };
  
      dataInterval = setInterval(updateData, 400);
    }

    function updateMetric(d) {
      d.subtitle = generateSubtitle(resources[d.type]);
      d.measures = [
        resources[d.type].value,
        resources[d.type].value
      ];
      const price = prices.find(price => price.name === d.type);
      d.markers[0] = price ? (resources[d.type].value - price.val < 0 ? 1 : resources[d.type].value - price.val) : 0;
      d.rate = generateRate(d);
      d.ranges = generateRange(d);
      return d;
    }
  }

  const formatNumber = (num) => {
    if (num > 999) {
      return `${Math.round((num / 1000) * 100) / 100}k`;
    }
    return `${num}`;
  }

  const generateSubtitle = (res) => `${Math.round(res.value * 100) / 100} / ${formatNumber(res.maxValue)}`;

  const generateRate = (res) => Math.round(game.getResourcePerTick(res.type, true) * game.getTicksPerSecondUI() * 100) / 100;

  const generateRange = (d) => {
    const max = resources[d.type].maxValue;
    const rate = (d.rate * 60);
    let fiveMinRate = resources[d.type].value + (rate * 5);
    let fifteenMinRate = resources[d.type].value + (rate * 15);

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

  init();
})();