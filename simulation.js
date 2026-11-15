export {
    currentReadings,
    slowReadings,
    updateFastReadings,
    updateActivityTime,
    updateStress,
    updateOxylevels,
    setSimulationMode,
    getSimulationMode,
    getHealthStatus
};




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
    warning: { low: [50, 59], high: [101, 120] },
    critical: { low: [35, 49], high: [121, 160] }
  },

  bp_sys: {
    warning: { low: [80, 89], high: [121, 139] },
    critical: { low: [50, 79], high: [140, 200] }
  },

  bp_dia: {
    warning: { low: [50, 59], high: [81, 89] },
    critical: { low: [30, 49], high: [90, 130] }
  },

  bs: {
    warning: { low: [54, 69], high: [141, 180] },
    critical: { low: [20, 53], high: [181, 400] }
  },

  bt: {
    warning: { low: [35.5, 36.0], high: [37.3, 38.0] },
    critical: { low: [30.0, 35.4], high: [38.1, 42.0] }
  },

  rad: {
    warning: { high: [0.3, 0.5] },
    critical: { high: [0.5, 3] }
  },

  ox: {
    warning: { low: [90, 94] },
    critical: { low: [50, 89] }
  },

  sh: {
    warning: { low: [5.0, 6.4], high: [9.1, 10.0] },
    critical: { low: [0, 4.9], high: [10.1, 24] }
  },

  sq: {
    warning: { low: [50, 74] },
    critical: { low: [0, 49] }
  },

  st: {
    warning: { high: [51, 74] },
    critical: { high: [75, 100] }
  },

  act: {
    warning: { low: [60, 119], high: [181, 240] },
    critical: { low: [0, 59], high: [241, 600] }
  }
};

