var FileTree;
(function (FileTree) {
    function createTree(treePath, element, id, expandPath, foldersOnly, treeMenuHandler, clickCallback) {
        createTreeOfDepth(treePath, element, id, expandPath, foldersOnly, treeMenuHandler, clickCallback, 10000); // large random depth
    }
    FileTree.createTree = createTree;
    function createTreeOfDepth(treePath, element, id, expandPath, foldersOnly, treeMenuHandler, clickCallback, depth) {
        $(document).ready(function () {
            var project = document.title;
            var requestPath = '/tree' + treePath + "?id=" + id + "&folders=" + foldersOnly + "&depth=" + depth;
            if (expandPath != null) {
                requestPath += "&expand=" + expandPath;
            }
            jQuery.ajax({
                url: requestPath,
                success: function (response) {
                    $('#' + element).html(response);
                    showFancyTree(id, !foldersOnly, treeMenuHandler, clickCallback); // show the fancy tree
                },
                async: true
            });
        });
    }
    FileTree.createTreeOfDepth = createTreeOfDepth;
    function showTreeNode(id, treePath) {
        if (id && treePath) {
            if (treePath.resourcePath) {
                $("#" + id).fancytree("getTree").getNodeByKey(treePath.resourcePath).setActive();
            }
        }
    }
    FileTree.showTreeNode = showTreeNode;
    function showFancyTree(id, dragAndDrop, treeMenuHandler, clickCallback) {
        var dnd = {
            autoExpandMS: 400,
            focusOnClick: true,
            preventVoidMoves: true,
            preventRecursiveMoves: true,
            dragStart: function (node, data) {
                /** This function MUST be defined to enable dragging for the tree.
                 *  Return false to cancel dragging of node.
                 */
                return true;
            },
            dragEnter: function (node, data) {
                /** data.otherNode may be null for non-fancytree droppables.
                 *  Return false to disallow dropping on node. In this case
                 *  dragOver and dragLeave are not called.
                 *  Return 'over', 'before, or 'after' to force a hitMode.
                 *  Return ['before', 'after'] to restrict available hitModes.
                 *  Any other return value will calc the hitMode from the cursor position.
                 */
                // Prevent dropping a parent below another parent (only sort
                // nodes under the same parent)
                /* if(node.parent !== data.otherNode.parent){
                  return false;
                }
                // Don't allow dropping *over* a node (would create a child)
                return ["before", "after"];
                */
                if (typeof Command !== 'undefined') {
                    return Command.isDragAndDropFilePossible({
                        name: data.otherNode.key,
                        folder: data.otherNode.folder == true
                    }, {
                        name: node.key,
                        folder: node.folder == true
                    });
                }
                return false;
            },
            dragDrop: function (node, data) {
                /** This function MUST be defined to enable dropping of items on
                 *  the tree.
                 */
                //data.otherNode.moveTo(node, data.hitMode); 
                if (typeof Command !== 'undefined') {
                    Command.dragAndDropFile({
                        name: data.otherNode.key,
                        folder: data.otherNode.folder == true
                    }, {
                        name: node.key,
                        folder: node.folder == true
                    });
                }
            }
        };
        // using default options
        $('#' + id).fancytree({
            extensions: dragAndDrop ? ["dnd"] : [],
            click: clickCallback,
            expand: function (event, data) {
                if (typeof Command !== 'undefined') {
                    Command.folderExpand(data.node.key);
                }
            },
            collapse: function (event, data) {
                if (typeof Command !== 'undefined') {
                    Command.folderCollapse(data.node.key);
                }
            },
            dnd: dragAndDrop ? dnd : null
        });
        if (treeMenuHandler != null) {
            $("#" + id).contextmenu({
                delegate: "span.fancytree-title",
                menu: [
                    { title: "&nbsp;New", uiIcon: "menu-new", children: [
                            { title: "&nbsp;File", cmd: "newFile", uiIcon: "menu-new" },
                            { title: "&nbsp;Directory", cmd: "newDirectory", uiIcon: "menu-new" }
                        ] },
                    { title: "&nbsp;Save", cmd: "saveFile", uiIcon: "menu-save" },
                    { title: "&nbsp;Rename", cmd: "renameFile", uiIcon: "menu-rename" },
                    { title: "&nbsp;Delete", cmd: "deleteFile", uiIcon: "menu-trash", disabled: false },
                    { title: "&nbsp;Run", cmd: "runScript", uiIcon: "menu-run" },
                    { title: "&nbsp;Explore", cmd: "exploreDirectory", uiIcon: "menu-explore" } //,              
                ],
                beforeOpen: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    node.setActive();
                    var $menu = ui.menu, $target = ui.target, extraData = ui.extraData; // passed when menu was opened by call to open()
                    ui.menu.zIndex($(event.target).zIndex() + 2000);
                },
                select: function (event, ui) {
                    var node = $.ui.fancytree.getNode(ui.target);
                    var resourcePath = createResourcePath(node.tooltip);
                    var commandName = ui.cmd;
                    var elementId = ui.key;
                    treeMenuHandler(resourcePath, commandName, elementId, node.isFolder());
                }
            });
        }
    }
    function isResourceFolder(path) {
        if (!stringEndsWith(path, "/")) {
            var parts = path.split(".");
            if (path.length === 1 || (parts[0] === "" && parts.length === 2)) {
                return true;
            }
            var extension = parts.pop();
            var slash = extension.indexOf('/');
            return slash >= 0;
        }
        return true;
    }
    FileTree.isResourceFolder = isResourceFolder;
    function cleanResourcePath(path) {
        if (path != null) {
            var cleanPath = path.replace(/\/+/, "/").replace(/\.#/, ""); // replace // with /
            while (cleanPath.indexOf("//") != -1) {
                cleanPath = cleanPath.replace("//", "/"); // remove double slashes like /x/y//z.snap
            }
            if (stringEndsWith(cleanPath, "/")) {
                cleanPath = cleanPath.substring(0, cleanPath.length - 1);
            }
            return cleanPath;
        }
        return null;
    }
    FileTree.cleanResourcePath = cleanResourcePath;
    function createResourcePath(path) {
        var resourcePathPrefix = "/resource/" + document.title + "/";
        var resourcePathRoot = "/resource/" + document.title;
        while (path.indexOf("//") != -1) {
            path = path.replace("//", "/"); // remove double slashes like /x/y//z.snap
        }
        if (path == resourcePathRoot || path == resourcePathPrefix) {
            var currentPathDetails = {
                resourcePath: resourcePathPrefix,
                projectPath: "/",
                projectDirectory: "/",
                filePath: "/",
                fileName: null,
                fileDirectory: "/",
                originalPath: path
            };
            var currentPathText = JSON.stringify(currentPathDetails);
            //console.log("FileTree.createResourcePath(" + path + "): " + currentPathText);
            return currentPathDetails;
        }
        //console.log("FileTree.createResourcePath(" + path + ")");
        if (!path.indexOf("/") == 0) {
            path = "/" + path; // /snap.script
        }
        if (!path.indexOf(resourcePathPrefix) == 0) {
            path = "/resource/" + document.title + path;
        }
        var isFolder = isResourceFolder(path); // /resource/<project>/blah/
        var pathSegments = path.split("/"); // [0="", 1="resource", 2="<project>", 3="blah", 4="script.snap"]
        var currentResourcePath = "/resource/" + document.title;
        var currentProjectPath = "";
        var currentProjectDirectory = "";
        var currentFileName = null;
        var currentFilePath = "";
        var currentFileDirectory = "";
        for (var i = 3; i < pathSegments.length; i++) {
            currentResourcePath += "/" + pathSegments[i];
            currentProjectPath += "/" + pathSegments[i];
            currentFilePath += "/" + pathSegments[i];
        }
        if (isFolder) {
            var currentFileName = pathSegments[pathSegments.length - 1];
            if (pathSegments.length > 3) {
                for (var i = 3; i < pathSegments.length; i++) {
                    currentProjectDirectory += "/" + pathSegments[i];
                    currentFileDirectory += "/" + pathSegments[i];
                }
            }
            else {
                currentFileDirectory = "/";
            }
        }
        else {
            var currentFileName = pathSegments[pathSegments.length - 1];
            if (pathSegments.length > 4) {
                for (var i = 3; i < pathSegments.length - 1; i++) {
                    currentProjectDirectory += "/" + pathSegments[i];
                    currentFileDirectory += "/" + pathSegments[i];
                }
            }
            else {
                currentFileDirectory = "/";
            }
        }
        var currentPathDetails = {
            resourcePath: cleanResourcePath(currentResourcePath),
            projectPath: cleanResourcePath(currentProjectPath),
            projectDirectory: cleanResourcePath(currentProjectDirectory == "" ? "/" : currentProjectDirectory),
            filePath: cleanResourcePath(currentFilePath),
            fileName: cleanResourcePath(currentFileName),
            fileDirectory: cleanResourcePath(currentFileDirectory),
            originalPath: path
        };
        var currentPathText = JSON.stringify(currentPathDetails);
        //console.log("FileTree.createResourcePath(" + path + "): " + currentPathText);
        return currentPathDetails;
    }
    FileTree.createResourcePath = createResourcePath;
})(FileTree || (FileTree = {}));
ModuleSystem.registerModule("tree", "Tree module: tree.js", null, null, ["common"]);
