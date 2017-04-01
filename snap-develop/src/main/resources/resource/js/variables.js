var VariableManager;
(function (VariableManager) {
    var expandVariableHistory = {};
    var expandEvaluationHistory = {};
    function toggleExpandVariable(name) {
        var variablePaths = expandVariableTree(name, expandVariableHistory);
        if (variablePaths != null) {
            Command.browseScriptVariables(variablePaths);
        }
    }
    VariableManager.toggleExpandVariable = toggleExpandVariable;
    function toggleExpandEvaluation(name, expression) {
        var variablePaths = expandVariableTree(name, expandEvaluationHistory);
        if (variablePaths != null) {
            Command.browseScriptEvaluation(variablePaths, expression, false);
        }
    }
    VariableManager.toggleExpandEvaluation = toggleExpandEvaluation;
    function expandVariableTree(name, variableHistory) {
        var threadScope = ThreadManager.focusedThread();
        var expandPath = name + ".*"; // this ensures they sort in sequence with '.' notation, e.g blah.foo.*
        var removePrefix = name + ".";
        if (threadScope != null) {
            var variablePaths = variableHistory[threadScope.thread];
            if (variablePaths == null) {
                variablePaths = [];
                variableHistory[threadScope.thread] = variablePaths;
            }
            var removePaths = [];
            for (var i = 0; i < variablePaths.length; i++) {
                var currentPath = variablePaths[i];
                if (currentPath.indexOf(removePrefix) == 0) {
                    removePaths.push(currentPath); // remove variable
                }
            }
            for (var i = 0; i < removePaths.length; i++) {
                var removePath = removePaths[i];
                var removeIndex = variablePaths.indexOf(removePath);
                if (removeIndex != -1) {
                    variablePaths.splice(removeIndex, 1); // remove variable
                }
            }
            if (removePaths.length == 0) {
                variablePaths.push(expandPath); // add variablePaths}
            }
            return variablePaths;
        }
        return null;
    }
    function showVariables() {
        var localVariables = ThreadManager.focusedThreadVariables();
        var evaluationVariables = ThreadManager.focusedThreadEvaluation();
        showVariablesGrid(localVariables, 'variables', false);
        showVariablesGrid(evaluationVariables, 'evaluation', true);
    }
    VariableManager.showVariables = showVariables;
    function showVariablesGrid(threadVariables, gridName, expressions) {
        var sortedNames = [];
        var variableRecords = [];
        var variableIndex = 1;
        for (var variableName in threadVariables) {
            if (threadVariables.hasOwnProperty(variableName)) {
                sortedNames.push(variableName); // add a '.' to ensure dot notation sorts e.g x.y.z
            }
        }
        sortedNames.sort();
        for (var i = 0; i < sortedNames.length; i++) {
            var variableName = sortedNames[i];
            var variable = threadVariables[variableName];
            var variableExpandable = "" + variable.expandable;
            var variableRoot = variable.depth == 0; // style the root differently
            var variableProperty = "" + variable.property;
            var variableModifiers = variable.modifiers;
            var displayStyle = "variableLeaf";
            if (variableRoot && expressions) {
                displayStyle = "variableExpression";
            }
            else {
                if (variableProperty == "true") {
                    if (variableModifiers.indexOf("[private]") != -1) {
                        displayStyle = "variableNodePrivate";
                    }
                    else if (variableModifiers.indexOf("[protected]") != -1) {
                        displayStyle = "variableNodeProtected";
                    }
                    else if (variableModifiers.indexOf("[public]") != -1) {
                        displayStyle = "variableNodePublic";
                    }
                    else {
                        displayStyle = "variableNode"; // default
                    }
                }
            }
            var displayValue = "<div class='variableData'>" + escapeHtml(variable.value) + "</div>";
            var displayName = "<div title='" + escapeHtml(variable.description) + "' style='padding-left: " +
                (variable.depth * 20) +
                "px;'><div class='" + displayStyle +
                "'>" + escapeHtml(variable.name) + "</div></div>";
            variableRecords.push({
                recid: variableIndex++,
                path: variableName,
                name: displayName,
                value: displayValue,
                type: variable.type,
                expandable: variableExpandable == "true"
            });
        }
        var variableGrid = w2ui[gridName];
        if (variableGrid != null) {
            variableGrid.records = variableRecords;
            variableGrid.refresh();
        }
    }
    function clearEvaluation() {
        expandEvaluationHistory = {};
        //   w2ui['evaluation'].records = [];
        //   w2ui['evaluation'].refresh();
    }
    VariableManager.clearEvaluation = clearEvaluation;
    function clearVariables() {
        expandVariableHistory = {};
        w2ui['variables'].records = [];
        w2ui['variables'].refresh();
    }
    VariableManager.clearVariables = clearVariables;
})(VariableManager || (VariableManager = {}));
ModuleSystem.registerModule("variables", "Variables module: variables.js", null, null, ["common"]);
