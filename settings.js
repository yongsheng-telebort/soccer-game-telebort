const screenWidth = 1880;
const screenHeight = 1008;
const settings = {
  playerSize: Math.sqrt(screenWidth * screenHeight) * 0.001,
  computerSize: Math.sqrt(screenWidth * screenHeight) * 0.001,
  ballSize: Math.sqrt(screenWidth * screenHeight) * 0.001,
  playerThrust: 0.01,
  computerThrust: 0.01,
  playerMass: 1,
  computerMass: 1,
  ballMass: 0.01,
  friction: 0.25,
  restitution: 0.8
}

export{screenWidth, screenHeight, settings}