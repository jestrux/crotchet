//
//  CrotchetWidgetBundle.swift
//  CrotchetWidget
//
//  Created by Walter Kimaro on 09/05/2024.
//

import WidgetKit
import SwiftUI

@main
struct CrotchetWidgetBundle: WidgetBundle {
    var body: some Widget {
        if #available(iOS 17.0, *) {
            CrotchetWidgetActions()
            CrotchetWidgetDefaultSmall()
            CrotchetWidgetDefaultMedium()
            CrotchetWidgetHighlight()
            CrotchetWidgetPerson()
        }
        CrotchetWidgetLiveActivity()
    }
}
