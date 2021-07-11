import {INVERT_Y_AXIS, DRAWN_POINTS_RADIUS,
        TRANSPARENT_RED, TRANSPARENT_WHITE, TRANSPARENT_BLUE} from "../Model/Constants.js";

class CanvasPainter{
    constructor(webcamCanvas){
        this.webcamCanvas = webcamCanvas;
    }
    
    drawPose(pose, invertYAxis = INVERT_Y_AXIS, pointsRadius = DRAWN_POINTS_RADIUS){
        //TODO: Improve it
        const width = this.webcamCanvas.canvas.width;
        const height = this.webcamCanvas.canvas.height;
        this.webcamCanvas.clearCanvas(width, height);
        for (const [part, position] of Object.entries(pose)){
            this.webcamCanvas.drawPoint(position.x*width, (invertYAxis-position.y)*height, pointsRadius, TRANSPARENT_RED);
        }
    }

    selectColorForPart(part){
    const std = this.movementStateController.std[this.movementStateController.std.length-1][part];
    const i = (((std.x + std.y)/2) * 255 / 0.5);
    const r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128);
    const g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128);
    const b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
    /* //Version for going from green to red
    const i = 128 - (((std.x + std.y)/2) * 128 / (0.5));
    return 'hsl(' + i + ',100%,50%)';
    */
    }
}
export{CanvasPainter};