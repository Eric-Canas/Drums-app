import {HIT_WINDOW, RIGHT, LEFT, ROUGH_EPSION, MIN_TOP_TO_BOTTOM_HIT_DISTANCE} from "../Model/Constants.js";
import {splineFromArray} from "../Helpers/Utils.js"
import {HitNet} from "../Model/HitNet.js"

class MovementStateController{
    constructor(soundInterface, onStateUpdatedCallbacks = [], generateDatasetMode = false){
        this.maxQueueLength = HIT_WINDOW;
        this.HitNet = new HitNet();
        this.rightHandTrack = [];
        this.leftHandTrack = [];
        this.soundInterface = soundInterface;
        this.onStateUpdatedCallbacks = onStateUpdatedCallbacks;
        this.generateDatasetMode = generateDatasetMode
    }

    /*Pushes a pose in the buffer and calls all the callbacks*/
    async updateState(pose, fullHands){
        if(RIGHT in fullHands){
            this.rightHandTrack.push(fullHands[RIGHT].flat());
            if (this.rightHandTrack.length > this.maxQueueLength) {
                this.rightHandTrack.shift();
                this.isHit(this.rightHandTrack, 'drum');
            }
        } else {
            this.rightHandTrack = []
        }

        if(LEFT in fullHands){
            this.leftHandTrack.push(fullHands[LEFT].flat());
            if (this.leftHandTrack.length > this.maxQueueLength) {
                this.leftHandTrack.shift();
                this.isHit(this.leftHandTrack, 'hihat');
            }
        } else {
            this.leftHandTrack = []
        }

        for (const callback of this.onStateUpdatedCallbacks){
            callback(pose);
        }
    }


    async isHit(array, sound='hihat', splineFirst = false){
        /*
        if(splineFirst){
            array = splineFromArray(array)
        }
        //It should be improved, but, by the moment lets considerate that a sure hit is determined by half+1 frames decreasing and half frames increasing
        for(let i = 1; i<array.length; i++){
            const decreasing = array[i-1]+ROUGH_EPSION>array[i];
            const increasing = array[i-1]-ROUGH_EPSION<array[i];
            if(!((decreasing && i<array.length/2) || (increasing && i>array.length/2))){
                if(i > 1+array.length/2){
                    if (this.generateDatasetMode){
                        console.log(alert('Was it a hit?'))
                    }
                    console.log("NOT HIT: ");
                    console.log(array);
                }
                return false;
            }
        }
        if(math.max(array) > (math.min(array)+MIN_TOP_TO_BOTTOM_HIT_DISTANCE)){
            if (this.generateDatasetMode){
                console.log(alert('Was it a hit?'))
            }
            console.log("HIT: ");
            console.log(array);
        */  
       if(this.HitNet.isHit(array)){  
        this.soundInterface.playSound(sound);
        return true;
       } else{
           return false;
       }

    }

}

export {MovementStateController};