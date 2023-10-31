import os 
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

import tensorflow as tf
import tensorflow_io as tfio
import pandas as pd
import numpy as np
import boto3
import random
import string
import sys

s3 = boto3.client('s3')
bucket = "big-data-tse"
key = "model.h5"

s3.download_file(bucket, key, 'model2.h5') 
model = tf.keras.models.load_model('model2.h5')
labels = ['oui', 'non', 'un', 'deux', 'trois', 'quatre']

def decode_audio(file_path):
    
  file = tf.io.read_file(file_path)
  audio= tfio.audio.decode_mp3(file)
  return tf.squeeze(audio, axis=-1)

def get_spectrogram(file_path):
  waveform = decode_audio(file_path[0])
  input_len = 150000
  waveform = waveform[:input_len]
  zero_padding = tf.zeros(
      input_len - tf.shape(waveform),
      dtype=tf.float32)
  waveform = tf.cast(waveform, dtype=tf.float32)
  equal_length = tf.concat([waveform, zero_padding], 0)
  spectrogram = tf.signal.stft(
      equal_length, frame_length=255, frame_step=128)
  spectrogram = tf.abs(spectrogram)
  spectrogram = spectrogram[..., tf.newaxis]
  return spectrogram, tf.argmax(file_path[1] == labels)



AUTOTUNE = tf.data.AUTOTUNE
def preprocess_files(files):
    files_dataset = tf.data.Dataset.from_tensor_slices(files)
    preprocessed_dataset = files_dataset.map(
        map_func = get_spectrogram,
        num_parallel_calls=AUTOTUNE
    )
    return preprocessed_dataset

TEMP_FILE = ''.join(random.choices(string.ascii_lowercase, k=10)) + ".mp3"
audio = sys.argv[1]
file = s3.download_file(bucket, audio, TEMP_FILE)
test = pd.DataFrame({'path' : [TEMP_FILE], 'sentence': 'to_predict'})
sample_ds = preprocess_files(test)
for spectrogram, label in sample_ds.batch(1):   
  prediction = model(spectrogram)
  print(labels[np.argmax(tf.nn.softmax(prediction[0]))])
os.remove(TEMP_FILE)


