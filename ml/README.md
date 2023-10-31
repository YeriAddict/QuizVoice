<h1>Big Data Project 2023 : Machine Learning</h1>

<p></p>

## Clean_TF.ipynb, cv-corpus, ffmpeg.exe :
Permet la génération d'un modèle, en s'entrainant sur les données de Mozilla CommonVoices. <br>
Les données sont disponibles à l'adresse https://commonvoice.mozilla.org/fr/datasets <br>
ffmpeg.exe sert à la conversion .mp3 <> .wav, et est ici utile uniquement pour des tests.

## model.h5 :
Modèle créé avec les hyperparamètres actuels du Clean_TF.ipynb. <br>
Précision actuelle du modèle : 80%

## getLabel.py :
Code python qui est optimisé pour être utilisé comme fonction Lambda AWS. <br>
Pour le bon fonctionnement de la fonction :

* Avant de commencer, placer le fichier model.h5 dans un bucket, et indiquer le nom de ce bucket dans la variable 'bucket' de getLabel.py
* Créer un Dockerfile qui installe python3.8, puis les librairies pythons Tensorflow, boto3, numpy et pandas. Le docker doit aussi copier getLabel.py
<pre>
FROM public.ecr.aws/lambda/python:3.8
RUN python3.8 -m pip install tensorflow tensorflow-io numpy pandas boto3
COPY getLabel.py
CMD ["getLabel.lambda_handler"]</pre>
* Executer le dockerfile, et poster l'image créée sur AWS ECR
<pre>
docker build -t  lambda-tensorflow-tse .
aws ecr create-repository --repository-name lambda-tensorflow-tse --image-scanning-configuration scanOnPush=true --region <REGION>
docker tag lambda-tensorflow-tse:latest <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/lambda-tensorflow-tse:latest
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/lambda-tensorflow-tse:latest</pre>
* Créer une fonction Lambda AWS qui utilise un container, à partir de cette image.
* Créer un bucket, mettre des fichier .mp3 à l'intérieur
* Créer un URL public pour le Lambda AWS
* Il suffit maintenant d'appeler cet URL, en lui passant en query le nom du bucket et du fichier à examiner : https://nom_du_lambda.com/?bucket=BUCKETNAME&key=FILENAME

## Auteurs

* Kim-Céline FRANOT
* Yannis GUIRONNET
* Pierre LABATTUT
* Denis LEANG
* Pierre TASSAN
