from RGT.XML.SVG.basicSvgNode import BasicSvgNode
from RGT.XML.SVG.Attribs.presentationAttributes import PresentationAttributes
from RGT.XML.SVG.Attribs.xlinkAttributes import XlinkAttributes
from RGT.XML.SVG.Attribs.classAttribute import ClassAttribute
from RGT.XML.SVG.Attribs.styleAttribute import StyleAttribute
from types import StringType

class BaseGradientNode(BasicSvgNode, PresentationAttributes, XlinkAttributes, ClassAttribute, StyleAttribute):

    ATTRIBUTE_EXTERNAL_RESOURCES_REQUIRED= 'externalResourcesRequired'
    ATTRIBUTE_GRADIENT_UNITS= 'gradientUnits'
    ATTRIBUTE_GRADIENT_TRANSFORM= 'gradientTransform'
    ATTRIBUTE_SPREAD_METHOD= 'spreadMethod'

    def __init__(self, ownerDoc, tagName):
        BasicSvgNode.__init__(self, ownerDoc, tagName)
        PresentationAttributes.__init__(self)
        XlinkAttributes.__init__(self)
        ClassAttribute.__init__(self)
        StyleAttribute.__init__(self)
        #add groups
        self._allowedSvgChildNodes.update(self.SVG_GROUP_DESCRIPTIVE_ELEMENTS)
        #add individual nodes
        self._allowedSvgChildNodes.update({self.SVG_ANIMATE_NODE, self.SVG_ANIMATE_TRANSFORM_NODE, self.SVG_SET_NODE, self.SVG_STOP_NODE})
        
    
    def setExternalResourcesRequired(self, data):
        allowedValues= ['true', 'false']
        
        if data != None:
            if data not in allowedValues:
                values= ''
                for value in allowedValues:
                    values+= value + ', '
                values= values[0: len(values)-2]
                raise ValueError('Value not allowed, only ' + values + 'are allowed')
            else:
                self._setNodeAttribute(self.ATTRIBUTE_EXTERNAL_RESOURCES_REQUIRED, data)
    
    def setGradientUnits(self, data):
        allowedValues= ['userSpaceOnUse', 'objectBoundingBox']
        
        if data != None:
            if data not in allowedValues:
                values= ''
                for value in allowedValues:
                    values+= value + ', '
                values= values[0: len(values)-2]
                raise ValueError('Value not allowed, only ' + values + 'are allowed')
            else:
                self._setNodeAttribute(self.ATTRIBUTE_GRADIENT_UNITS, data)
    
    def setGradientTransform(self, data):
        if data != None:
            if type(data) is not StringType:
                data= str(data)
            self._setNodeAttribute(self.ATTRIBUTE_GRADIENT_TRANSFORM, data)
    
    def setSpreadMethod(self, data):
        allowedValues= ['pad', 'reflect', 'repeat']
        
        if data != None:
            if data not in allowedValues:
                values= ''
                for value in allowedValues:
                    values+= value + ', '
                values= values[0: len(values)-2]
                raise ValueError('Value not allowed, only ' + values + 'are allowed')
            else:
                self._setNodeAttribute(self.ATTRIBUTE_SPREAD_METHOD, data)
    
    def getExternalResourcesRequired(self):
        node= self._getNodeAttribute(self.ATTRIBUTE_EXTERNAL_RESOURCES_REQUIRED)
        if node != None:
            return node.nodeValue
        return None
    
    def getGradientUnits(self):
        node= self._getNodeAttribute(self.ATTRIBUTE_GRADIENT_UNITS)
        if node != None:
            return node.nodeValue
        return None
    
    def getGradientTransform(self):
        node= self._getNodeAttribute(self.ATTRIBUTE_GRADIENT_TRANSFORM)
        if node != None:
            return node.nodeValue
        return None
    
    def getSpreadMethod(self):
        node= self._getNodeAttribute(self.ATTRIBUTE_SPREAD_METHOD)
        if node != None:
            return node.nodeValue
        return None