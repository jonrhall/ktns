import css from './css-wrapper';
import utils from './utils';

// Creates and returns the chart button that can be clicked to enable/dismiss the chart view.
const createButton = () => {
  const observeBox = document.getElementById('observeButton');
  observeBox.style.height = '60px';
  const div = document.createElement('div');
  div.setAttribute('id', 'ktns-button');
  div.innerHTML = (`<a class="tab">KTNS</a><span>|</span><a class="tab activeTab">Log</a>`);
  observeBox.appendChild(div);
  return div;
};

const setActiveTab = (button, active) => {
  button.className = active ? 'tab activeTab' : 'tab';
};

// Creates and returns the hook used to bootstrap the D3 view.
const createHook = () => {
  const hook = document.createElement('div');
  hook.setAttribute('id', 'ktns-hook');
  document.getElementById('rightColumn').appendChild(hook);
  return hook;
};

// Instantiates the d3 bullet.js library itself, with a configurable width, height, and a defined
// ticket format.
const createChart = (width, height) => d3.bullet()
  .width(width)
  .height(height)
  .tickFormat(utils.formatNumber);

// Updates a single metric given the resources and prices data sets
const updateMetric = (resources, prices) => (d) => {
  const resource = resources[d.type];
  d.subtitle = utils.generateSubtitle(resource);
  d.measures = [
    resource.value,
    resource.value
  ];
  const price = prices.find(price => price.name === d.type);
  d.markers[0] = price ? (resource.value - price.val < 0 ? 1 : resource.value - price.val) : 0;
  d.rate = utils.generateRate(d);
  d.ranges = utils.generateRange(resource, d);
  return d;
}

// Given a set of selected resources, maps those resources into data that is renderable by the D3
// bullet component.
const getData = (selectedResources, resources) => selectedResources
  .map(({ title, name }) => ({
    title: title.charAt(0).toUpperCase() + title.substr(1).toLowerCase(),
    type: name,
    subtitle: utils.generateSubtitle(resources[name]),
    ranges: [0, 0, resources[name].maxValue > resources[name].value ? resources[name].maxValue : resources[name].value],
    measures: [resources[name].value, resources[name].value],
    markers: [0],
    rate: utils.generateRate({ type: name })
  }));

