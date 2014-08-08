node-wordnet-magic
==================

A node.js module for working with Princeton's WordNet lexical database for the English language.

[![NPM version](https://badge.fury.io/js/wordnet-magic.svg)](http://badge.fury.io/js/wordnet-magic)

# Getting Started

## What is it about?

Since natural language processing (NLP) has to deal with a lot of non-digital features (comprising ambivalence, dubiety of language, not to mention irony, lies or rethorical tricks and ruses) it always has been a great challenge, confronting the programmer with a constant need of sense disambiguation. 

The WordNet project of Princeton University, developed for more than 20 years, has been designed for the needs of computer linguistics and has proven to be a very valuabe resource in many of the hardest NLP tasks.

The objective of this package is to make this richness available to the node eco-system. There are quite a few wordnet packages already, providing some nice features, but there is none that tries to reflect the complete WordNet architecture (centered around synsets). This is what the wordnet-magic module is aiming for.

Currently, the module offers the following features:

## Features

- word type detection
- abilitiy to retrieve hypernyms, synonyms, homonyms, meronyms etc. for a given synset 
- asynchronuos module supporting both classical node.js callbacks and promises implemented via Bluebird
- implements WordNet's Morphy to find base words of inflected forms

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

## Example Code

Example code for most of the functions is distributed in the *examples* subdirectory of the package repository.

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

#### .pos (optional)

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

#### .getPolysemyCount(pos, callback)

Returns the polysemy count (also called familiarity) for the word. This denotes the number of different senses the word has in the supplied word type category. 

Example:

```
var kiss = new wordNet.Word("kiss","v");
kiss.getPolysemyCount("v", function(err, data){
	console.log(data);
});
```

Output: 

```
2
```

## Morphy
The package implements Morphy, a set of rules part of WordNet which try to determine the base form of a given inflected form. This
functionality is important insofar as words are stored only in their base form in the data base, and not taking this into account will likely
produce bad results. A detailed explanation of the steps Morphy takes to determine the base form can be found in the original documentation:
[https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html](https://wordnet.princeton.edu/wordnet/man/morphy.7WN.html)

#### wn.morphy(word, pos, callback)
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

#### wn.isNoun(word, callback)

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

#### wn.isVerb(word, callback)

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

#### wn.isAdjective(word, callback)

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

#### wn.isAdverb(word, callback)

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

A hypernym is a synset constitution a semantic field to which many other synsets can belong. This function looks up the direct hypernym of the synset and passes it to the callback function. 

Example:
```
// the synset king.n.10 is: king - (chess) the weakest but the most important piece
wn.fetchSynset("king.n.10").then(function(synset){
	synset.getHypernyms().then(function(hypernym){
		console.log(util.inspect(hypernym, null, 3));
	});
})
```

Output:
```
[ { synsetid: 103018094,
    words: [ { lemma: 'chess piece' }, { lemma: 'chessman' } ],
    definition: 'any of 16 white and 16 black pieces used in playing the game of chess',
    pos: 'n',
    lexdomain: 'noun.artifact' } ]
```

#### .getHypernymsTree(callback)

In contrast to *.getHypernyms*, this function performs a recursive search to also retrieve the information about the hypernyms of the found hypernyms, yielding a hierarchical tree structure with the synsets who do not have any more hypernyms at the top. The returned array includes the found hypernyms as *Synset* objects, with an additional key named *hypernym* which containing its hypernym, again as an object of class *Synset*. 

Example:

```
wn.fetchSynset("bacteria.n.1", function(err, synset){
	synset.getHypernymsTree(function(err, data){
		console.log(util.inspect(data, null, 3));
	});
});
```

Output:

```
[ { synsetid: 101328932,
    words: [ { lemma: 'micro-organism' }, { lemma: 'microorganism' } ],
    definition: 'any organism of microscopic size',
    pos: 'n',
    lexdomain: 'noun.animal',
    hypernym: 
     [ { synsetid: 100004475,
         words: [Object],
         definition: 'a living thing that has (or can develop) the ability to act or function independently',
         pos: 'n',
         lexdomain: 'noun.tops',
         hypernym: [Object] } ] } ]
```

#### .getHyponyms(callback)

This function collects the hyponyms for the synset, where the hyponym of a synset is defined as a subordinate grouping. In doing so, the synset and its hyponym stand in a type-of relationship with each other. This function retrieves the 
hyponyms of a synset and returns them in array to the callback.

Example:

```
wn.fetchSynset("american.n.3").then(function(synset){
	console.log(synset)
	synset.getHyponyms().then(function(hyponym){
		console.log(util.inspect(hyponym, null, 3))
	});
})
```

Output:

```
[ { synsetid: 109729069,
    words: [ { lemma: 'creole' } ],
    definition: 'a person of European descent born in the West Indies or Latin America',
    pos: 'n',
    lexdomain: 'noun.person' },
  { synsetid: 109739652,
    words: [ { lemma: 'latin american' }, { lemma: 'latino' } ],
    definition: 'a native of Latin America',
    pos: 'n',
    lexdomain: 'noun.person' },
  { synsetid: 109744643,
    words: [ { lemma: 'north american' } ],
    definition: 'a native or inhabitant of North America',
    pos: 'n',
    lexdomain: 'noun.person' },
(...)
]
```

#### .getHyponymsTree(callback)

Performs a recursive search and returns an array of hyponyms, which are again just *Synset* objects. However, they additionally possess a field called *hyponym* which includes their own hyponym etc. 

Example:

```
wn.fetchSynset("canadian.n.1").then(function(synset){
	synset.getHyponymsTree().then(function(hypernym){
		// only print first element of array to the console
		console.log(util.inspect(hypernym[0], null, 3));
	});
})
```

Output:
```
{ synsetid: 109716159,
  words: [ { lemma: 'french canadian' } ],
  definition: 'a Canadian descended from early French settlers and whose native language is French',
  pos: 'n',
  lexdomain: 'noun.person',
  hyponym: 
   [ { synsetid: 109696564,
       words: [ [Object] ],
       definition: 'an early French settler in the Maritimes',
       pos: 'n',
       lexdomain: 'noun.person',
       hyponym: [ [Object] ] },
     { synsetid: 109716340,
       words: [ [Object] ],
       definition: 'informal term for Canadians in general and French Canadians in particular',
       pos: 'n',
       lexdomain: 'noun.person',
       hyponym: [] } ] }
```

#### .getHolonyms(type, callback)

Returns an array of holonyms for the given synset. Holonyms define the relationship between a part and a whole. Specifically, X is a holonym of Y if the latter is a part of X, for example an arm is part of a human being.
The function takes as a first argument the type of the holonym relationship, which can be either *part*, *member* or *substance* (or an array combining any two of those). If *null* is supplied, the function
returns all holonyms. 

Example:

```
wn.fetchSynset("feminist.n.1", function(err, synset){
	synset.getHolonyms("member", function(err, data){ console.log(util.inspect(data, null, 3)); });
})
``` 

Output:

```
[ { synsetid: 100802082,
    words: 
     [ { lemma: 'feminism' },
       { lemma: 'feminist movement' },
       { lemma: 'women\'s lib' },
       { lemma: 'women\'s liberation movement' } ],
    definition: 'the movement aimed at equal rights for women',
    pos: 'n',
    lexdomain: 'noun.act' } ]
```

#### .getMeronyms(type, callback)

Meronyms are the opposite of holonyms, i.e. X is a meronym of Y if X is a part of Y. The function takes as a first argument the type of the meronym 
relationship, which can be either *part*, *member* or *substance* (or an array combining any two of those). If *null* is supplied, the function
returns all meronyms. The returned object is an array of synsets which are meronyms of the synset owning the method.

Example:

```
wn.fetchSynset("finger.n.1", function(err, synset){
	synset.getMeronyms("part",function(err, data){ 
	  console.log(util.inspect(data, null, 3));
	});
})
```

Output: 

```
[ { synsetid: 102443154,
    words: [ { lemma: 'pad' } ],
    definition: 'the fleshy cushion-like underside of an animal\'s foot 
    or of a human\'s finger',
    pos: 'n',
    lexdomain: 'noun.animal' },
  { synsetid: 105574750,
    words: [ { lemma: 'fingertip' } ],
    definition: 'the end (tip) of a finger',
    pos: 'n',
    lexdomain: 'noun.body' },
  { synsetid: 105591915,
    words: [ { lemma: 'fingernail' } ],
    definition: 'the nail at the end of a finger',
    pos: 'n',
    lexdomain: 'noun.body' },
  { synsetid: 105592855,
    words: 
     [ { lemma: 'knuckle' },
       { lemma: 'knuckle joint' },
       { lemma: 'metacarpophalangeal joint' } ],
    definition: 'a joint of a finger when the fist is closed',
    pos: 'n',
    lexdomain: 'noun.body' } ]

```

#### .getSisterTerms(callback)

Finds all sister terms for the synset in question, that is all other synsets which share a common hypernym. The object 
passed to the supplied callback function is an array consisting of the hypernym synset, which has an additional *hyponym*
key which holds an array of its hyponyms. For example, in a given deck of cards, the queen is one of three card types bearing a face. 
When asking WordNet to find the sister terms of a queen of cards, it firsts finds its hypernym and then correclty outputs 
the sister terms as *jack* and *king*. See the example.

Example:

```
wn.fetchSynset("queen.n.7", function(err, synset){
	synset.getSisterTerms(function(err, data){ console.log(util.inspect(data, null, 5)); });
})
```

Output:

```
[ { synsetid: 103318973,
    words: 
     [ { lemma: 'court card' },
       { lemma: 'face card' },
       { lemma: 'picture card' } ],
    definition: 'one of the twelve cards in a deck bearing a picture of a face',
    pos: 'n',
    lexdomain: 'noun.artifact',
    hyponym: 
     [ { synsetid: 103594280,
         pos: 'n',
         lexdomain: 'noun.artifact',
         definition: 'one of four face cards in a deck bearing a picture of a young prince',
         words: [ { lemma: 'jack' }, { lemma: 'knave' } ] },
       { synsetid: 103623428,
         pos: 'n',
         lexdomain: 'noun.artifact',
         definition: 'one of the four playing cards in a deck bearing the picture of a king',
         words: [ { lemma: 'king' } ] },
       { synsetid: 104039901,
         pos: 'n',
         lexdomain: 'noun.artifact',
         definition: 'one of four face cards in a deck bearing a picture of a queen',
         words: [ { lemma: 'queen' } ] } ] } ]
``` 

#### .causeOf(callback)

Defined for two verbs X and Y, where X causes the action of Y. The result set is an array consisting of the 
synset(s) which are caused by the synset this method belongs to. 

Example:

```
wn.fetchSynset("leak.v.1",function(err, synset){
	synset.causeOf(function(err, data){
		console.log(data)
	});
})
```

Output:

```
[ { synsetid: 200938019,
    words: [ [Object], [Object], [Object] ],
    definition: 'be released or become known; of news',
    pos: 'v',
    lexdomain: 'verb.communication' } ]
```

### Other Functions

#### wn.print(input)

This utility function takes as its input an object of any class from the module and prints the content in a nicely formatted
way to the terminal. An array of objects can also be supplied. 

Example:
```  
wn.fetchSynset("fish.n.1").then(function(synsetArray){
	synsetArray.getHypernymsTree().each(function(hypernym){
			wn.print(hypernym);
		})
});
```

Output:
```
S: (n) aquatic vertebrate (animal living wholly or chiefly in or on water)
    S: (n) craniate, vertebrate (animals having a bony or cartilaginous skeleton with a segmented spinal column and a large brain enclosed in a skull or cranium)
        S: (n) chordate (any animal of the phylum Chordata having a notochord or spinal column)
            S: (n) animal, animate being, beast, brute, creature, fauna (a living organism characterized by voluntary movement)
                S: (n) being, organism (a living thing that has (or can develop) the ability to act or function independently)
                    S: (n) animate thing, living thing (a living (or once living) entity)
                        S: (n) unit, whole (an assemblage of parts that is regarded as a single entity)
                            S: (n) object, physical object (a tangible and visible entity; an entity that can cast a shadow)
                                S: (n) physical entity (an entity that has physical existence)
                                    S: (n) entity (that which is perceived or known or inferred to have its own distinct existence (living or nonliving))
```
