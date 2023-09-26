The idea here is to get a list of embeddings to be calculated and draw a matrix of the embedding cross-correlation, for instance:

* you give 5 sentences (that's the maximum supported by a single installation)
* you get 5 vectors.
* You calculate the 25 cross-correlations between those vectors (this is actually 10 values, since diagonals are always unitary and it's simmetric). Using simple Ruby math.
* you find the closest two from the `max()` of those 10 calculations.

## Sample output

```
$ ruby main.rb

Original songs (max 5!):
🔷 0. Cant buy me love
🔷 1. Una nuova canzone per te
🔷 2. Yellow submarine
🔷 3. Your song
🔷 4. Bella ciao

File written: 'embeddings.txt'

Cross-correlation matrix:
[   💯  62.70 58.16 61.18 57.77 ]
[ 62.70   💯  56.06 75.19 67.41 ]
[ 58.16 56.06   💯  64.99 52.90 ]
[ 61.18 75.19 64.99   💯  61.65 ]
[ 57.77 67.41 52.90 61.65   💯  ]

Max index/value: [1, 3] => 0.7519389026047064

Closest friends are:
💚 2: Una nuova canzone per te
💚 4: Your song
```

This proves that the embeddings finds similar text across different languages (the italian song quoting the italian word for 'song' (canzone) is deemed the closest to Elton John's `Your song`).

```
Original sentences (max 5):
🔷 1. Seychelles
🔷 2. Italy
🔷 3. Maldives
🔷 4. Italian Alps
🔷 5. Swiss mountains

File written: embeddings.txt

Cross-correlation matrix:
[ 💯   69.9 83.4 66.2 71.7 ]
[ 69.9 💯   69.9 78.3 67.1 ]
[ 83.4 69.9 💯   63.1 62.2 ]
[ 66.2 78.3 63.1 💯   77.0 ]
[ 71.7 67.1 62.2 77.0 💯   ]

Max index/value: [0, 2] => 0.833940093391156
Closest friends are: [0, 2]
💚 1: Seychelles
💚 3: Maldives
```

This is interesting: Maldives/Seychelles are closer (83.4%) than Italy/Italian Alps (78%) and to Italian Alps / Swiss Mountains (77%).
It does make sense.

And finally (yes Ive added a new feature here):
```
Original sentences (max 5):
🔷 1. Focaccia di Recco
🔷 2. agnolotti del plin
🔷 3. canederli al formaggio
🔷 4. Pizza prosciutto e funghi
🔷 5. magret de canard au miel

File written: embeddings.txt

Cross-correlation matrix:
[ 💯   71.2 79.0 69.9 69.5 ]
[ 71.2 💯   71.9 65.6 63.1 ]
[ 79.0 71.9 💯   70.6 76.1 ]
[ 69.9 65.6 70.6 💯   64.3 ]
[ 69.5 63.1 76.1 64.3 💯   ]

Max index/value: [0, 2] => 0.7899219994594414

Closest friends are: [0, 2] with 79.0% correlation
💚 1: Focaccia di Recco
💚 3: canederli al formaggio

Fartherst away enemies are: [1, 4] with 63.1% correlation
💔 2: agnolotti del plin
💔 5: magret de canard au miel
```

I'm impressed Google Vertex AI knows that Focaccia di Recco is made with cheese (formaggio) just like Canederli. That means 
one of ~700 dimensions of the Embeddings must relate to cheesiness :)