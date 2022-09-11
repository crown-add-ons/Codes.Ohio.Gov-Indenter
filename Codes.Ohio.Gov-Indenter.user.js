d// @name        Codes.Ohio.Gov Indenter
// @version     0.0.1
// @description Indents the divisions and subdivisions, etc. in Ohio's online copy of its laws (Revised Code; ORC) and Administrative Code (OAC).
// @author      Crown Add-ons
// @license     CC BY-NC-SA 4.0
// @supportURL  https://github.com/jon-freed/Codes.Ohio.Gov-Indenter.user.js
///////////////////////////////////////////////////////////////////////////////
var pixelsOfIndentingPerLevel = 50;
///////////////////////////////////////////////////////////////////////////////
console.info("Starting script for indenting ORC and OAC content.");
// If the document is loaded...
if (document.readyState !== "loading") {
    // Then do the indenting
    indentContentByLevel();
} else { // Have the browser wait until doc is loaded to do the indenting.
    document.addEventListener('DOMContentLoaded', indentContentByLevel);
}
// Define the function that will do the indenting
function indentContentByLevel() {
    console.info("ORC/OAC-Indenting:  DOM content loaded; BEGIN indenting.");

    // Select the items to be indented...
    var elems = document.querySelectorAll("section.laws-body > span > p");

    // Declare/initialize variables to help us process those children

    // Declare & initialize regular expression to recognize outline level prefixes.
    // Zero or more not-a-word or a whitespace, followed by parentheses that contain at least one character, followed by a whitespace
    var reForOutlineLvlPrefix = /^\W*(\(.+?\))\s+[^\(]/;

    // Declare & initialize an array of arrays of outline level prefixes.
    var stdLevels = [
        ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','BB','CC','DD','EE','FF','GG','HH','II','JJ','KK','LL','MM','NN','OO','PP','QQ','RR','SS','TT','UU','VV','WW','XX','YY','ZZ','AAA','BBB','CCC','DDD','EEE','FFF','GGG','HHH','III','JJJ','KKK','LLL','MMM','NNN','OOO','PPP','QQQ','RRR','SSS','TTT','UUU','VVV','WWW','XXX','YYY','ZZZ'],
        ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'],
        ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','aa','bb','cc','dd','ee','ff','gg','hh','ii','jj','kk','ll','mm','nn','oo','pp','qq','rr','ss','tt','uu','vv','ww','xx','yy','zz','aaa','bbb','ccc','ddd','eee','fff','ggg','hhh','iii','jjj','kkk','lll','mmm','nnn','ooo','ppp','qqq','rrr','sss','ttt','uuu','vvv','www','xxx','yyy','zzz'],
        ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx','xxi','xxii','xxiii','xxiv','xxv','xxvi','xxvii','xxviii','xxix','xxx','xxxi','xxxii','xxxiii','xxxiv','xxxv','xxxvi','xxxvii','xxxviii','xxxix','xl','xli','xlii','xliii','xliv','xlv','xlvi','xlvii','xlviii','xlix','l','li','lii','liii','liv','lv','lvi','lvii','lviii','lix','lx','lxi','lxii','lxiii','lxiv','lxv','lxvi','lxvii','lxviii','lxix','lxx','lxxi','lxxii','lxxiii','lxxiv','lxxv','lxxvi','lxxvii','lxxviii'],
        ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','aa','bb','cc','dd','ee','ff','gg','hh','ii','jj','kk','ll','mm','nn','oo','pp','qq','rr','ss','tt','uu','vv','ww','xx','yy','zz','aaa','bbb','ccc','ddd','eee','fff','ggg','hhh','iii','jjj','kkk','lll','mmm','nnn','ooo','ppp','qqq','rrr','sss','ttt','uuu','vvv','www','xxx','yyy','zzz'],
        ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx','xxi','xxii','xxiii','xxiv','xxv','xxvi','xxvii','xxviii','xxix','xxx','xxxi','xxxii','xxxiii','xxxiv','xxxv','xxxvi','xxxvii','xxxviii','xxxix','xl','xli','xlii','xliii','xliv','xlv','xlvi','xlvii','xlviii','xlix','l','li','lii','liii','liv','lv','lvi','lvii','lviii','lix','lx','lxi','lxii','lxiii','lxiv','lxv','lxvi','lxvii','lxviii','lxix','lxx','lxxi','lxxii','lxxiii','lxxiv','lxxv','lxxvi','lxxvii','lxxviii']
    ];
    // Declare variable to hold a copy of that array of arrays and that will be modified to match the current levels.
    var curLevels;
    // Declare variable to hold the current level
    var curLevel;
    // Declare variables that hold the entire contextual location
    var curLoc;
    var curLocString;

    // Declare variable for indicating whether the level has been found/identified
    var foundLevel;

    // Initialize everything
    curLevel = 0;
    // Reset our array of arrays by creating a copy of the original array of levels
    curLevels = [];
    for(let iL=0; iL<stdLevels.length; iL++) {
        curLevels[iL] = stdLevels[iL].slice(0);
    }
    curLoc = [''];
    curLocString = "";

    // For each element in the selection...
    for (var e = 0; e < elems.length; e++) {
        try {

            // Initialize variable(s)
            foundLevel = false;

            // If the selected element's text begins with a outline level prefix
            var reResult = reForOutlineLvlPrefix.exec(elems[e].textContent);

            var curPrefixes = [];

            if (reResult) {

                // If there are multiple outline level prefixes then they'll become part of this array
                curPrefixes = reResult[1].split(/[\(\)\s]/).filter(i=>i);

                // Get the prefix (from between the parentheses)
                var curPrefix = curPrefixes[0];

                // Use the current level and the current array of arrays to determine whether to stay on the current level or go up or down

                // If the current prefix matches the front-most entry at the current level...
                if( curPrefix === curLevels[curLevel][0] ) {
                    // Then shift off the front-most entry and stay on the current level
                    curLoc[curLoc.length-1] = curLevels[curLevel].shift();
                    foundLevel = true;
                }
                // Else if the current prefix matches the front-most entry at the next level down...
                // (if there is a next level down)
                else if( curLevel+1 < curLevels.length && curPrefix === curLevels[curLevel+1][0] ) {
                    // Then go down to that level and shift off the front-most entry at that level
                    curLevel++;
                    curLoc[curLoc.length] = curLevels[curLevel].shift();
                    foundLevel = true;
                }
                // Else, we need to go up level by level to find the level we're at.
                else {
                    let iWasCurLvl = curLevel;
                    let aWasLvlsCur = [];
                    for(let iL=0; iL<curLevels.length; iL++) {
                        aWasLvlsCur[iL] = curLevels[iL].slice(0);
                    }
                    let aWasCurLoc = curLoc.slice(0);
                    // for each level that we can go up...
                    for( curLevel = curLevel - 1; curLevel >= 0; curLevel-- ) {
                        // Reset the prior level down's array
                        curLevels[curLevel+1] = stdLevels[curLevel+1].slice(0);
                        curLoc.pop();
                        // If the current prefix matches the fore-most entry at the current level...
                        if( curPrefix === curLevels[curLevel][0] ) {
                            // Then shift off the front-most entry and stay on the current level
                            curLoc[curLoc.length-1] = curLevels[curLevel].shift();
                            foundLevel = true;
                            break;
                        }
                    }
                    // But if we didn't find the current level while going up..
                    if( !foundLevel ) {
                        // Then there must be some mistake in the code (see below).
                        // Reset the current level.
                        curLevel = iWasCurLvl;
                        curLoc = aWasCurLoc.slice(0);
                        curLevels = [];
                        for(let iL=0; iL<aWasLvlsCur.length; iL++) {
                            curLevels[iL] = aWasLvlsCur[iL].slice(0);
                        }
                    }
                }

                // If for some reason we haven't found the level...
                if( !foundLevel ) {
                    // Then there just be some mistake in the code, like there was as of October 29, 2019 at
                    // http://codes.ohio.gov/oac/3301-51-01v1 where it jumped from (B)(27) to (B)(29) after
                    // skipping (B)(28)
                    // On the theory that that could happen again, see if the current prefix matches the
                    // second-front-most entry of the current level...
                    if( curLevels[curLevel].length > 1 && curPrefix === curLevels[curLevel][1] ) {
                        // Then shift off the two front-most entries and stay on the current level
                        curLevels[curLevel].shift();
                        curLoc[curLoc.length-1] = curLevels[curLevel].shift();
                    }
                }

            } //end if the selected element's text begins with an outline level prefix

            // Use the number of levels to set the indenting (pad-left the current selected element)
            elems[e].style.paddingLeft = (curLevel * pixelsOfIndentingPerLevel) + "px";

            // If this element had multiple prefixes, then increment the current level to match the number of them
            if( curPrefixes.length > 1 ) {
                for( var p=1; p<curPrefixes.length; p++ ) {
                    curLevel++;
                    curLoc[curLoc.length] = curLevels[curLevel].shift();
                }
            }

        }
        catch(e) {
            console.error('ORC/OAC-Indenting:  ERROR at curLocString = "' + curLocString + '", curPrefix = "' + curPrefix + '"');
            throw e;
        }

        curLocString = '('+curLoc.join(')(')+')';

    } //end for(...)
    console.info("ORC/OAC-Indenting:  END indenting.");
} //end indentContentByLevel()
