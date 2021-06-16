from HitDataset import HitDataset
from models.HitNet import build_hitnet
from keras.callbacks import ModelCheckpoint
from keras.models import load_model
from utils.Callbacks import PlotingCallback, ConfusionMatrix, RocAndPRCurvesCallback
import os
from utils.Losses import loss
from utils.constants import *
from keras.metrics import BinaryAccuracy
import tensorflowjs as tfjs


def train(results_dir = RESULTS_DIR, epochs=EPOCHS, callbacks_period = CALLBACKS_PERIOD):
    train_set, val_set = HitDataset(training=True), HitDataset(training=False)
    sample_x, _ = train_set[0]
    batch_size, n_steps, n_features = sample_x.shape
    model = build_hitnet(n_steps=n_steps, n_features=n_features)
    if not os.path.isdir(results_dir):
        os.makedirs(results_dir)
    binary_accuracy = BinaryAccuracy(threshold=0.5)
    checkpoint = ModelCheckpoint(os.path.join(results_dir,"best_model.h5"), monitor='loss', verbose=1,
                                 save_best_only=True, mode='auto', period=callbacks_period)
    plotting_callback = PlotingCallback(path = results_dir, period=callbacks_period)
    confusion_matrix_callback = ConfusionMatrix(path=results_dir, train_set=train_set, val_set=val_set, period=callbacks_period)
    roc_curve = RocAndPRCurvesCallback(path=results_dir, train_set=train_set, val_set=val_set, period=callbacks_period)
    model.compile(optimizer='adam', loss=loss, metrics=['acc', binary_accuracy])
    model.fit(train_set, steps_per_epoch=len(train_set), epochs=epochs, validation_data=val_set,
              validation_steps=len(val_set), max_queue_size=20, workers=4,
              callbacks=[checkpoint, plotting_callback, confusion_matrix_callback, roc_curve])
    model.save(os.path.join(results_dir, 'final_model.h5'))
    model.save_weights(os.path.join(results_dir, 'weights.h5'))

    tfjs.converters.save_keras_model(load_model(os.path.join(results_dir,"best_model.h5"), {'loss' : loss}), os.path.join(results_dir, 'HitNetJS'))