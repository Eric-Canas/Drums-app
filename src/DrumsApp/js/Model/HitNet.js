
import {IS_HIT_CONFIDENCE_THRESHOLD, HIT_NET_PATH} from './Constants.js'


class HitNet{
    constructor(){
        this.jsonFile = document.getElementById("json");
        this.binFile = document.getElementById("bin");
        this.hitNet = null;
        //this.jsonFile.onchange = () => this._loadModel();
        this.binFile.onchange = () => this._loadModel();
    }
    async _loadModel(){
        this.hitNet = await tf.loadLayersModel(tf.io.browserFiles(
            [this.jsonFile.files[0], this.binFile.files[0]]));
        console.log("HitNet Charged");
    }

    isHit(x, threshold = IS_HIT_CONFIDENCE_THRESHOLD) {
        if(this.hitNet !== null){
            const tensor = tf.tensor3d([x]);// [] for declaring a first batch dimension of size 1
            let prediction = this.hitNet.predict(tensor);
            prediction = prediction.dataSync()[0];
            console.log(prediction);
            console.log(prediction > threshold)
            return prediction > threshold;
        } else {
            return false;
        }

    }
}

export {HitNet};