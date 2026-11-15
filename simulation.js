const bpcard = document.getElementById("t-bp")
const actcard = document.getElementById("t-act")
const BpPlaceholderParent = bpcard.querySelector(".val")
const ActPlaceholderParent = actcard.querySelector(".val")

BpPlaceholderParent.innerHTML=`
  <div>
    <b data-reading="bp_sys">-</b>
    <b>/</b>
    <b data-reading="bp_dia">-</b>
    <span>mmHg</span>
  </div>
`
ActPlaceholderParent.innerHTML=`
  <div>
    <b data-reading="act_time">-</b>
    <span>min</span>
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
let currentReadings = {};
const scenarios = {
  hr: {
    warning:  { low: [50, 59],     high: [101, 120] },
    critical: { low: [35, 49],     high: [121, 160] }
  },

  bp_sys: {
    warning:  { low: [80, 89],     high: [121, 139] },
    critical: { low: [50, 79],     high: [140, 200] }
  },

  bp_dia: {
    warning:  { low: [50, 59],     high: [81, 89] },
    critical: { low: [30, 49],     high: [90, 130] }
  },

  bs: {
    warning:  { low: [54, 69],     high: [141, 180] },
    critical: { low: [20, 53],     high: [181, 400] }
  },

  bt: {
    warning:  { low: [35.5, 36.0], high: [37.3, 38.0] },
    critical: { low: [30.0, 35.4], high: [38.1, 42.0] }
  },

  rad: {
    warning:  { high: [1.1, 4.0] },
    critical: { high: [4.1, 25] }
  },

  ox: {
    warning:  { low: [90, 94] },
    critical: { low: [50, 89] }
  },

  sh: {
    warning:  { low: [5.0, 6.4],   high: [9.1, 10.0] },
    critical: { low: [0, 4.9],     high: [10.1, 24] }
  },

  sq: {
    warning:  { low: [50, 74] },
    critical: { low: [0, 49] }
  },

  st: {
    warning:  { high: [51, 74] },
    critical: { high: [75, 100] }
  },

  act: {
    warning:  { low: [60, 119],    high: [181, 240] },
    critical: { low: [0, 59],      high: [241, 600] }
  }
};

const generators = {
  hr: createBoundedRandomGenerator(60, 100, 3),
  bp_sys: createBoundedRandomGenerator(100, 130, 2),
  bp_dia: createBoundedRandomGenerator(60, 85, 2),
  bs: createBoundedRandomGenerator(70, 140, 4),
  bt: createBoundedRandomGenerator(36.1, 37.5, 0.1, 1),
  rad: createBoundedRandomGenerator(0, 27, 1.5, 1),
  ox: createBoundedRandomGenerator(95, 100, 1),
  sh: createBoundedRandomGenerator(7, 9, 0.2, 1),
  sq: createBoundedRandomGenerator(70, 100, 2),
  st: createBoundedRandomGenerator(0, 6, 0.2, 1),
  act: createBoundedRandomGenerator(90, 180, 5)
};


const fastParameters = [
    "hr",
    "bp_sys",
    "bp_dia",
    "bs",
    "bt",
  ];
  
  const slowReadings = {
    rad: 0,
    st: 2,
    sh: 8,
    sq: 85,
    act: 0,
    ox: 95
};

let simulationMode = "normal";
let selectedParameter = "hr";

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + 1) + min;
}

function generateReading(parameter, direction = "low") {
    const scenario = scenarios[parameter];

    if (
        selectedParameter === parameter &&
        simulationMode !== "normal" &&
        scenario?.[simulationMode]
    ) {
        const [min, max] = scenario[simulationMode][direction];

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



function generateAllReadings() {
  const readings = {};
  
  for (const parameter in generators) {
    readings[parameter] = generateReading(parameter);
  }
  
  return readings;
}

currentReadings = generateAllReadings();

const activity = {
    score: currentReadings.act,
    activeMinutes: 73
};

setSimulationMode("normal", "hr");

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

function updateFastReadings() {
  fastParameters.forEach(parameter => {
    currentReadings[parameter] = generateReading(parameter);
  });
  
  renderReadings(currentReadings);
}

function updateActivityTime() {
    activity.activeMinutes++;

    currentReadings.act_time = activity.activeMinutes;

    renderReadings(currentReadings);
}
function updateStress() {
  slowReadings.st = generators.st();
  currentReadings.st = slowReadings.st;
  
  renderReadings(currentReadings);
}
function updateOxylevels() {
  slowReadings.ox = generators.ox();
  currentReadings.ox = slowReadings.ox;
  
  renderReadings(currentReadings);
}

updateActivityTime()

setInterval(updateFastReadings, 2000);

setInterval(updateActivityTime, 6000);

setInterval(updateStress, 60000);
setInterval(updateOxylevels, 2000);

setInterval(() => {
  const readings = (updateFastReadings());
  renderReadings(readings)
}, 1000);

const allcards = document.querySelectorAll(".tile")

allcards.forEach((card)=>{
  const readingplaceholder = card.querySelectorAll("b")
const awaitedtext = card.querySelector("em")
  if(readingplaceholder.innerText != "-"){
     awaitedtext.style.opacity = 0
  }
})


const healthLimits = {
    hr: [60, 100],

    bp: {
        sys: [90, 130],
        dia: [60, 85]
    },

    bs: [70, 140],
    bt: [36.1, 37.5],
    rad: [0, 23.5],
    ox: [95, 100],
    sh: [7, 9],
    sq: [70, 100],
    st: [0, 6],
    act: [60, 100]
};

function getHealthStatus(readings) {
    let healthyCount = 0;

    const inRange = (value, limits) =>
        value >= limits[0] && value <= limits[1];

    if (inRange(readings.hr, healthLimits.hr))
        healthyCount++;

    if (
        inRange(readings.bp_sys, healthLimits.bp.sys) &&
        inRange(readings.bp_dia, healthLimits.bp.dia)
    ) healthyCount++;

    ["bs", "bt", "rad", "ox", "sh", "sq", "st", "act"]
        .forEach(parameter => {
            if (inRange(readings[parameter], healthLimits[parameter])) {
                healthyCount++;
            }
        });

    return healthyCount;
}

function getBodyColor(healthyCount) {
    const colors = {
        10: "#16A34A",
        9: "#65A30D",
        8: "#CA8A04",
        7: "#EA580C",
        6: "#DC2626"
    };

    return colors[Math.min(healthyCount, 10)] || "#DC2626";
}

function updateBodyFigure(readings) {
    const healthyCount = getHealthStatus(readings);
    const color = getBodyColor(healthyCount);

    document.querySelectorAll("#bodyFigure .body-fill")
        .forEach(part => {
            part.style.fill = color;
        });
}