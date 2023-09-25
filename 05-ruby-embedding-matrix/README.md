The idea here is to get a list of embeddings to be calculated and draw a matrix of the embedding cross-correlation, for instance:

* you give 5 sentences
* you get 5 vectors.
* You calculate the 25 cross-correlations between those vectors. Using simple Ruby math.
* you find the closest two.