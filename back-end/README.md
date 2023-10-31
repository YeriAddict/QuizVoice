# Big Data - Back



# Installation pour une utilisation en local

Pour installer le back, exécutez les commandes:
```
git clone git@devops.telecomste.fr:big-data-project/big-data-back.git
cd ./big-data-back/
npm install
node ./server.js
```
Le back est alors accessible sur: 
[http://localhost:8080](http://localhost:8080)

Ou sur l'ip/le nom de domaine de votre machine.
Pour une exposition, ouvrez le port 8080 de la machine.

Pour configurer la base de données, la connexion AWS et le machine learning, regardez la partie MySQL/AWS/ML.


# Installation pour une utilisation en ligne sécurisée (HTTPS)

Dans le cas où vous souhaiteriez utiliser ce logiciel en ligne. Il faudra que le front et le back soient hébergés sur un site web sécurisé en HTTPS (règles de sécurité de la plupart des navigateurs).

Pour cela, il faudra tout d'abord rediriger les requêtes arrivants sur le port 443 vers le port 8080, si vous utilisez iptable sur votre machine, la commande est:
`sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8080`

Assurez vous ensuite que votre nom de domaine pointe vers l'IP de votre machine par une redirection de type A.

Installez ensuite le back comme dans la version local avec les commandes suivantes:
```
git clone git@devops.telecomste.fr:big-data-project/big-data-back.git
cd ./big-data-back/
npm install
```

Enfin, récupérez les fichiers suivants de votre certificat SSL:
```
"ca_bundle.crt"
"private.key"
"certificate.crt"
```

Placez les dans le répertoire du back.

Ensuite, exécutez le serveur en mode SSL avec la commande:
```
node ./server_ssl.js
```

Votre serveur sera alors accessible depuis l'adresse:
[https://votredomaine.domain/](https://votredomaine.domain/)

Pour configurer la base de données, la connexion AWS et le machine learning, regardez la partie MySQL/AWS/ML.

# MySQL/AWS/ML

## MySQL
Ce serveur nécessite une connexion à une base de données MySQL pour le stockage des données, la configuration de cette connexion se fait dans le fichier `server.js` ou `server_ssl.js` à la ligne 131 (Ou 140 pour SSL)

Le code suivant:
```
var con = mysql.createConnection({
  host: "ip-bdd",
  user: "login",
  password: "password",
  port: "3306"
});
```

Doit contenir les informations de connexion vers votre base de données

## AWS
Le serveur doit être hébergé sur une machine contenant AWS CLI configuré
Pour plus d'information sur l'installation d'AWS Client, visitez ce lien:
[https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Une fois le client configuré, le serveur détectera automatiquement vos buckets, il est alors nécessaire de créer un bucket public accessible à tous. Celui-ci sera utilisé pour stocker les fichiers audios.

Une fois cela fait, il faut indiquer au serveur le nom de votre bucket, pour ceci, allez à la ligne 85 de `server.js` (Ou 95 pour `server_ssl.js`).

Trouvez le code suivant: 
```
  var params = {
    Body: audio,
    Bucket: "buket-name",
    Key: name,
    ACL: 'public-read',
    ContentLength: audio.length,
    ContentType: `audio/${type}`
  }

```
Et remplacez `buket-name` par le nom de votre bucket

## ML

Après avoir créer et upload le machine learning sur un Lambda, récupérez sont IP.
Ensuite, rendez-vous dans 
```
    var options = {
    host: "ip-bucket",
    path: "/?bucket=bucket-big-data-audios&key=" + name
}; 
```

Et remplacez `ip-bucket` par l'adresse de votre Lambda.

# Fonctionnement
Ce serveur a été programmé sur Node en utilisant npm.
La liste des modules utilisés se trouve dans `package.json`.
Le Code du serveur se trouve dans `server.js` et `server_ssl.js`.

# Auteurs

* Kim-Céline FRANOT
* Yannis GUIRONNET
* Pierre LABATTUT
* Denis LEANG
* Pierre TASSAN
