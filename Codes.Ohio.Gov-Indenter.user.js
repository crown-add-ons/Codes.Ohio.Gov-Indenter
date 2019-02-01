// ==UserScript==
// @name        Codes.Ohio.Gov-Indenter.user.js
// @namespace   http://dmiratech.com/
// @version     1.0.5
// @description Indents the divisions and subdivisions, etc. in Ohio's online
//              copy of its laws (Revised Code; ORC) and Administrative Code
//              (OAC).
// @author      Jonathan (Jon) Freed
// @license     The Unlicense.  See http://unlicense.org/.
// @supportURL  https://github.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js
// @downloadURL https://raw.githubusercontent.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js/master/Codes.Ohio.Gov-Indenter.user.js
// @updateURL   https://raw.githubusercontent.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js/master/Codes.Ohio.Gov-Indenter.user.js
// @match       http://codes.ohio.gov/*
// @grant       none
// @run-at      document-idle
// ==/UserScript==
///////////////////////////////////////////////////////////////////////////////
var iPixelsOfIndentingPerLevel = 25;
///////////////////////////////////////////////////////////////////////////////
console.log("Starting script for indenting ORC and OAC content.");
// If the document is loaded...
if (document.readyState !== "loading") {
    // Then do the indenting
    vIndentContentByLevel();
} else { // Have the browser wait until doc is loaded to do the indenting.
    document.addEventListener('DOMContentLoaded', vIndentContentByLevel);
}
// Define the function that will do the indenting
function vIndentContentByLevel() {
    console.log("ORC/OAC-Indenting:  DOM content loaded; BEGIN indenting.");

    // The initial level of indenting is 0 pixels.
    var sPaddingLeft = "0px";

    // Get the div for content then its children, and then for each child...
    var aX = document.querySelectorAll("div#doc > div.content > *");

    // Declare/initialize variables to help us process those children
    var reForOutlineLvlPrefix = /^\(.+\)[\W\s]/;
    var aCurPrefixes = [];
    var aReLvls = [
        /^\([A-Z]+\)[\W\s]/
        , /^\(\d+\)[\W\s]/
        , /^\([a-z]+\)[\W\s]/
        , /^\([ivxlcd]+\)[\W\s]/
    ];

    // For each of those children...
    for (var iX = 0; iX < aX.length; iX++) {
        // If we're on a heading...
        if (aX[iX].nodeName.slice(0, 1) === "H") {
            // reset everthing
            sPaddingLeft = "0px";
            aCurPrefixes = [];
        }
        // Else, if we're on a "p" that isn't a history "p"...
        else if (aX[iX].matches('p:not([class^=History])')) {

            // If the p begins with a outline level prefix
            var reResult = reForOutlineLvlPrefix.exec(aX[iX].textContent);
            if (reResult) {
                var sCurPrefix = reResult[0];
                // Determine the level of the current prefix
                var iCurLvl;
                for (var iTestLvl = 0; iTestLvl < aReLvls.length; iTestLvl++) {
                    if (aReLvls[iTestLvl].test(sCurPrefix)) {
                        iCurLvl = iTestLvl;
                        break;
                    }
                }
                if (iCurLvl === undefined) {
                    console.log("ORC/OAC-Indenting:  Exiting! Cannot determine level of this outline prefix: \"" + sCurPrefix + "\"");
                    return;
                }
                // Revise the array of previous prefixes so it only has levels lower than the current level
                aCurPrefixes = aCurPrefixes.slice(0, iCurLvl);
                // Append the current prefix
                aCurPrefixes.push(sCurPrefix);
            } //end if the p begins with an outline level prefix

            // Use the number of levels to set the indenting (pad-left the current "p" element)
            aX[iX].style.paddingLeft = ((aCurPrefixes.length - 1) * iPixelsOfIndentingPerLevel) + "px";

        } //end else-if
    } //end for(...)
    console.log("ORC/OAC-Indenting:  END indenting.");
} //end vIndentContentByLevel()
