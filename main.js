const bpcard = document.getElementById("t-bp")
const actcard = document.getElementById("t-act")
const BpPlaceholderParent = bpcard.querySelector(".val")
const ActPlaceholderParent = actcard.querySelector(".val")

// const bodyif = document.querySelector("#bodyfigure")
const bodyif = document.querySelector("path")

const notificationcard = document.getElementById("notification")

let applyToAll = false;


let direction = "low"

const directionController = document.getElementById("directioncontrol")
const ParameterController = document.getElementById("parameterselector")
const ModeController = document.getElementById("modeselector")

// let selectedDirection = directionController.value || "low";

// directionController.addEventListener("change", () => {
//   selectedDirection = directionController.value;
// });

// ParameterController.addEventListener("click", () => {
//   if(ParameterController.value === "all"){
//     applyToAll = true
//   }else(ParameterController.value !== "all")
//   {
//     applyToAll = false
//   }
// });

BpPlaceholderParent.innerHTML = `
  <div>
    <b data-reading="bp_sys">-</b>
    <b>/</b>
    <b data-reading="bp_dia">-</b>
    <span>mmHg</span>
  </div>
`
// ActPlaceholderParent.innerHTML = `
//   <div>
//     <b data-reading="act_time">-</b>
//     <span>min</span>
//   </div>
// `

// Fix: use querySelector instead of querySelectorAll
const allcards = document.querySelectorAll(".tile")



function callNotification(start, param, end){
  const textarea = document.getElementById("textarea")
  textarea.innerText = start + param + end

  // Fix typo: changed 'noti-acitve' to 'noti-active' to match CSS
  notificationcard.classList.add("noti-active")
  notificationcard.style.opacity = 1 // Ensure visibility when triggered
    
  setTimeout(() => {
    notificationcard.classList.remove("noti-active")
    notificationcard.style.opacity = 0
  }, 3000); 
}

// ModeController.addEventListener("change", () => {
//   setSimulationMode(
//     ModeController.value,
//     ParameterController.value
//   );
// });


// ParameterController.addEventListener("change", () => {
//   setSimulationMode(
//     ModeController.value,
//     ParameterController.value
//   );

// // });

// if (ParameterController.value === "all") {
//   setSimulationMode(
//     ModeController.value,

//   )
// }

// directionController.addEventListener("input", () => {
//   direction = directionController.value
// })


import { subscribe } from "./simulation.js";

// Listen directly to the simulation feed so it triggers whenever readings update
subscribe(({ readings }) => {
  const radiationValue = readings.rad;
  

  if (radiationValue === undefined || radiationValue === null) return;

  if (radiationValue >= 25) {
    callNotification("The radiation levels are crossing the daily limit.", " Take immediate steps, enter the storm shelter.", "");
    
    if (bodyif) {
      bodyif.style.fill = "red";
      bodyif.style.stroke = "red";
    }
    document.body.style.backgroundColor = "rgb(23, 4, 4)";
    
    document.querySelectorAll(".tile").forEach(tile => {
        tile.style.backgroundColor = "rgb(49, 6, 6)";
    });
} 
else if (radiationValue >= 18 && radiationValue < 21) {
    callNotification("The radiation levels are near the daily limit.", " Take precautions and be careful.", "");
    if (bodyif) {
        bodyif.style.fill = "yellow";
        bodyif.style.stroke = "yellow";
    }
} 
else if (radiationValue >= 21 && radiationValue < 25) {
    callNotification("The radiation levels are near the daily limit.", " Take precautions and be careful.", "");
    if (bodyif) {
        bodyif.style.fill = "rgb(255, 159, 159)";
        bodyif.style.stroke = "rgb(255, 192, 192)";
    }
} 
else {
    if (notificationcard) {
        notificationcard.style.opacity = 0;
    }
    document.body.style.background = "radial-gradient(900px 480px at 85% -10%, rgba(80, 120, 255, .10)";
  }
});
