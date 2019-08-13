'use strict';

let start
function elapsed () {
  const now = process.hrtime()
  return (now[0] - start[0]) * 1000 + Math.floor((now[1] - start[1]) / 1000000);
}

const measurements = []

function mean () {
  return Math.floor(measurements.reduce((total, value) => total + value, 0) / measurements.length)
}

function stdDeviation () {
  const currentMean = mean()
  return Math.floor(Math.sqrt(measurements.reduce((total, value) => total + Math.pow(value - currentMean, 2), 0) / measurements.length))
}

function stdError () {
  return Math.floor(stdDeviation() / Math.sqrt(measurements.length))
}

while (true || measurements.length < 60) {
  let loops = 0
  start = process.hrtime()
  let duration = elapsed()
  while(duration < 1000) {
      ++loops
      duration = elapsed()
  }
  measurements.push(loops)
  console.log(measurements.length.toString().padStart(4, '0'),
    loops.toString().padStart(8, ' '),
    'mean: ', mean().toString().padStart(8, ' '),
    'stdDev: ', stdDeviation().toString().padStart(6, ' '),
    'stdErr: ', stdError().toString().padStart(6, ' ')
  );
}
