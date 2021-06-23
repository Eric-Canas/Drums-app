let iconCorrespondeces = [{"img_name" : 'drum.png',
                             "sounds" : ['bum', 'bom', 'bam'],
                             "default_sound" : "bum"},
                             {"img_name" : 'hihat.png',
                             "sounds" : ['hihat', 'tsss'],
                              "default_sound" : "hihat"
                            }
                            ];
const assignSoundButtonID = "AssingSoundButton";
const acceptedImgTypes = "image/*";
const acceptedAudio = "audio/mp3";
//All these variables will have access to the canvas "this"
const assignOptions = {"Delete" : {"onclick" : deleteCallback},
                       "Assign Sound" : {"onclick" : openAssignSoundMenuClick, "onmouseenter" : openAssignSoundMenuEnter,
                                        "onmouseout" : assignMenuOnMouseOut, "assignID" : assignSoundButtonID}
                      };

let soundCorrespondences = {'bum' : 'drum1.mp3', 'bom' : 'drum1.mp3', 'bam' : 'drum1.mp3', 'hihat' : 'drum1.mp3', 'tssss' : 'drum1.mp3'};


function deleteCallback(event){
    //Selected object is always at the last position of placed objects 
     this.placedObjects.pop();
     this.close()
 }

function openAssignSoundMenuClick(event){
    //Do Nothing
}

function openAssignSoundMenuEnter(event){
    if(this.assignSoundMenu.style.display === 'none' || this.assignSoundMenu.style.display === ''){
        this.openAssignSoundMenu()
    }
}

function assignMenuOnMouseOut(event){
    if(!event.toElement.classList.contains("sound")){
        this.removeMenuContent(this.assignSoundMenu);
    }
}

function reproduceSound(soundID, path='resources'){
    console.log(soundID);
    const sound = new Audio(`${path}/${soundCorrespondences[soundID]}`);
    sound.play();
}