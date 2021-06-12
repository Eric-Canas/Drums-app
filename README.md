# Drums-io
Play Drums in your Browser.

Drums.io allows you to simulate in your browser any percussion instrument, by using only your WebCam. All machine learning models run locally, so any user information is sent to the server.  
This web application is built with <a href="https://google.github.io/mediapipe/getting_started/javascript.html" target="_blank"><img alt="MediPipe" title="MediPipe" src="https://raw.githubusercontent.com/google/mediapipe/master/docs/images/mediapipe_small.png" height=15></a> and <a href=https://www.tensorflow.org/js target="_blank"><img alt="TensorFlow.js" title="TensorFlow.js" src="https://img.shields.io/static/v1?label=&message=Tensorflow.js&color=FF6000&logo=TensorFlow&logoColor=FFFFFF" height=18></a>.  
The pipeline uses two Machine Learning models.
<ul>
  <li> <a href="https://google.github.io/mediapipe/solutions/hands#javascript-solution-api" target="_blank"><b>Hands Model</b></a>: A Computer Vision model offered by <a href="https://google.github.io/mediapipe/getting_started/javascript.html" target="_blank"><img alt="MediPipe" title="MediPipe" src="https://raw.githubusercontent.com/google/mediapipe/master/docs/images/mediapipe_small.png" height=15></a> for detecting 21 landmarks for each hand (x, y, z).</li>
  <li> <b>HitNet</b>: An LSTM model that has been developed in <a href="https://keras.io/" target="_blank"><img alt="Keras" title="Keras" src="https://img.shields.io/badge/Keras-%23D00000.svg?style=flat&logo=Keras&logoColor=white" height=18></a> for this application and then converted to <a href=https://www.tensorflow.org/js target="_blank"><img alt="TensorFlow.js" title="TensorFlow.js" src="https://img.shields.io/static/v1?label=&message=Tensorflow.js&color=FF6000&logo=TensorFlow&logoColor=FFFFFF" height=18></a>. It takes the last N positions of a hand and predicts the probability of this sequence for corresponding with a Hit.</li>
</ul>

