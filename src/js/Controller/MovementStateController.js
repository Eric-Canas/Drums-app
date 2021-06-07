import {MAX_FREQUENCY_IN_FRAMES, NOISE_KERNEL, HIT_WINDOW, RIGHT, LEFT, ROUGH_EPSION, MIN_TOP_TO_BOTTOM_HIT_DISTANCE} from "../Model/Constants.js";
import {splineFromArray} from "../Helpers/Utils.js"

class MovementStateController{
    constructor(soundInterface, onStateUpdatedCallbacks = [], generateDatasetMode = false){
        this.maxQueueLength = HIT_WINDOW;
        this.rightHandTrack = [];
        this.leftHandTrack = [];
        this.soundInterface = soundInterface;
        this.onStateUpdatedCallbacks = onStateUpdatedCallbacks;
        this.generateDatasetMode = generateDatasetMode
    }

    /*Pushes a pose in the buffer and calls all the callbacks*/
    async updateState(pose, fullHands){
        if(RIGHT in pose){
            this.rightHandTrack.push(pose[RIGHT].y);
            if (this.rightHandTrack.length > this.maxQueueLength) {
                this.rightHandTrack.shift();
                this.isHit(this.rightHandTrack, 'drum');
            }
        } else {
            this.rightHandTrack = []
        }

        if(LEFT in pose){
            this.leftHandTrack.push(pose[LEFT].y);
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
    //TODO: Improve this shit
    async isHit(array, sound='hihat', splineFirst = false){
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
            this.soundInterface.playSound(sound);
            return true;
        } else {
            return false;
        }
    }

}

export {MovementStateController};