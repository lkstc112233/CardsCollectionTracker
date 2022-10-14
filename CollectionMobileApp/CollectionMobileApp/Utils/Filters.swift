//
//  Filters.swift
//  CollectionMobileApp
//
//  Created by Kevin on 10/14/22.
//

import Foundation

func filterList<T> (_ inputList: [T], filter: String, id: (T) -> String) -> [T] {
    if filter.isEmpty {
        return inputList
    } else {
        return inputList.filter {
            id($0).uppercased().contains(filter.uppercased())
        }
    }
}
