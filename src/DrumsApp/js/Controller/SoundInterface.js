import {AUDIO_FILES, MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT} from '../Model/Constants.js'
class SoundInterface{
    constructor(soundBoxes){
        this.audios = [];
        for (const [idx, obj] of Object.entries(soundBoxes)){
            const audio = obj["audio"];
            audio.onplay = () => {this.audios[idx].shift();}
            audio.onended = () => {this.audios[idx].push(audio);}
            this.audios[idx] = [audio];
            for(let i=0; i < MAXIMUM_SIMULTANEOUS_AUDIOS_PER_INSTRUMENT-1; i++){
                const audio2 = audio.cloneNode(true);
                audio2.onplay = () => {this.audios[idx].shift();}
                audio2.onended = () => {this.audios[idx].push(audio2);}
                this.audios[idx].push(audio2);
            }
        }
    }

    async playSound(idx){
        this.audios[idx][0].play();
    }
}
export {SoundInterface};