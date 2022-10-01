//
//  Identifiables.swift
//  CollectionMobileApp
//
//  Created by Kevin on 9/30/22.
//

import Foundation

func wrapIdentifiable<T, Id: Hashable>(value: T, getId: (T) -> Id) -> IdentifiableWrapper<T, Id> {
    return IdentifiableWrapper<T, Id>(value: value, getId: getId)
}

struct IdentifiableWrapper<T, Id : Hashable> : Identifiable {
    var value : T
    var id : Id
    init(value: T, getId: (T) -> Id) {
        self.value = value
        self.id = getId(value)
    }
}
