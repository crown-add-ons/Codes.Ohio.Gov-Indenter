// ==UserScript==
// @name        Codes_Ohio_Gov_Indenter.user.js
// @namespace   http://facilitationtechnologies.com/
// @version     1.0.1
// @description Indents the divisions and subdivisions, etc. in Ohio's online
//              copy of its laws (Revised Code; ORC) and Administrative Code 
//              (OAC).
// @author      Jonathan (Jon) Freed
// @license     The Unlicense.  See http://unlicense.org/.
// @supportURL  https://github.com/jon-freed/Codes_Ohio_Gov_Indenter.user.js
// @downloadURL https://raw.githubusercontent.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js/master/Codes.Ohio.Gov-Indenter.user.js
// @updateURL   https://raw.githubusercontent.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js/master/Codes.Ohio.Gov-Indenter.user.js
// @match       http://codes.ohio.gov/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==
///////////////////////////////////////////////////////////////////////////////
var iPixelsOfIndentingPerLevel = 50;
///////////////////////////////////////////////////////////////////////////////
console.log("Starting script for indenting ORC and OAC content.");
// If the document is loaded...
if( document.readyState !== "loading" ) {
  // Then do the indenting
  vIndentContentByLevel();
}
else { // Have the browser wait until doc is loaded to do the indenting.
  document.addEventListener('DOMContentLoaded', vIndentContentByLevel);
}
// Define the function that will do the indenting
function vIndentContentByLevel() {
  console.log("ORC/OAC-Indenting:  DOM content loaded; starting indenting.");
  // The initial level of indenting is 0 pixels.
  var sPaddingLeft = "0px";
  // Get the div for content then its children, and then for each child...
  var aX = document.querySelectorAll("div#doc > div.content > *");
  for( iX=0; iX<aX.length; iX++) {
    // If we're on a heading...
    if( aX[iX].nodeName.slice(0,1) === "H" ) {
      // reset the indenting to zero
      sPaddingLeft = "0px";
    }
    // Else, if we're on a "p" that isn't a history "p"...
    else if( aX[iX].matches('p:not([class^=History])') ) {
      // Try to get the node's first "a" anchor and its "name" attribute value.
      var sName = ((aY=aX[iX].querySelector("a")) === null ? undefined : aY.name);
      // If we got a name value...
      if( sName !== undefined ) {
        // Determine this p's indenting value based on the name's number of "("
        sPaddingLeft = ((sName.split("(").length-2)*iPixelsOfIndentingPerLevel)+"px";
      }// (else we just use the value we already have for indenting
      // Use the indenting value to indent (pad-left) the element
      aX[iX].style.paddingLeft = sPaddingLeft;
    }
  }//end for(...)
}//end vIndentContentByLevel()