const generators = {
  hr: createBoundedRandomGenerator(60, 100, 3),
  bp_sys: createBoundedRandomGenerator(100, 130, 2),
  bp_dia: createBoundedRandomGenerator(60, 85, 2),
  bs: createBoundedRandomGenerator(70, 140, 4),
  bt: createBoundedRandomGenerator(36.1, 37.5, 0.1, 1),
  rad: createBoundedRandomGenerator(0, 1, 0.1, 2),
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
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateReading(parameter) {
  const scenario = scenarios[parameter];

  if (
    (selectedParameter === parameter) &&
    simulationMode !== "normal"
  ) {
    const ranges = scenario[simulationMode];

    // Use the selected direction, or the only available direction
    const selectedRange = ranges[direction] ?? Object.values(ranges)[0];

    const [min, max] = selectedRange;

    // Preserve decimal values for applicable parameters
    const decimals = ["bt", "rad", "sh", "st"].includes(parameter) ? 1 : 0;
    const factor = 10 ** decimals;

    return (
      Math.floor(Math.random() * (max * factor - min * factor + 1)) +
      min * factor
    ) / factor;
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




const healthLimits = {
  hr: [60, 100],

  bp: {
    sys: [90, 130],
    dia: [60, 85]
  },

  bs: [70, 140],
  bt: [36.1, 37.5],
  rad: [0, 0.5],
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

  console.log(healthyCount)
}


getHealthStatus(currentReadings)


const SHARE_STATE_KEY = "auhm-shared-readings-v1";
const SHARE_HISTORY_KEY = "auhm-shared-history-v1";
const SHARE_SAMPLE_MS = 5 * 60 * 1000;   // one history sample every 5 minutes
const SHARE_HISTORY_LEN = 288;           // 288 x 5 min = 24 h

const shareParams = Object.keys(generators);
const shareDecimalParams = ["bt", "rad", "sh", "st"];
const shareListeners = new Set();

const shareStore = {
  read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // storage blocked or full: keep running without saving
    }
  }
};

function shareRound(parameter, value) {
  const factor = shareDecimalParams.includes(parameter) ? 10 : 1;
  return Math.round(value * factor) / factor;
}

// Limits used only to make up plausible history values
function shareLimits(parameter) {
  if (parameter === "bp_sys") return healthLimits.bp.sys;
  if (parameter === "bp_dia") return healthLimits.bp.dia;
  if (parameter === "act") return [90, 180];
  return healthLimits[parameter];
}

// A gentle random walk inside the limits
function shareWalk(parameter, start, count) {
  const [low, high] = shareLimits(parameter);
  const stepSize = (high - low) * 0.04;
  const out = [];
  let value = Number.isFinite(start) ? start : low + Math.random() * (high - low);

  for (let i = 0; i < count; i++) {
    value += (Math.random() * 2 - 1) * stepSize;
    value = Math.min(high, Math.max(low, value));
    out.push(shareRound(parameter, value));
  }
  return out;
}

let shareHistory = { data: {}, actDaily: [], last: Date.now() };

function shareLoadHistory() {
  const saved = shareStore.read(SHARE_HISTORY_KEY);
  const usable =
    saved &&
    Array.isArray(saved.actDaily) &&
    shareParams.every((p) => Array.isArray(saved.data && saved.data[p]));

  if (usable) {
    shareHistory = saved;

    // The app was closed for a while: continue the history for the time that passed
    const missed = Math.min(
      SHARE_HISTORY_LEN,
      Math.floor((Date.now() - saved.last) / SHARE_SAMPLE_MS)
    );
    if (missed > 0) {
      shareParams.forEach((p) => {
        const series = shareHistory.data[p];
        const more = shareWalk(p, series[series.length - 1], missed);
        shareHistory.data[p] = series.concat(more).slice(-SHARE_HISTORY_LEN);
      });
      shareHistory.last = Date.now();
      shareStore.write(SHARE_HISTORY_KEY, shareHistory);
    }
    return;
  }

  // First ever run: make up 24 h of history so the charts are not empty
  shareParams.forEach((p) => {
    shareHistory.data[p] = shareWalk(p, null, SHARE_HISTORY_LEN);
  });
  shareHistory.actDaily = shareWalk("act", null, 6);
  shareHistory.last = Date.now();
  shareStore.write(SHARE_HISTORY_KEY, shareHistory);
}

// Make each generator continue from a saved value instead of starting at a random one
function shareSeedGenerator(parameter, target) {
  for (let i = 0; i < 20000; i++) {
    if (generators[parameter]() === target) return true;
  }
  return false;
}

function shareRestoreReadings() {
  const saved = shareStore.read(SHARE_STATE_KEY);
  if (!saved || !saved.readings) return;

  shareParams.forEach((p) => {
    const value = saved.readings[p];
    if (!Number.isFinite(value)) return;
    shareSeedGenerator(p, value);
    currentReadings[p] = value;
  });

  if (Number.isFinite(saved.readings.act_time)) {
    activity.activeMinutes = saved.readings.act_time;
    currentReadings.act_time = saved.readings.act_time;
  }

  renderReadings(currentReadings);
}

function shareSnapshot() {
  return { readings: { ...currentReadings } };
}

export function subscribe(listener) {
  shareListeners.add(listener);
  listener(shareSnapshot());
  return () => shareListeners.delete(listener);
}

export function getHistory() {
  return { history: shareHistory.data, actDaily: shareHistory.actDaily };
}

let shareLastJSON = "";

function shareTick() {
  const json = JSON.stringify(currentReadings);

  if (json !== shareLastJSON) {
    shareLastJSON = json;
    shareStore.write(SHARE_STATE_KEY, { readings: currentReadings, ts: Date.now() });

    const snapshot = shareSnapshot();
    shareListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error(error);
      }
    });
  }

  if (Date.now() - shareHistory.last >= SHARE_SAMPLE_MS) {
    shareParams.forEach((p) => {
      shareHistory.data[p].push(currentReadings[p]);
      if (shareHistory.data[p].length > SHARE_HISTORY_LEN) shareHistory.data[p].shift();
    });
    shareHistory.last = Date.now();
    shareStore.write(SHARE_HISTORY_KEY, shareHistory);
  }
}

shareLoadHistory();
shareRestoreReadings();
setInterval(shareTick, 250);