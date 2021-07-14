import {WEBCAM_CANVAS_ID, WEBCAM_FRAME_ID} from "../Model/Constants.js";

class WebcamCanvas{
    constructor(webcamController, webcamCanvasID=WEBCAM_CANVAS_ID){
        this.webcam = webcamController;
        this.canvas = document.getElementById(webcamCanvasID);
        this.context = this.canvas.getContext('2d');
        this.webcam.videoStream.addEventListener('loadedmetadata', this.adaptSize.bind(this), false);
        window.onresize = this.adaptSize.bind(this);
    }

    adaptSize(){
        let videoRect = this.getVideoRect();
        this.canvas.style.height = videoRect.height+'px';
        this.canvas.style.width = videoRect.width+'px';
        // I don't know why. But if I don't redefine the canvas style first, it doesn't work
        videoRect = this.getVideoRect();
        this.canvas.style.height = videoRect.height+'px';
        this.canvas.style.width = videoRect.width+'px';
        this.canvas.style.left = videoRect.left+'px';
        this.canvas.style.top = videoRect.top+'px';

    }

    getVideoRect(){
        const video = this.webcam.videoStream;
        const videoRect = video.getBoundingClientRect();
        const videoRatio = video.videoWidth / video.videoHeight;
        // The width and height of the whole video element
        let width = video.offsetWidth, height = video.offsetHeight;
        // The top and left corners of the full rect (including the video and pads)
        let [top, left] = [videoRect.top, videoRect.left];
        // The ratio of the whole video element
        let elementRatio = width/height;
        
        // If the pad is in the width
        if(elementRatio > videoRatio){
             width = height * videoRatio;
             const x_center = video.offsetLeft + (videoRect.width/2);
             left = Math.ceil(x_center - width/2)
        // if the pad is in the height (or there is no pad)
        } else {
             height = width / videoRatio;
             const y_center = video.offsetTop + (videoRect.height/2);
             top = Math.ceil(y_center - height/2)
        }
        return {
            width: width,
            height: height,
            left : left,
            top : top
        };
    }
    clearCanvas(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPoint(x, y, radius, color){
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = color;
        this.context.fill();
    }

    drawSegment([ax, ay], [bx, by], color, lineWidth) {
        this.context.beginPath();
        this.context.moveTo(ax, ay);
        this.context.lineTo(bx, by);
        this.context.lineWidth = lineWidth;
        this.context.strokeStyle = color;
        this.context.stroke();
    }

    drawImage(img, x, y, width, height){
        const canvas_min_dim = Math.min(this.canvas.width, this.canvas.height);
        this.context.drawImage(img, x*this.canvas.width, y*this.canvas.height, width*canvas_min_dim, height*canvas_min_dim);
    }
}

export {WebcamCanvas}