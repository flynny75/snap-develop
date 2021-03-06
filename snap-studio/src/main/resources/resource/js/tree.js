define(["require", "exports", "jquery", "common", "commands"], function (require, exports, $, common_1, commands_1) {
    "use strict";
    var FilePath = (function () {
        function FilePath(resourcePath, projectPath, projectDirectory, filePath, fileName, fileDirectory, originalPath) {
            this.resourcePath = resourcePath;
            this.projectPath = projectPath;
            this.projectDirectory = projectDirectory;
            this.filePath = filePath;
            this.fileName = fileName;
            this.fileDirectory = fileDirectory;
            this.originalPath = originalPath;
        }
        return FilePath;
    }());
    exports.FilePath = FilePath;
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
                $.ajax({
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
                    showNodeAndScroll(id, treePath.resourcePath);
                    showNodeAndScroll(id, treePath.resourcePath); // do it twice
                }
            }
        }
        FileTree.showTreeNode = showTreeNode;
        function showNodeAndScroll(treeId, nodeId) {
            var container = document.getElementById("browseParent");
            var tree = $("#" + treeId).fancytree("getTree");
            if (tree && (typeof tree.getNodeByKey === "function")) {
                var treeNode = tree.getNodeByKey(nodeId);
                if (treeNode) {
                    if (treeNode.li && container) {
                        if (!common_1.Common.isChildElementVisible(container, treeNode.li)) {
                            container.scrollTop = 0; // reset the scroll for better calculation
                            container.scrollTop = common_1.Common.calculateScrollOffset(container, treeNode.li);
                        }
                    }
                    treeNode.setActive();
                }
            }
        }
        function showFancyTree(id, dragAndDrop, treeMenuHandler, clickCallback) {
            // using default options
            // https://github.com/mar10/fancytree/blob/master/demo/sample-events.html
            $('#' + id).fancytree({
                //autoScroll: true,
                //extensions: dragAndDrop ? ["dnd"] : [],
                click: clickCallback,
                expand: function (event, data) {
                    if (typeof commands_1.Command !== 'undefined') {
                        commands_1.Command.folderExpand(data.node.key);
                        setTimeout(function () {
                            addTreeMenuHandler(id, treeMenuHandler);
                            addDragAndDropHandlers(id);
                        }, 10);
                    }
                },
                collapse: function (event, data) {
                    if (typeof commands_1.Command !== 'undefined') {
                        commands_1.Command.folderCollapse(data.node.key);
                        setTimeout(function () {
                            addTreeMenuHandler(id, treeMenuHandler);
                            addDragAndDropHandlers(id);
                        }, 10);
                    }
                },
                init: function (event, data, flag) {
                    addTreeMenuHandler(id, treeMenuHandler);
                    addDragAndDropHandlers(id);
                }
            });
        }
        function addDragAndDropHandlers(id) {
            var explorerTree = document.getElementById(id);
            var folders = common_1.Common.getElementsByClassName(explorerTree, 'fancytree-folder');
            var _loop_1 = function() {
                var child = folders[i];
                $(child).on("dragenter", function (event) {
                    $(child).find('.fancytree-title').addClass("treeFolderDragOver");
                }).on("dragleave", function (event) {
                    $(child).find('.fancytree-title').removeClass("treeFolderDragOver");
                }).on("drop", function (event) {
                    var folderElement = $(child).find('.fancytree-title');
                    var dataTransfer = event.target.dataTransfer || event.originalEvent.dataTransfer;
                    var target = event.target || event.currentTarger;
                    var fromPath = dataTransfer.getData("resource");
                    var folderPath = $(folderElement).attr("title");
                    $(folderElement).removeClass("treeFolderDragOver");
                    event.stopPropagation();
                    event.preventDefault();
                    if (fromPath) {
                        var toPath = {
                            resource: folderPath,
                            folder: isTreeNodeFolder(target)
                        };
                        handleNodeDroppedOverFolder(event, JSON.parse(fromPath), toPath);
                    }
                    else {
                        handleFileDroppedOverFolder(event, folderPath);
                    }
                }).on('dragover', function (event) {
                    event.preventDefault();
                });
                updateNodesAsDraggable(explorerTree);
            };
            for (var i = 0; i < folders.length; i++) {
                _loop_1();
            }
        }
        function updateNodesAsDraggable(nodeElement) {
            var childNodes = common_1.Common.getElementsByClassName(nodeElement, 'fancytree-node');
            var _loop_2 = function() {
                var childNode = childNodes[i];
                if (childNode) {
                    childNode.setAttribute("draggable", "true");
                    $(childNode).on('dragstart', function (event) {
                        var dataTransfer = event.target.dataTransfer || event.originalEvent.dataTransfer;
                        var target = event.target || event.currentTarger;
                        var titleNodes = common_1.Common.getElementsByClassName(childNode, 'fancytree-title');
                        if (titleNodes && titleNodes.length > 0) {
                            var titleNode = titleNodes[0];
                            dataTransfer.setData("resource", JSON.stringify({
                                resource: titleNode.getAttribute("title"),
                                folder: isTreeNodeFolder(target) // this does not work
                            }));
                        }
                    });
                }
            };
            for (var i = 0; i < childNodes.length; i++) {
                _loop_2();
            }
        }
        function addTreeMenuHandler(id, treeMenuHandler) {
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
                        { title: "&nbsp;Debug", cmd: "debugScript", uiIcon: "menu-debug" },
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
        function handleFileDroppedOverFolder(dropEvent, folderPath) {
            var droppedFiles = dropEvent.target.files || dropEvent.originalEvent.dataTransfer.files || dropEvent.dataTransfer.files;
            if (droppedFiles) {
                // process all File objects
                for (var i = 0; i < droppedFiles.length; i++) {
                    var droppedFile = droppedFiles[i];
                    if (isAdvancedFileUpload()) {
                        console.log("file=" + droppedFile.name + " folder=" + folderPath);
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            var encodedFile = encodeFileArrayBufferAsBase64(event.target.result);
                            commands_1.Command.uploadFileTo(droppedFile.name, folderPath, encodedFile);
                        };
                        reader.readAsArrayBuffer(droppedFile);
                    }
                }
            }
        }
        function handleNodeDroppedOverFolder(dropEvent, fromPath, toPath) {
            commands_1.Command.dragAndDropFile(fromPath, toPath);
        }
        function isTreeNodeFolder(nodeElement) {
            var folders = $(nodeElement).filter('.fancytree-folder');
            if (folders) {
                return folders.length > 0;
            }
            return false;
        }
        function encodeFileArrayBufferAsBase64(fileAsArrayBuffer) {
            var binary = '';
            var bytes = new Uint8Array(fileAsArrayBuffer);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
        function isAdvancedFileUpload() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        }
        function isResourceFolder(path) {
            if (!common_1.Common.stringEndsWith(path, "/")) {
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
                if (common_1.Common.stringEndsWith(cleanPath, "/")) {
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
            return new FilePath(cleanResourcePath(currentResourcePath), // /resource/<project>/blah/script.snap
            cleanResourcePath(currentProjectPath), // /blah/script.snap
            cleanResourcePath(currentProjectDirectory == "" ? "/" : currentProjectDirectory), // /blah
            cleanResourcePath(currentFilePath), // /blah/script.snap
            cleanResourcePath(currentFileName), // script.snap
            cleanResourcePath(currentFileDirectory), // /blah
            path);
        }
        FileTree.createResourcePath = createResourcePath;
        ;
    })(FileTree = exports.FileTree || (exports.FileTree = {}));
});
//ModuleSystem.registerModule("tree", "Tree module: tree.js", null, null, [ "common" ]); 