// Initializes D3.js charts and all sub-components.
function initD3(resources) {
  // Create the HTML elements that we'll need to hook into the interface
  const button = createButton();
  const hook = createHook();
  const chartHook = d3.select('#ktns-hook');

  // Set the margins for the individual resource charts
  const margin = {top: 5, right: 100, bottom: 20, left: 100};

  // Determines the width and height of each individual resource chart, **but does not** take into 
  // account the overall sizing of the container, so those values and these values need to be 
  // matched up (located in the css wrapper).
  const width = 440 - margin.left - margin.right;
  const height = 50 - margin.top - margin.bottom;

  // Create the chart set with the defined width and height
  const chart = createChart(width, height);

  // Grab an initial set of selected resources. This will change over time as the player completes
  // more tasks, unlocks more resources, etc., so it is a fluid thing that we'll keep up-to-date.
  let selectedResources = gamePage.resPool.resources
    .filter(res => res.maxValue > 0 && !res.isHidden && res.unlocked && res.visible);

  // By default, the graph isn't visible
  let visible = false;

  // This object is used to track if the charts need to draw marking lines for the prices of 
  // resources based on a button the player is hovering over.
  let prices = [];

  // Registers handlers on all of the buttons on the first tab of the game.
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
  };

  // The container to watch for updates to tabs that would cause the button handlers for pricing
  // markers to get unbound.
  const container = $('#gameContainerId')[0];

  // Options for the containerObserver (which mutations to observe)
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

  // A helper function for setting the chart set visible via CSS classes
  const setChartActive = active => {
    const log = document.getElementById('rightTabLog');
    const chat = document.getElementById('rightTabChat');
    hook.setAttribute('class', active ? 'right-tab active' : 'right-tab');
    log.className = active ? 'right-tab disabled' : 'right-tab';
    chat.className = active ? 'right-tab disabled' : 'right-tab';
  }

  // Interval needs to be declared up here because we need to be able to clearInterval() when a new
  // createDisplay() has been called so that we don't have a leaky interval.
  let dataInterval;

  // Setup handlers, intervals, and create visual display
  const run = () => {
    const ktnsButton = button.getElementsByClassName('tab')[0];
    const logButton = button.getElementsByClassName('tab')[1];

    // If the KTNS tab is clicked, turn on the display if it isn't already visible
    ktnsButton.onclick = () => {
      if (!visible) {
        // Turn on charts. If there is already a data interval, clear it so that it isn't leaked.
        if (dataInterval) {
          clearInterval(dataInterval);
          dataInterval = null;
        }

        // Set the tabs style based on what view is selected
        setActiveTab(ktnsButton, true);
        setActiveTab(logButton, false);

        // Create the display
        createDisplay();
      }
    };

    // If the "log" button is clicked, switch the display off and show the regular kittens log view
    logButton.onclick = () => {
      if (visible) {
        // Turn off charts
        chartHook.selectAll("svg").remove();
        visible = false;

        // Set the tabs style based on what view is selected
        setActiveTab(ktnsButton, false);
        setActiveTab(logButton, true);

        setChartActive(false);
      }
    };

    // Register handler for when the ktns chart button is clicked
    /**button.onclick = () => {
      if (visible) {
        // Turn off charts
        chartHook.selectAll("svg").remove();
        visible = false;
        setChartActive(false);
      } else {
        // Turn on charts. If there is already a data interval, clear it so that it isn't leaked.
        if (dataInterval) {
          clearInterval(dataInterval);
          dataInterval = null;
        }
        createDisplay();
      }
    };*/
  
    // Set an interval to check for updates to the resource map. If any are found, deconstruct the
    // old chart and build a new one with the resource added/removed. A full rebuild of the chart
    // is necessary because bullet.js doesn't have a concept of its dataset changing out from
    // underneath it like that. Ideally this should probably happen inside the function that
    // updates data for the charts but then you run into a problem of the update function calling
    // the createChart() function recursively, which (in theory) would make it so that the JS
    // garbage collector wouldn't be able to cleanup the closure, thus growing the memory footprint
    // of the script infinitely. To avoid that, we run the check for resource updates in a separate
    // interval, which allows us the opportunity to cleanup any intervals set inside the
    // createChart() function and also properly garbage collect the old createChart() function that
    // isn't needed once a new chart is created.
    setInterval(() => {
      // Only listen if the interval is set and the chart is visible
      if(dataInterval && visible) {
        const newSelections = gamePage.resPool.resources
          .filter(res => res.maxValue > 0 && !res.isHidden && res.unlocked && res.visible);
  
        if (newSelections.length !== selectedResources.length) {
          clearInterval(dataInterval);
          selectedResources = newSelections;
          chartHook.selectAll("svg").remove();
          createDisplay();
        }
      }
    }, 1000);

    // Register the initial button handlers for marking price on the graph
    registerButtonHandlers();

    // Start observing the target node for configured mutations, so that button handlers don't go
    // stale when the DOM is refreshed with new nodes.
    containerObserver.observe(container, config);
    
    // By default, turn on the display.
    // createDisplay();
  };

  // Initialize the charts.
  run();
  
  // The secret sauce. Creates a set of resource charts and displays them.
  function createDisplay() {
    // Set the display up so that it is active and visible.
    setChartActive(true);
    visible = true;

    // Get the initial data associated with the chart.
    const data = getData(selectedResources, resources);
    
    // Setup the SVG sizing, add the appropriate CSS classes to each of the bullet charts contained
    // within the set.
    const svg = chartHook.selectAll("svg")
        .data(data)
      .enter().append("svg")
        .attr("class", "bullet")
        .attr("width", width + margin.left + margin.right - 40)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(chart);

    // Set the placement of the title text for each graph
    const title = svg.append("g")
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + height / 2 + ")");

    // Place the resource growth rate at the end of the each chart
    const rate = svg.append('g')
      .attr('transform', `translate(${width+5},${(height / 2)+1})`)
    
    // Append the growth rate text to the SVG
    const appendRate = () => rate.append('text')
      .attr("class", "rate")
      .attr('fill', d => d.rate > -1 ? css.colors.positive : css.colors.negative)
      .text(utils.displayRate);
    
    // Append the name of a resource to the title of a given chart
    const appendTitle = () => title.append("text")
      .attr("class", "title")
      .text(function(d) { return d.title; });

    // Append the subtitle below the title
    const appendSubtitle = () => title.append("text")
      .attr("class", "subtitle")
      .attr("dy", "1em")
      .text(function(d) { return d.subtitle; });

    // Append all text at the same time
    appendRate();
    appendTitle();
    appendSubtitle();

    // Define an update function to be called on an interval
    const updateData = () => {
      // For each metric in the charts, apply an update function and set the duration of the change
      // to 400ms.
      svg.datum(updateMetric(resources, prices)).call(chart.duration(400));

      // Apply a CSS class to show the price marker if the marker value is greater than 0.
      svg.selectAll('.bullet .marker').attr('class', d => {
        return `marker ${d > 0 ? 'selected' : ''}`;
      });

      // If a resource is in the prices set, highlight it.
      chartHook.selectAll("svg").attr('class', d => {
        if (prices.find(p => p.name === d.type)) {
          return 'bullet selected';
        }
        return 'bullet'
      });

      // Bullet.js doesn't provide an update to the subtitle, which we want in this case.
      title.selectAll('.subtitle').remove();
      appendSubtitle();

      // Same as above applies here.
      rate.selectAll('.rate').remove();
      appendRate();
    };

    // Setup the interval for the update function.
    dataInterval = setInterval(updateData, 400);
  }
}

export default initD3;