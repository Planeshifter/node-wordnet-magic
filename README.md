node-wordnet-magic
==================

A node.js module for working with Princeton's WordNet lexical database for the English language.

[![NPM version](https://badge.fury.io/js/wordnet-magic.svg)](http://badge.fury.io/js/wordnet-magic)

# Getting Started

## What is it about?

## Installation & Setup

The module is available through npm via

```
npm install wordnet-magic
``` 

Inside node, the package can then be loaded as any other module:

``` 
var wn = require('wordnet-magic');
``` 

However, the WordNet database has to be downloaded seperately and placed into the /data folder of the package directory. The package expects WordNet in SQLite format, which can be obtained from the URL 
[http://sourceforge.net/projects/wnsql/files/wnsql3/sqlite/](http://sourceforge.net/projects/wnsql/files/wnsql3/sqlite/). If for whatever reason you decide to place
the database file in another location, you have to tell the module as follows before using any of the other functions:

``` 
wn.registerDatabase(<insert path here>);
``` 

## Features

- module provides access to most of WordNet's resources to be used for various natural language processing tasks 
- word type detection
- abilitiy to retrieve hypernyms, synonyms, homonyms etc. for a given synset 
- asynchronous module supporting both classical node.js callbacks and promises implemented via Bluebird
- implements WordNet's Morphy to find base words of inflected forms

## Example Usage




Further example codes is distributed in the *examples* subdirectory of the package repository.

# API

## Foreword 

Due to the asynchronous 

## Word

## Morphy
The package implements Morphy, a set of rules part of WordNet which try to determine the base form of a given inflected form. This
functionality is important insofar as words are stored only in their base form in the data base, and not taking this into account will likely
produce bad results. A detailed explanation of the steps Morphy takes to determine the base form can be found in the original documentation:
[https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html](https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html)

### wn.morphy(word, pos, callback)
Returns the base form for an inflected word. As a second argument, the function takes a character denoting the part of speech,
which can take one of the values *n* for noun, *v* for verb, *a* for adjective, *r* for adverb and *s* for satellite adjective. Internally,
the function performs different steps depending on the type of the word. If *pos* is not supplied, all five possibilities are checked and the results
aggregated. 

Then the function returns an array of object(s) with two properties, *lemma* and *part_of_speech*. 
The first is the matching base word itself and the second its word type. 

Example:
```
wn.morphy("loci", "n" , function(err, data){
	console.log(data);
})
```

Output:
```
[ { lemma: 'locus', part_of_speech: 'n' } ]
```

## Word type checking

The module provides several functions for checking whether a given word belongs to a certain word type. All these functions
take as their first argument the word in question and as their second argument a callback function. Internally, the functions
first use *morphy* to find the base form of the supplied word and then check whether the returned array of objects from *morphy*
contains an entry of the word type in question.

### wn.isNoun(word, callback)

Example:
```
wn.isNoun("happy", function(err, data){
	console.log(data);
});
```

Output:
```
false
```

### wn.isVerb(word, callback)

Example:
```
wn.isVerb("kill", function(err, data){
	console.log(data);
});
```

Output:
```
true
```

### wn.isAdjective(word, callback)

Example:
```
wn.isAdjective("filthy", function(err, data){
	console.log(data);
});
```

Output:
```
true
```

### wn.isAdverb(word, callback)

Example:
```
wn.isAdverb("helpfully", function(err, data){
	console.log(data);
});
```

Output:
```
true
```

## Synset

In WordNet, a synset is a unique concept which may have many words attached to it. These *synonyms* then share the common 
meaning of the synset. WordNet separates the individual words from the synsets as the former can belong to many different 
synsets: for example, the word *bank* can refer both to the financial institution and a river bank. 

### Methods

A synset object is equipped with the following methods:

#### .getExamples()

#### .getLemmas()

#### .getHypernyms()

#### .getHypernymsTree()

#### .getHyponyms()

#### .getgetHyponymsTree()

#### .getHolonyms()

#### .getHolonymsTree()

#### .getSisterTerms()

#### .causeOf()

