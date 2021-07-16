import {INVERT_Y_AXIS, INVERT_X_AXIS, NOISE_KERNEL, LEFT, RIGHT, ARRAY_LEN} from '../Model/Constants.js'

const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]

const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))


function mapValue(x, in_min, in_max, out_min = 0, out_max = 1) {
  x = x < in_min? in_min : x;
  x = x > in_max? in_max : x;
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
export {mapValue};

function pathJoin(parts, sep){
  var separator = sep || '/';
  var replace = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}

var last_hands = {LEFT : new Array(ARRAY_LEN).fill((INVERT_X_AXIS? 0. : 1.)),  RIGHT : new Array(ARRAY_LEN).fill((INVERT_X_AXIS? 1. : 0.))};

function getHandsForTraining(handPoses, invertYAxis = INVERT_Y_AXIS){
  let hands = {};
  if (handPoses.multiHandedness !== undefined){
    for(const [i, hand] of handPoses.multiHandedness.entries()){
      const label = hand.label.toUpperCase();
      hands[label] = []
      for(const landmark of handPoses.multiHandLandmarks[i]){
        hands[label].push([landmark.x, landmark.y, landmark.z])
      }
    }
  }
  //hands = reorderHandsByProximity(hands);
  return hands;
}

export{getHandsForTraining};

function reorderHandsByProximity(new_hands){

  let output = {}
  const new_hands_length = Object.keys(new_hands).length
  if (new_hands_length === 2){
    const left_hand = new_hands[LEFT].flat();
    const right_hand = new_hands[RIGHT].flat();
      // Get the distance to each last hand
    const distances = [math.sum(math.abs(math.subtract(left_hand, last_hands[LEFT]))), math.sum(math.abs(math.subtract(left_hand, last_hands[RIGHT]))),
                 math.sum(math.abs(math.subtract(right_hand, last_hands[LEFT]))), math.sum(math.abs(math.subtract(right_hand, last_hands[RIGHT])))];
    const best_prediction = argMin(distances);
    switch (best_prediction){
      case 0:
      case 3:
        output = {LEFT : new_hands[LEFT], RIGHT : new_hands[RIGHT]};
        last_hands = {LEFT : left_hand, RIGHT : right_hand};
        break;
      case 1:
      case 2:
        output = {RIGHT : new_hands[LEFT], LEFT : new_hands[RIGHT]};
        last_hands = {RIGHT : left_hand, LEFT : right_hand};
        break;
    }
  } else if (new_hands_length === 1){
    const hand = Object.values(new_hands)[0];
    const flat_hand = hand.flat()
    const distance_to_left = math.sum(math.abs(math.subtract(flat_hand, last_hands[LEFT])));
    const distance_to_right = math.sum(math.abs(math.subtract(flat_hand, last_hands[RIGHT])));
    const closest_hand = distance_to_left < distance_to_right? LEFT : RIGHT;
    output[closest_hand] = hand;
    last_hands[closest_hand] = flat_hand; 
  }
  return output;
}

function isPointInRect(x, y, box, invertX = INVERT_X_AXIS){
  x = invertX? 1-x : x;
    //Box is organized as x, y, height, width
  const [xBox, yBox, widthBox, heightBox] = box;

  return x > xBox && x <= xBox + widthBox &&
               y > yBox && y <= yBox + heightBox;

}
export {isPointInRect}

function splineFromArray(array, kernel_size = NOISE_KERNEL){
    if(NOISE_KERNEL <= 1){return array;}
    let output = [];
    const left_pad = math.floor((kernel_size-1)/2);
    const right_pad = math.floor((kernel_size)/2);
    for(let i = left_pad; i < array.length-right_pad; i++){
        output.push(math.mean(array.slice(i-left_pad, i+right_pad+1)));
    }
    return output;
}
export{splineFromArray};

function saveFile(encodedHref, fileName='fileName.txt', type='text/plain', notOverride = true){
  let element = document.createElement("a");
  element.href = encodedHref;
  if (notOverride){
    const fileNameParts = fileName.split('.');
    if (fileNameParts.length != 2){
      throw "FileName error, unable to save data"
    }
    fileName = fileNameParts[0]+Math.floor(Math.random() * 999999999)+'.'+fileNameParts[1]
  }
  element.download = fileName;
  element.click();
}

function saveJSON(JSONObject, fileName='session.json', type='text/plain', notOverride = true){
  const file = new Blob([JSON.stringify(JSONObject)], {type: type});
  saveFile(URL.createObjectURL(file), fileName, type, notOverride)

}
export {saveJSON};