// Import stylesheets
import './style.css';
import * as d3 from 'd3';

// Write TypeScript code!
const appDiv: HTMLElement = document.getElementById('app');

// Specify the dimensions of the chart.
const width = 928;
const height = 600;

const data = {
  nodes: [
    { id: 'policy1', group: 10 },
    { id: 'policy2', group: 10 },
    { id: 'policy3', group: 10 },

    { id: 'asset1', group: 5, workload: 'vm' },
    { id: 'asset2', group: 5, workload: 'fs'},
    { id: 'asset3', group: 5,workload: 'vm'  },
    { id: 'asset4', group: 5,workload: 'vm'  },
    { id: 'asset5', group: 5, workload: 'oracle'  },
    { id: 'asset6', group: 5,workload: 'sql' },
    { id: 'asset7', group: 5,workload: 'aix'  },
    { id: 'new asset', group: 5, workload: 'vm' },
  ],
  links: [
    { source: 'policy1', target: 'asset3', value: 8, },
    { source: 'policy1', target: 'asset4', value: 10 },
    {
      source: 'policy2',
      target: 'asset1',
      value: 5,
    },
    {
      source: 'policy2',
      target: 'asset2',
      value: 5,
    },

    { source: 'policy3', target: 'asset5', value: 8 },
    { source: 'policy3', target: 'asset6', value: 8 },
    { source: 'policy3', target: 'asset7', value: 8 },
  ],
};

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

// The force simulation mutates links and nodes, so create a copy
// so that re-evaluating this cell produces the same result.
const links = data.links.map((d) => ({ ...d }));
const nodes = data.nodes.map((d) => ({ ...d }));
const dlinks = d3.forceLink(links).id((d) => d.id)

dlinks.distance( (l) => l.value * 10)

// Create a simulation with several forces.
const simulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    dlinks
  )
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2))
  .on('tick', ticked);

// Create the SVG container.
const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', [0, 0, width, height])
  .attr('style', 'max-width: 100%; height: auto;');

// Add a line for each link, and a circle for each node.
const link = svg
  .append('g')
  .attr('stroke', '#999')
  .attr('stroke-opacity', 0.6)
  .selectAll()
  .data(links)
  .join('line')
  .attr('stroke-width', (d) =>5);

const node = svg
  .append('g')
  .attr('stroke', '#fff')
  .attr('stroke-width', 1.5)
  .selectAll()
  .data(nodes)
  .join('circle')
  .attr('r', (d) => d.group*5)
  .attr('fill', (d) => color(d.workload));
  
  node.append('title').text((d) => `${d.id}\n${d.workload || ''}`);


var text = svg.append("g")
    .attr("class", "labels")
  .selectAll("text")
    .data(nodes)
  .enter().append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text((d) => `${d.id}`);



// Add a drag behavior.
node.call(
  d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
);

// Set the position attributes of links and nodes each time the simulation ticks.
function ticked() {
  link
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);

  node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  text.attr('dx', (d) => d.x).attr('dy', (d) => d.y);

}

// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

// When this cell is re-run, stop the previous simulation. (This doesn’t
// really matter since the target alpha is zero and the simulation will
// stop naturally, but it’s a good practice.)

appDiv.append(svg.node());
