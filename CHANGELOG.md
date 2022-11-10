# Changelog

Let's have a change log!

## Planned Features

* Deck planning
    * Given a deck, plans what card needs to be fetched from which binder.
    * Commit the change with one click!
    * Adds missing cards to the wishlist.

## Collection Server

### Changelog 0.9
* Added **Ghost Deck** as a binder type.
* Added Create ghost deck function.
    * Ghost deck does not hold real card, it's only a plan.
* Added calculate ghost deck cards function.
    * It calculates how to create the deck with cards in collection (binder & deck)
* Added solidify ghost deck function.
    * With the result above, it builds the deck with cards in the result.

### Changelog 0.8

* Added **Deck** as a binder type.
* Added **Borrow** or **Rent** card function.
    * Borrowed card remembers it's owning binder
* In list binder function, shows a number of how many cards are rented out.
* In Update binder function, added ability to update type.
* In Delete binder function, added ability to return all cards to the owing binder from a single binder.
* In Move card function, added ability to move card as a rent.
* Other bug fixes.

## Collection WebApp

### Changelog 0.8

* Added **Deck** indicator.
* Added **Renting** card.
* Added returning all cards in a deck.
* Added indicator for rented out cards.

## Collection iOS App

### Changelog 0.8

* Added color indicator for deck, rent card, and wishlist.

## Collection plugin

### Current version 0.7