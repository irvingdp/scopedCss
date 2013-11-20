if (ScopedCss)
    console.log('ScopedCss already defined');
else {
    var ScopedCss = (function() {
        var _consoleLogging = false;
        var _isJsonpCall = false;
        var _jsonpCallback;
        var _jsonpCalldata;
        var _jsonpcalledURL;
        var _activity = false;

        return {
            ScopeElement: function(id) { //main function , will scoped css style under some element's id.
                run(id);
            },
            SetJsonpCall: function(isCall, url, data, callback) { //if redefind css, trigger jsonp call to send current url data. 
                _isJsonpCall = isCall;
                _jsonpcalledURL = url;
                _jsonpCallback = callback;

                if (!data) data = [];
                data["callback"] = 'ScopedCss._jcallback'; //set callback method value 

                _jsonpCalldata = data;
            },
            _jcallback: function(data) {
                if (_jsonpCallback)
                    _jsonpCallback(data);
            },
            EnableConsoleLog: function() {
                _consoleLogging = true;
            },
            EnableActivity: function() {
                _activity = true;
            }
        }

        function run(targetId) {
            try {
                var isRun = false;
                var isQueryString = false;
                if (queryString('scopedcss') && queryString('scopedcss') == 'true')
                    isQueryString = true;
                else
                    isQueryString = false;

                if (!_activity && !isQueryString)
                    isRun = false;
                else
                    isRun = true;

                if (!isRun) {
                    consoleLog('scopedcss not atcivity');
                    return;
                }
                var scopedCssText = '';
                var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
                for (var i = 0; i < sheets.length; i++) {
                    var currentSheet = sheets[i];
                    var currentSheetOwnerNode = getSheetOwnerNode(currentSheet);

                    if (currentSheetOwnerNode && currentSheetOwnerNode.parentElement && currentSheetOwnerNode.parentElement.id == targetId) {
                        for (var j = 0; j < getCssRule(currentSheet).length; j++) {
                            var currentCssText = popBadCssRule(currentSheet, getCssRule(currentSheet)[j], targetId, j)
                            if (currentCssText) {
                                j--;
                                scopedCssText += currentCssText;
                            }
                        }
                    }
                }
                consoleLog(scopedCssText);
                if (scopedCssText) {
                    createStyleNode(scopedCssText);
                    if (_isJsonpCall && _jsonpcalledURL) {
                        jsonpcall(_jsonpcalledURL, _jsonpCalldata);
                    }
                }
            } catch (err) {
                try {
                    if (_jsonpCalldata) {
                        _jsonpCalldata["exception"] = err.toString();
                        jsonpcall(_jsonpcalledURL, _jsonpCalldata);
                    }
                    consoleLog(err.toString());
                } catch (err2) {}
            }
        }

        function jsonpcall(url, data) {
            var currentScript = null;
            var src = url + (url.indexOf("?") + 1 ? "&" : "?");
            var head = document.getElementsByTagName("head")[0];
            var newScript = document.createElement("script");
            var params = [];
            var param_name = "";
            for (param_name in data) {
                params.push(param_name + "=" + encodeURIComponent(data[param_name]));
            }
            src += params.join("&");

            newScript.type = "text/javascript";
            newScript.src = src;

            if (this.currentScript) head.removeChild(currentScript);
            head.appendChild(newScript);
        }

        function createStyleNode(cssText) {
            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = cssText;
            } else {
                style.appendChild(document.createTextNode(cssText));
            }
            head.appendChild(style);
        }

        function popBadCssRule(sheet, cssRule, targetId, selfIndex) {
            var result = ''
            var selectorTextScoped = '';
            var tmpText = '';
            var hasChanged = false;

            if (cssRule.selectorText) {
                tmpText = cssRule.selectorText.split(',');
                for (var i = 0; i < tmpText.length; i++) {
                    tmpText[i] = trim(tmpText[i]);
                    selectorTextScoped = redefinedSelector(tmpText[i], targetId);
                    if (selectorTextScoped != tmpText[i])
                        hasChanged = true;

                    if (i < tmpText.length - 1)
                        selectorTextScoped += ",";
                };
                if (hasChanged) {
                    result = selectorTextScoped + "{" + cssRule.style.cssText + "}";
                    deleteCssRule(sheet, selfIndex);
                }
            }
            return result;
        }

        function redefinedSelector(selectorText, targetId) {
            if (selectorText.indexOf(".") == 0)
                return selectorText; //skip Class selectors
            else if (selectorText.indexOf("#") == 0)
                return selectorText; //skip  ID selectors
            else if (selectorText.indexOf("*") == 0)
                return selectorText.replace("#" + targetId + "*,#" + targetId); //Universal selector   
            else
                return "#" + targetId + " " + selectorText;
        }

        function deleteCssRule(sheet, index) {
            if (sheet.deleteRule) {
                sheet.deleteRule(index);
            } else if (sheet.removeRule) {
                sheet.removeRule(index);
            }
        }

        function getCssRule(sheet) {
            if (sheet.rules)
                return sheet.rules;
            else if (sheet.cssRules)
                return sheet.cssRules;
        }

        function getSheetOwnerNode(sheet) {
            if (sheet.ownerNode)
                return sheet.ownerNode;
            else if (sheet.owningElement)
                return sheet.owningElement;
        }

        function trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        };

        function consoleLog(log) {
            if (_consoleLogging)
                console.log(log)
        }

        function queryString(name) {
            var AllVars = window.location.search.substring(1);
            var Vars = AllVars.split("&");
            for (i = 0; i < Vars.length; i++) {
                var Var = Vars[i].split("=");
                if (Var[0] == name) return Var[1];
            }
            return "";
        }

    })();
}