// details.js
// Feeds the shared simulation (same numbers as the dashboard) into the details page.
// window.AUHM.feed() is defined by the inline script in details.html.
import { subscribe, getHistory } from "./simulation.js";

subscribe(({ readings }) => {
  const { history, actDaily } = getHistory();
  window.AUHM.feed({ readings, history, actDaily });
});

