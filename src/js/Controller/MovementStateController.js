import {HIT_WINDOW, RIGHT, LEFT, ROUGH_EPSION, MIN_TOP_TO_BOTTOM_HIT_DISTANCE} from "../Model/Constants.js";
import {HitNet} from "../Model/HitNet.js"

class MovementStateController{
    constructor(soundInterface, onStateUpdatedCallbacks = []){
        this.maxQueueLength = HIT_WINDOW;
        this.HitNet = new HitNet();
        this.handTrack = {}; this.handTrack[RIGHT] = []; this.handTrack[LEFT] = [];
        this.withoutDetections = {}; this.withoutDetections[RIGHT] = 0; this.withoutDetections[LEFT] = 0;
        this.soundInterface = soundInterface;
        this.onStateUpdatedCallbacks = onStateUpdatedCallbacks;
    }

    /*Pushes a pose in the buffer and calls all the callbacks*/
    async updateState(pose, fullHands){
        // Include them in the queue
        for (const hand of [RIGHT, LEFT]){
            if(hand in fullHands){
                this.handTrack[hand].push(fullHands[hand].flat());
                if (this.handTrack[hand].length > this.maxQueueLength) {
                    this.handTrack[hand].shift();
                    this.isHit(this.handTrack[hand], 'hihat');
                }
                this.withoutDetections[hand] = 0;
            } else {
                if(this.handTrack[hand].length > 0 && this.withoutDetections[hand] > 1){
                    this.handTrack[hand] = [];
                }else{
                    this.withoutDetections[hand]++;
                }
            }
        }
    }


    async isHit(array, sound='hihat'){  
       if(this.HitNet.isHit(array)){  
            this.soundInterface.playSound(sound);
            return true;
       }else{
           return false;
       }
    }

}

export {MovementStateController};