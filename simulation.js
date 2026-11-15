const bpcard = document.getElementById("t-bp")
const BpPlaceholderParent = bpcard.querySelector(".val")

BpPlaceholderParent.innerHTML=`
  <div>
    <b data-reading="bp_sys">-</b>
    <b>/</b>
    <b data-reading="bp_dia">-</b>
    <span>mmHg</span>
  </div>
`

function createBoundedRandomGenerator(min, max, step, decimals = 0) {
  let previous = null;
  const factor = 10 ** decimals;

  min = Math.round(min * factor);
  max = Math.round(max * factor);
  step = Math.round(step * factor);

  return function () {
    if (previous === null) {
      previous = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      const low = Math.max(min, previous - step);
      const high = Math.min(max, previous + step);

      previous = Math.floor(Math.random() * (high - low + 1)) + low;
    }

    return previous / factor;
  };
}

const scenarios = {
  hr: {
    warning: { min: 50, max: 59 },
    critical: { min: 35, max: 49 }
  },

  bp_sys: {
    warning: { min: 131, max: 139 },
    critical: { min: 140, max: 160 }
  },

  bp_dia: {
    warning: { min: 86, max: 89 },
    critical: { min: 90, max: 110 }
  },

  bs: {
    warning: { min: 35, max: 41.7 },
    critical: { min: 41.8, max: 50 }
  },
  bt: {
    warning: { min: 50, max: 59 },
    critical: { min: 35, max: 49 }
  },

  rad: {
    warning: { min: 90, max: 94 },
    critical: { min: 80, max: 89 }
  },

  ox: {
    warning: { min: 35, max: 41.7 },
    critical: { min: 41.8, max: 50 }
  },
  sh: {
    warning: { min: 35, max: 41.7 },
    critical: { min: 41.8, max: 50 }
  },
  sq: {
    warning: { min: 50, max: 59 },
    critical: { min: 35, max: 49 }
  },

  st: {
    warning: { min: 90, max: 94 },
    critical: { min: 80, max: 89 }
  },

  act: {
    warning: { min: 35, max: 41.7 },
    critical: { min: 41.8, max: 50 }
  }
};

const generators = {
  hr: createBoundedRandomGenerator(60, 100, 3),
  bp_sys: createBoundedRandomGenerator(100, 130, 2),
  bp_dia: createBoundedRandomGenerator(60, 85, 2),
  bs: createBoundedRandomGenerator(70, 140, 4),
  bt: createBoundedRandomGenerator(36.1, 37.5, 0.1, 1),
  rad: createBoundedRandomGenerator(0, 41.7, 1.5, 1),
  ox: createBoundedRandomGenerator(95, 100, 1),
  sh: createBoundedRandomGenerator(7, 9, 0.2, 1),
  sq: createBoundedRandomGenerator(70, 100, 2),
  st: createBoundedRandomGenerator(0, 6, 0.2, 1),
  act: createBoundedRandomGenerator(90, 180, 5)
};

let simulationMode = "normal";
let selectedParameter = "hr";

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + 1) + min;
}

function generateReading(parameter) {
  const scenario = scenarios[parameter];

  if (
    selectedParameter === parameter &&
    simulationMode !== "normal" &&
    scenario?.[simulationMode]
  ) {
    const { min, max } = scenario[simulationMode];

    return randomNumber(min, max);
  }

  return generators[parameter]();
}



function setSimulationMode(mode, parameter = "hr") {
  const validModes = ["normal", "warning", "critical"];

  if (!validModes.includes(mode)) {
    throw new Error("Invalid simulation mode");
  }

  simulationMode = mode;
  selectedParameter = parameter;
}

function getSimulationMode() {
  return {
    mode: simulationMode,
    parameter: selectedParameter
  };
}

setSimulationMode("critical", "hr");


function generateAllReadings() {
  const readings = {};

  for (const parameter in generators) {
    readings[parameter] = generateReading(parameter);
  }

  return readings;
}

setSimulationMode("critical", "hr");

const readings = (generateAllReadings());

function renderReadings(readings) {
    for (const parameter in readings) {
        const elements = document.querySelectorAll(
            `[data-reading="${parameter}"]`
        );

        elements.forEach(element => {
            element.textContent = readings[parameter];
        });
    }
}

renderReadings(readings)

setInterval(() => {
    const readings = generateAllReadings();
    renderReadings(readings);
}, 2000);