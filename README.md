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

## Callbacks and Promises 

Due to the asynchronous nature of JavaScript's I/O operations, all functions in the module are asynchronous by nature. Hence, following conventional design, a callback function has to be passed to the function as the last argument. This callback function  has two parameters: an error object which is *null* if no error is thrown and a second parameter which is the returned value from the invoked function. 

Alternatively, the wordnet-magic package implements promises via the [Bluebird](https://github.com/petkaantonov/bluebird) package. In this documentation, we stick to the callback style as it is more conventional, although one might argue that using promises results in clear code. 

The following example demonstrates the use of both callbacks and promises when using the wordnet-magic module:

```
wn.isNoun("callback", function(err, data){ console.log(data)});
wn.isNoun("promise").then(console.log);
```

## Word

The package includes a word class which is a simple wrapper for any user-supplied string 
providing methods for accessing information provided by WordNet about the word. A word is created as follows:

```
var word = new wn.Word("cat");
```

The constructor accepts as a second argument a part-of-speech type. Hence, if supplied, *pos* must be 
either *n* for noun, *v* for verb, *a* for adjective, *r* for adverb and *s* for satellite adjective.

Invoking the constructor function returns a new object with the following properties and methods:

### Properties

#### .lemma

This key holds the user-supplied word passed to the constructor function at creation of the object. 

#### .part_of_speech (optional)

If the word was created by passing the constructor function a part-of-speech type, this key will hold the supplied value. Otherwise it is *undefined*.

### Methods

#### .getSynsets(callback)

Queries WordNet for an array of Synset objects matching the word and passes them to the callback function. If the part-of-speech
type exists for word owning the method, the search is restricted to only return synsets of said type. 

Example:
```
var kiss = new wordNet.Word("kiss","v");
kiss.getSynsets(function(err, data){
	console.log(util.inspect(data, null, 3));
});
``` 

Output:
```
[ { synsetid: 201433863,
    words: 
     [ { lemma: 'buss' },
       { lemma: 'kiss' },
       { lemma: 'osculate' },
       { lemma: 'snog' } ],
    definition: 'touch with the lips or press the lips (against 
    someone\'s mouth or other body part) 
    as an expression of love, greeting, etc.',
    pos: 'v',
    lexdomain: 'verb.contact' },
  { synsetid: 201434356,
    words: [ { lemma: 'kiss' } ],
    definition: 'touch lightly or gently',
    pos: 'v',
    lexdomain: 'verb.contact' } ]
```

#### .getAntonyms(callback)

Retrieves an array of objects containing the antonyms (= words opposite in meaning, e.g. black and white) for 
the supplied word and passes it to the supplied callback function. The objects have three keys, the orginal *lemma*, the 
*synset* for which the antonym relationship exists and the *antonym* itself. 

Example:
```
var high = new wn.Word("high");
high.getAntonyms(function(err, antonymArray){
	console.log(antonymArray);
});
```

Output:
```
[ { lemma: 'high',
    antonym: 'low',
    synset: 'greater than normal in degree or intensity or amount' },
  { lemma: 'high',
    antonym: 'low',
    synset: '(literal meaning) being at or having a relatively great or 
    specific elevation or upward extension
     (sometimes used in combinations like knee-high\')' },
  { lemma: 'high',
    antonym: 'low',
    synset: 'used of sounds and voices; high in pitch or frequency' } ]
```

## Morphy
The package implements Morphy, a set of rules part of WordNet which try to determine the base form of a given inflected form. This
functionality is important insofar as words are stored only in their base form in the data base, and not taking this into account will likely
produce bad results. A detailed explanation of the steps Morphy takes to determine the base form can be found in the original documentation:
[https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html](https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html)

### wn.morphy(word, pos, callback)
Returns the base form for an inflected word to the callback function. As a second argument, the function takes a character denoting the part of speech,
which can take one of the values *n* for noun, *v* for verb, *a* for adjective, *r* for adverb and *s* for satellite adjective. Internally,
the function performs different steps depending on the type of the word. If *pos* is not supplied, all five possibilities are checked and the results
aggregated. 

Then the function returns an array of object(s) with two properties, *lemma* and *part_of_speech*. These are themselves instances of the basic Word class, 
extended by having the word type as an extra key. 
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

Returns *true* if *word* is a noun, *false* otherwise to the supplied callback.

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

Returns *true* if *word* is a verb, *false* otherwise to the supplied callback.

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

Returns *true* if *word* is a adjective, *false* otherwise to the supplied callback.

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

Returns *true* if *word* is a adverb, *false* otherwise to the supplied callback.

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

The most common method to create synsets in the wordnet-magic module is to invoke the .getSynsets() method of a Word object. However,
each synset can also be identified by a *string*  consisting of three parts separated by dots such as "king.n.1", where
the first part denotes a word associated with the synset, the second its word type and the third an incrementing integer for each sense (embodied in the synset) 
of the word. In this case, the function fetchSynset(*string*) can be used to retrieve the synset information.

Example: 

```
wn.fetchSynset("dog.n.1", function(err, synset){
 console.log(synset);	
});
``` 

Output:
``` 
{ synsetid: 102086723,
  words: 
   [ { lemma: 'canis familiaris' },
     { lemma: 'dog' },
     { lemma: 'domestic dog' } ],
  definition: 'a member of the genus Canis (probably descended from the common wolf) 
  that has been domesticated by man since prehistoric times; occurs in many breeds',
  pos: 'n',
  lexdomain: 'noun.animal' }
``` 

### Properties

As we can see from above output, an object of the Synset class has the following properties:

#### .synsetid

*For internal use*. Integer which acts as a unique identifier of the synset. 

#### .words

Not filled upon creation of a synset, this is a placeholder which can hold all the words associated with the synset in question.

#### .definition

A string holding the definition of the synset.

#### .pos

The part of speech of the word, taking one of the values *n* for noun, *v* for verb, *a* for adjective, *r* for adverb and *s* for satellite adjective.  

#### .lexdomain

The lexical domain of the synset. Each domain category is composed of the word type followed by a 
dot and then the category name. WordNet has implemented the following domain categories:

- adj: all, pert, ppl
- adv: all
- noun: tops, act, animal, artifact, attribute, body, cognition, communication
event, feeling, food, group, location, motive, object, person
phenomenon, plant, possession, process, quantity, linkdef, shape, state
substance, time
- verb: body, change, cognition, communication, competition, consumption, contact, 
creation, emotion, motion, perception, possession, social, stative, weather

### Methods

A synset object is equipped with the following methods:

#### .getExamples(callback)

Returns an array of sample sentences for the synset in question. 

Example: 

```
wn.fetchSynset("bank.n.1", function(err, synset){
	synset.getExamples(function(err, data){
		console.log(data)
	});
});
```

Output:
```
[ { synsetid: 109236472,
    sampleid: 1,
    sample: 'they pulled the canoe up on the bank' },
  { synsetid: 109236472,
    sampleid: 2,
    sample: 'he sat on the bank of the river and watched the currents' } ]
```

#### .getLemmas(callback)

Returns an array of *Word* objects which have a sense belonging to the synset.

Example: 
```
wn.fetchSynset("dog.n.1", function(err, synset){
	synset.getLemmas(function(err, data){ console.log(data) });
});
```

Output:
```
[ { lemma: 'canis familiaris' },
  { lemma: 'dog' },
  { lemma: 'domestic dog' } ]
```

#### .getHypernyms(callback)

#### .getHypernymsTree(callback)

#### .getHyponyms(callback)

#### .getgetHyponymsTree(callback)

#### .getHolonyms(callback)

Returns an array of holonyms for the given synset. Holonyms define the relationship between a part and a whole. Specifically, X is a holonym of Y if the latter is a part of X, for example an arm is part of a human being.

Example:

```
wn.fetchSynset("word.n.1", function(err, synset){
	synset.getHolonyms(function(err, data){ 
    console.log(util.inspect(data, null, 3))
   });
})
``` 

Output:

```
[ { synsetid: 106315661,
    words: [ { lemma: 'syllable'} ],
    definition: 'a unit of spoken language larger than a phoneme',
    pos: 'n',
    lexdomain: 'noun.communication' },
  { synsetid: 106319039,
    words: [ { lemma: 'affix' } ],
    definition: 'a linguistic element added to a word to produce 
		 an inflected or derived form',
    pos: 'n',
    lexdomain: 'noun.communication' } ]
```

#### .getSisterTerms()

Example:

```
wn.fetchSynset("bank.n.2", function(err, synset){
	synset.getSisterTerms(function(err, data){ wn.print(data) });
})
```

Output:

```

``` 

#### .causeOf()


