import {INVERT_Y_AXIS, NOISE_KERNEL} from '../Model/Constants.js'
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


function getHandsForTraining(handPoses, invertYAxis = INVERT_Y_AXIS){
  let hands = {};
  if (handPoses.multiHandedness !== undefined){
    for(const [i, hand] of handPoses.multiHandedness.entries()){
      hands[hand.label] = []
      for(const landmark of handPoses.multiHandLandmarks[i]){
        hands[hand.label].push([landmark.x, landmark.y, landmark.z])
      }
    }
  }
  return hands;
}

export{getHandsForTraining};

function isPointInRect(x, y, box){
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