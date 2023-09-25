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
[  100  62.70 58.16 61.18 57.77 ]
[ 62.70  100  56.06 75.19 67.41 ]
[ 58.16 56.06  100  64.99 52.90 ]
[ 61.18 75.19 64.99  100  61.65 ]
[ 57.77 67.41 52.90 61.65  100  ]

Max index/value: [1, 3] => 0.7519389026047064

Closest friends are: #{ correlation_matrix.max_index }
💚 2: Una nuova canzone per te
💚 4: Your song
```

This proves that the embeddings finds similar text across different languages (the italian song quoting the italian word for 'song' is deemed the closest to Elton John's `Your song`).