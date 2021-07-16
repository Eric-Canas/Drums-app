from keras import Sequential
from keras.layers import LSTM, Dropout, Dense, Activation
from utils.constants import *

def build_hitnet(n_steps=N_STEPS, n_features=N_FEATURES, output_size = OUTPUT_SIZE, dropout=DROPOUT):
    model = Sequential()
    model.add(LSTM(units=n_features, activation='relu', input_shape=(n_steps, n_features)))
    """
    for i in range(lstm_layers-1):
        model.add(LSTM(hidden_size, activation='relu'))
    """
    """
    if dropout > 0.:
        model.add(Dropout(dropout))
    model.add(Dense(n_features//2))
    """
    if dropout > 0.:
        model.add(Dropout(dropout))
    model.add(Dense(output_size))
    model.add(Activation('sigmoid'))
    return model