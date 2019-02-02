// ==UserScript==
// @name        Codes.Ohio.Gov-Indenter.user.js
// @namespace   http://dmiratech.com/
// @version     1.1.1
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
var iPixelsOfIndentingPerLevel = 50;
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
    var reForOutlineLvlPrefix = /^[\W\s]*\((.+)\)[\W\s]/;
    var aCurPrefixes = [];
    var aReLvls = [
        /[A-Z]+/ //     Length = 1, Level 0: Capital Letters
        , /\d+/ //      Length = 2, Level 1: Numbers
        , /[a-z]+/ //   Length = 3, Level 2: Lowercase Letters
        , /[ivxlc]+/ // Length = 4, Level 3: Lowercase Roman Numerals
    ];
    var sPrevPrefix = "";

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
                var sCurPrefix = reResult[1];
                // Find the level of the current prefix
                var iCurLvl;
                for (var iTestLvl = 0; iTestLvl < aReLvls.length; iTestLvl++) {
                    if (aReLvls[iTestLvl].test(sCurPrefix)) {

                        // If the current prefix might be a letter prefix OR might be a roman numeral...
                        // (The Roman numerals we are testing for are the letters i, v, x, l, and c.)
                        if (aCurPrefixes.length > 2 && (
                            // If the current prefix is "i"
                            sCurPrefix == "i"
                            // OR if current prefix is "v" and previous letter prefix is "u" and the previous prefix is "iv" (4)
                            ||
                            (sCurPrefix == "v" && aCurPrefixes[2] == "u" && sPrevPrefix == "iv")
                            // OR if current prefix is "x" and previous letter prefix is "w" and the previous prefix is "ix" (9)
                            ||
                            (sCurPrefix == "x" && aCurPrefixes[2] == "w" && sPrevPrefix == "ix")
                            // OR if current prefix is "l" and previous letter prefix is "k" and the previous prefix is "xlix" (49)
                            ||
                            (sCurPrefix == "l" && aCurPrefixes[2] == "k" && sPrevPrefix == "xlix")
                            // OR if current prefix is "c" and previous letter prefix is "b" and the previous prefix is "xcix" (99)
                            ||
                            (sCurPrefix == "c" && aCurPrefixes[2] == "b" && sPrevPrefix == "xcix")
                        )) {
                            // Then we need to look ahead to the next prefix to
                            // determine whether the current prefix is a letter or a Roman numeral.
                            // For each of the remaining div.content children...
                            var sNextPrefix;
                            for (var iLookAhead = iX + 1; iLookAhead < aX.length; iLookAhead++) {
                                // If we're on a heading...
                                if (aX[iLookAhead].nodeName.slice(0, 1) === "H") {
                                    sNextPrefix = "";
                                    break;
                                }
                                // Else, if we're on a "p" that isn't a history "p"...
                                else if (aX[iLookAhead].matches('p:not([class^=History])')) {
                                    // If the p begins with a outline level prefix
                                    var reResult2 = reForOutlineLvlPrefix.exec(aX[iLookAhead].textContent);
                                    if (reResult2) {
                                        sNextPrefix = reResult2[1];
                                        break;
                                    }
                                }
                            } //end for the remaining div.content children
                            // If we didn't find a next prefix...
                            if (sNextPrefix == undefined) {
                                // Uhh.....   this means that we don't know whether the current prefix is a letter or a roman numeral
                                // So, just presume -- perhaps incorrectly -- that it's a letter.
                                iCurLvl = iTestLvl;
                            } else { // else we did find a next prefix

                                // Go back through the if-else-if logic to determine what we need to compare the next prefix to.

                                // If the current prefix is "i" and the previous prefix is "h"
                                if (sCurPrefix == "i") {
                                    if (sNextPrefix == "ii") {
                                        iCurLvl = iTestLvl + 1;
                                    } else {
                                        iCurLvl = iTestLvl;
                                    }
                                }
                                // If current prefix is "v" and previous letter prefix is "u" and the previous prefix is "iv" (4)
                                else if (sCurPrefix == "v" && aCurPrefixes[2] == "u" && sPrevPrefix == "iv") {
                                    if (sNextPrefix == "vi") {
                                        iCurLvl = iTestLvl + 1;
                                    } else {
                                        iCurLvl = iTestLvl;
                                    }
                                }
                                // If current prefix is "x" and previous letter prefix is "w" and the previous prefix is "ix" (9)
                                else if (sCurPrefix == "x" && aCurPrefixes[2] == "w" && sPrevPrefix == "ix") {
                                    if (sNextPrefix == "xi") {
                                        iCurLvl = iTestLvl + 1;
                                    } else {
                                        iCurLvl = iTestLvl;
                                    }
                                }
                                // If current prefix is "l" and previous letter prefix is "k" and the previous prefix is "xlix" (49)
                                else if (sCurPrefix == "l" && aCurPrefixes[2] == "k" && sPrevPrefix == "xlix") {
                                    if (sNextPrefix == "li") {
                                        iCurLvl = iTestLvl + 1;
                                    } else {
                                        iCurLvl = iTestLvl;
                                    }
                                }
                                // If current prefix is "c" and previous letter prefix is "b" and the previous prefix is "xcix" (99)
                                else if (sCurPrefix == "c" && aCurPrefixes[2] == "b" && sPrevPrefix == "xcix") {
                                    if (sNextPrefix == "ci") {
                                        iCurLvl = iTestLvl + 1;
                                    } else {
                                        iCurLvl = iTestLvl;
                                    }
                                }
                            } //end else we did find a next prefix
                        } else if (aCurPrefixes.length > 3 && aReLvls[3].test(sCurPrefix)) {
                            iCurLvl = iTestLvl + 1;
                        } else { // Else we've found the correct level.
                            iCurLvl = iTestLvl;
                        }
                        // In either case, we now have the correct level, so break;
                        break;
                    } //end if we found a matching level prefix
                } //end for(each set of level prefixes)
                if (iCurLvl === undefined) {
                    console.log("ORC/OAC-Indenting:  Exiting! Cannot determine level of this outline prefix: \"" + sCurPrefix + "\"");
                    return;
                }
                // Revise the array of previous prefixes so it only has levels lower than the current level
                aCurPrefixes = aCurPrefixes.slice(0, iCurLvl);
                // Append the current prefix
                aCurPrefixes.push(sCurPrefix);

                sPrevPrefix = sCurPrefix;
            } //end if the p begins with an outline level prefix

            // Use the number of levels to set the indenting (pad-left the current "p" element)
            aX[iX].style.paddingLeft = ((aCurPrefixes.length - 1) * iPixelsOfIndentingPerLevel) + "px";

        } //end else-if

    } //end for(...)
    console.log("ORC/OAC-Indenting:  END indenting.");
} //end vIndentContentByLevel()
