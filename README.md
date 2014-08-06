node-wordnet-magic
==================

A node.js module for working with Princeton's WordNet lexical database for the English language.

[![NPM version](https://badge.fury.io/js/wordnet-magic.svg)](http://badge.fury.io/js/wordnet-magic)
[![build status](https://secure.travis-ci.org/Planeshifter/wordnet-magic.png)](http://travis-ci.org/Planeshifter/wordnet-magic)

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

## Example Usage

# API

## Word

## Morphy

### wn.morphy()

## Word type checking

### wn.isNoun()

### wn.isVerb()

### wn.isAdjective()

### wn.isAdverb()

## Synset

### Methods

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

