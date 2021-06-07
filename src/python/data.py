import keras
import numpy as np
from constants import *
import os

training_percent = 0.85
SEED = 0


class DeepSCREAMDataset(keras.utils.Sequence):
    def __init__(self, root_dir=DATASET_DIR, detections_before=2, detections_after=1, kernel_suavization_size = 3, training = True):
        # ----------------- ENSURE GPU USAGE -------------------------
        config = tf.compat.v1.ConfigProto()
        config.gpu_options.force_gpu_compatible = True
        config.gpu_options.allow_growth = True
        tf.compat.v1.Session(config=config)
        # ----------------- SAVE PARAMETERS ---------------------------
        self.root_dir = root_dir
        self.detections_before = detections_before
        self.detections_after = detections_after
        # ----------------- SPLITS TRAIN/VAL --------------------------
        files = np.sort(os.listdir(root_dir))
        np.random.seed(SEED)
        np.random.shuffle(files)
        amount_of_files = int(len(files)*training_percent)
        files = files[:amount_of_files] if training else files[amount_of_files:]
        # ------------------ CHARGE DATASET ---------------------------
        X, Y = self.charge_dataset(files=files, root_dir=root_dir)
        # -------------------- ADAPTS IT ------------------------------



    def charge_dataset(self, files, root_dir=DATASET_DIR):
        pass
        return X, Y

    def __len__(self):
        return int(self.X)

    def getitem(self, idx):
        pass
        return x, y

    def __getitem__(self, idx):
        real_idx = idx*self.batch_size
        X, Y = [], []
        for i, index in enumerate(range(real_idx, real_idx+self.batch_size)):
            x, y = self.getitem(idx = index)
            X.append(x), Y.append(y)
        X = np.array(X, dtype=np.float)
        Y = np.array(Y, dtype=np.float)
        return X, Y


    def on_epoch_end(self):
        if not self.training:
            pass
