import * as $ from "jquery"
import {w2ui, w2popup} from "w2ui"
import {Common} from "common"
import {EventBus} from "socket"
import {ProcessConsole} from "console"
import {ProblemManager} from "problem"
import {FileEditor} from "editor"
import {LoadSpinner} from "spinner"
import {FileTree} from "tree"
import {ThreadManager} from "threads"
import {History} from "history"
import {VariableManager} from "variables"
import {FileExplorer} from "explorer"
import {Command} from "commands" 
import {DebugManager} from "debug"
import {KeyBinder} from "keys"

export module Project {
   
   var currentDisplayInfo: any = {};
   var doubleClickTimes: any = {};

   export function createMainLayout() {
      var perspective = determineProjectLayout();
      
      if (perspective == "debug") {
         createDebugLayout(); // show debug layout
      } else {
         createExploreLayout();
      }
      $(window).trigger('resize'); // force a redraw after w2ui

   }
   
   export function startMainLayout() {
      var perspective = determineProjectLayout();
      
      if (perspective == "debug") {
         startDebugLayout(); // show debug layout
      } else {
         startExploreLayout();
      }
      startResizePoller(); // dynamically resize the editor
      attachClickEvents();
   }
   
   function attachClickEvents() {
      $('#toolbarResize').on('click', function(e) {
         toggleFullScreen();
         e.preventDefault();
      });
      $('#toolbarSwitchLayout').on('click', function(e) {
         Command.switchLayout();
         e.preventDefault();
      });
      $('#toolbarSwitchProject').on('click', function(e) {
         Command.switchProject();
         e.preventDefault();
      });
      $('#toolbarNavigateBack').on('click', function(e) {
         History.navigateBackward();
         e.preventDefault();
      });
      $('#toolbarNavigateForward').on('click', function(e) {
         History.navigateForward();
         e.preventDefault();
      });
      $('#editorTheme').on('change', function(e) {
         changeEditorTheme();
         e.preventDefault();
      });
      $('#fontFamily').on('change', function(e) {
         changeProjectFont();
         e.preventDefault();
      });
      $('#fontSize').on('change', function(e) {
         changeProjectFont();
         e.preventDefault();
      });
      $('#newFile').on('click', function(e) {
         Command.newFile(null);
         e.preventDefault();
      });
      $('#saveFile').on('click', function(e) {
         Command.saveFile(null);
         e.preventDefault();
      });
      $('#deleteFile').on('click', function(e) {
         Command.deleteFile(null);
         e.preventDefault();
      });
      $('#searchTypes').on('click', function(e) {
         Command.searchTypes();
         e.preventDefault();
      });
      $('#runScript').on('click', function(e) {
         Command.runScript();
         e.preventDefault();
      });
      $('#debugScript').on('click', function(e) {
         Command.debugScript();
         e.preventDefault();
      });
      $('#stopScript').on('click', function(e) {
         Command.stopScript();
         e.preventDefault();
      });
      $('#resumeScript').on('click', function(e) {
         Command.resumeScript();
         e.preventDefault();
      });
      $('#stepInScript').on('click', function(e) {
         Command.stepInScript();
         e.preventDefault();
      });
      $('#stepOutScript').on('click', function(e) {
         Command.stepOutScript();
         e.preventDefault();
      });
      $('#stepOverScript').on('click', function(e) {
         Command.stepOverScript();
         e.preventDefault();
      });
      $('#evaluateExpression').on('click', function(e) {
         Command.evaluateExpression();
         e.preventDefault();
      });  
      $('#navigateToTreeArrow').on('click', function(e) {
         FileEditor.showEditorFileInTree();
         e.preventDefault();
      });  
   }
   
   function determineProjectLayout() {
      var debugToggle = ";debug";
      var locationPath = window.document.location.pathname;
      var locationHash = window.document.location.hash;
      var debug = locationPath.indexOf(debugToggle, locationPath.length - debugToggle.length) !== -1;
      
      if(debug) {
         return "debug";
      }
      return "explore";
   }
   
   function startResizePoller() { // because w2ui onResize not working
      var editorWidth = 0;
      var editorHeight = 0;
      
      setInterval(function() {
         var editorElement = document.getElementById("editor");
         
         if(editorElement != null) {
            var currentWidth = editorElement.offsetWidth;
            var currentHeight = editorElement.offsetHeight;
            
            if(editorWidth != currentWidth || editorHeight != currentHeight) {
               editorWidth = currentWidth;
               editorHeight = currentHeight;
               FileEditor.resizeEditor();
            }
         }
      }, 100);
   }
   
   export function changeProjectFont(){
      var fontFamily: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontFamily");
      var fontSize: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontSize");
      
      if(fontSize != null && fontFamily != null) {
         var fontSizeOption: HTMLOptionElement = <HTMLOptionElement>fontSize.options[fontSize.selectedIndex];
         var fontFamilyOption: HTMLOptionElement = <HTMLOptionElement>fontFamily.options[fontFamily.selectedIndex];
         var fontSizeValue = fontSizeOption.value;
         var fontFamilyValue = fontFamilyOption.value;
         
         FileEditor.updateEditorFont(fontFamilyValue, fontSizeValue);
         ProcessConsole.updateConsoleFont(fontFamilyValue, fontSizeValue);
         
         var displayInfo = currentProjectDisplay();
         Command.updateDisplay(displayInfo);
      }
   }
   
   export function changeEditorTheme(){
      var editorTheme: HTMLSelectElement = <HTMLSelectElement>document.getElementById("editorTheme");
      
      if(editorTheme != null) {
         var themeOption: HTMLOptionElement = <HTMLOptionElement>editorTheme.options[editorTheme.selectedIndex];
         var themeName = themeOption.value.toLowerCase();
         FileEditor.setEditorTheme("ace/theme/" + themeName);
         
         var displayInfo = currentProjectDisplay();
         Command.updateDisplay(displayInfo);
         
         if(isProjectThemeChange(displayInfo.themeName)) { // do we need to refresh
            Command.refreshScreen(); // refresh the whole screen
         }
      }
   }
    
   export function toggleFullScreen() {
      var perspective = determineProjectLayout();
   
      if (perspective == "debug") {
         var topPanel = w2ui['debugEditorLayout'].get("top");
         var bottomPanel = w2ui['debugEditorLayout'].get("bottom");
         
         if(topPanel.hidden || bottomPanel.hidden) {
            w2ui['debugEditorLayout'].show("top");
            w2ui['debugEditorLayout'].show("bottom"); 
         } else {
            w2ui['debugEditorLayout'].hide("top");
            w2ui['debugEditorLayout'].hide("bottom"); 
         }
      } else {
         var leftPanel = w2ui['exploreMainLayout'].get("left");
         var bottomPanel = w2ui['exploreEditorLayout'].get("bottom");
         
         if(leftPanel.hidden || bottomPanel.hidden) {
            w2ui['exploreMainLayout'].show("left", true);
            w2ui['exploreEditorLayout'].show("bottom");
         } else {
            w2ui['exploreMainLayout'].hide("left", true);
            w2ui['exploreEditorLayout'].hide("bottom");
         }
      }
   }
   
   function isProjectThemeChange(name) {
      if(currentDisplayInfo) {
         return currentDisplayInfo.themeName != name.toLowerCase(); // if they are not the same
      }
      return false;
   }
   
   function currentProjectDisplay(){
      var fontFamily: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontFamily");
      var fontSize: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontSize");
      var editorTheme: HTMLSelectElement = <HTMLSelectElement>document.getElementById("editorTheme");
   
      return {
         consoleCapacity: 50000,
         themeName: editorTheme.value.toLowerCase().trim(),
         fontSize: fontSize.value.toLowerCase().replace("px", "").trim(), // get font size
         fontName: fontFamily.value
      };
   }
   
   function applyProjectTheme() {
      $.get("/display/"+document.title, function(displayInfo) {
         currentDisplayInfo = displayInfo; // save display info
         
         if(displayInfo.fontName != null && displayInfo.fontSize != null) {
            var fontFamily: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontFamily");
            var fontSize: HTMLSelectElement = <HTMLSelectElement>document.getElementById("fontSize");
            var editorTheme: HTMLSelectElement = <HTMLSelectElement>document.getElementById("editorTheme");
            
            if(fontSize != null) {
               fontSize.value = displayInfo.fontSize + "px";
            }
            if(fontFamily != null) {
               fontFamily.value = displayInfo.fontName;
            }   
            if(editorTheme != null && displayInfo.themeName != null) {
               editorTheme.value = displayInfo.themeName;
            }
            if(displayInfo.consoleCapacity != null) {
               ProcessConsole.updateConsoleCapacity(Math.max(displayInfo.consoleCapacity, 5000)); // don't allow stupidly small size
            }
            if(displayInfo.logoImage != null) {
               var toolbarRow: HTMLTableRowElement = <HTMLTableRowElement>document.getElementById("toolbarRow"); // this is pretty rubbish, but it works!
               
               toolbarRow.insertCell(0).innerHTML = "<div class='toolbarSeparator'></div>";
               toolbarRow.insertCell(0).innerHTML = "&nbsp;";
               toolbarRow.insertCell(0).innerHTML = "&nbsp;";
               toolbarRow.insertCell(0).innerHTML = "<div><img style='height: 25px; margin-top: -1px;' src='" + displayInfo.logoImage + "'></div>"; // /img/logo_grey_shade.png
            }
         }
         changeProjectFont();// update the fonts
         changeEditorTheme(); // change editor theme
      });
   }
   
   function showBrowseTreeContent(containsBrowse) { // hack to render tree
      if(containsBrowse) {
         // move the explorer
         var newParent = document.getElementById('browseParent');
         var oldParent = document.getElementById('browseParentHidden');
      
         if(oldParent != null && newParent != null){
            while (oldParent.childNodes.length > 0) {
                newParent.appendChild(oldParent.childNodes[0]);
            }
         }
      }
   }
   
   function hideBrowseTreeContent(containsBrowse) { // hack to render tree
      if(containsBrowse) {
         // move the explorer
         var newParent = document.getElementById('browseParentHidden');
         var oldParent = document.getElementById('browseParent');
      
         if(oldParent != null && newParent != null){
            while (oldParent.childNodes.length > 0) {
                newParent.appendChild(oldParent.childNodes[0]);
            }
         }
      }
   }
   
   function showEditorContent(containsEditor) { // hack to render editor
      if(containsEditor) {
         var location = window.location.hash;
         var hashIndex = location.indexOf('#');
         
         if(hashIndex == -1) { // no path specified
            showEditorHelpContent(containsEditor);
         } else {
            showEditorFileContent(containsEditor);
         }
      
      }
   }
   
   function showEditorFileContent(containsEditor) {
      var newParent = document.getElementById('editParent');
      var oldParent = document.getElementById('editParentHidden');
   
      if(oldParent != null && newParent != null){
         $("#help").remove();
         
         while (oldParent.childNodes.length > 0) {
             newParent.appendChild(oldParent.childNodes[0]);
         }
      }
      updateEditorTabName();
   }
   
   function showEditorHelpContent(containsEditor) { // hack to render editor
      var newParent = document.getElementById('editParent');
      var editorFileName = document.getElementById("editFileName");
      
      if(newParent != null && editorFileName != null) {
         var keyBindings = KeyBinder.getKeyBindings();
         var content = "";
         
         content += "<div id='help'>"
         content += "<div id='keyBindings'>";
         content += "<table border='0'>";
         
         for(var keyBinding in keyBindings) {
            if(keyBindings.hasOwnProperty(keyBinding)) {
               var description = keyBindings[keyBinding];
               
               content += "<tr>";
               content += "<td><div class='helpBullet'></div></td>";
               content += "<td align='left'>&nbsp;&nbsp;" + keyBinding + "</td>";
               content += "<td align='left'>&nbsp;&nbsp;&nbsp;&nbsp;" + description + "</td>";
               content += "</td>";
            }
         }
         content += "</table>";
         content += "</div>";
         content += "</div>";
         
         $("#editParent").html(content);
      }
      updateEditorTabName();
   }

   export function clickOnTab(name, doubleClickFunction) {
      var currentTime = new Date().getTime();
      var previousTime = doubleClickTimes[name];

      if(previousTime) {
         if((currentTime - previousTime) < 200) {
            doubleClickFunction();
         }
      }
      doubleClickTimes[name] = currentTime;
   }
   
   function updateEditorTabName() {
      var editorData = FileEditor.loadEditor();
      var editorFileName = document.getElementById("editFileName");
      
      if(editorFileName != null){
         var editorData = FileEditor.loadEditor();
         
         if(editorData != null && editorData.resource != null) {
            editorFileName.innerHTML = "<span title='" + editorData.resource.resourcePath +"'>&nbsp;" + editorData.resource.fileName + "&nbsp;</span>";
         }
      }
   }
   
   function findActiveEditorLayout() {
      var tabs = w2ui['exploreEditorTabLayout'];
   
      if(tabs == null) {
         return w2ui['debugEditorTabLayout'];
      }
      return tabs;
   }
   
   function findActiveEditorTabLayout() {
      var tabs = findActiveEditorLayout();
      
      if(tabs != null) {
         return tabs.panels[0].tabs;
      }
      return null;
   }
   
   export function closeEditorTab() {
      var data = FileEditor.loadEditor();
      
      if(data.resource) {      
         var tabs = findActiveEditorTabLayout();
         
         if(tabs.tabs.length > 1) {
            deleteEditorTab(data.resource.resourcePath);
         }
      }
   }
   
   export function deleteEditorTab(resource) {
      var layout = findActiveEditorLayout();
      var tabs = findActiveEditorTabLayout();
      
      if(tabs != null && resource != null) {
         var removeTab = tabs.get(resource);
         
         if(removeTab.closable) {
            tabs.remove(resource); // remove the tab
            
            if(removeTab.active) {
               activateAnyEditorTab(resource); // if it was active then activate another
            }
         }
      }
   }
   
   export function renameEditorTab(from, to) {
      var layout = findActiveEditorLayout();
      var tabs = findActiveEditorTabLayout();
      var editorData = FileEditor.loadEditor();
      
      if(tabs != null && from != null && to != null) {
         var tabList = tabs.tabs;
         var count = 0;
         
         for(var i = 0; i < tabList.length; i++) {
            var nextTab = tabList[i];
            
            if(nextTab != null && nextTab.id == from) {
               var newTab = JSON.parse(JSON.stringify(nextTab)); // clone the tab
               var toPath = FileTree.createResourcePath(to);
               var fromPath = FileTree.createResourcePath(from);
   
               tabs.remove(nextTab.id); // remove the tab
   
               if(nextTab.active) {
                  FileExplorer.openTreeFile(toPath.resourcePath, function(){}); // browse style makes no difference here
               } else {
                  var fileNameReplace = new RegExp(fromPath.fileName, "g");
                  var filePathReplace = new RegExp(fromPath.resourcePath, "g");
                  
                  newTab.caption = newTab.caption.replace(fileNameReplace, toPath.fileName).replace(filePathReplace, toPath.resourcePath); // rename the tab
                  newTab.text = newTab.text.replace(fileNameReplace, toPath.fileName).replace(filePathReplace, toPath.resourcePath); // rename the tab
                  newTab.id = toPath.resourcePath;
                  tabs.add(newTab);
               }
               break;
            }
         }
      }
   }
   
   export function createEditorTab() {
      var layout = findActiveEditorLayout();
      var tabs = findActiveEditorTabLayout();
      var editorData = FileEditor.loadEditor();
      
      if(tabs != null && editorData != null && editorData.resource != null) {
         var tabList = tabs.tabs;
         var tabResources = {};
         
         for(var i = 0; i < tabList.length; i++) {
            var nextTab = tabList[i];
            
            if(nextTab != null && nextTab.id != 'editTab') {
               tabResources[nextTab.id] = {
                  id : nextTab.id,
                  caption : nextTab.caption.replace('id="editFileName"', "").replace("id='editFileName'", ""),
                  content : "",
                  closable: true,
                  active: false
               }
            }
         }
         tabResources[editorData.resource.resourcePath] = { 
            id : editorData.resource.resourcePath,
            caption : "<div class='editTab' id='editFileName'><span title='" + editorData.resource.resourcePath +"'>&nbsp;" + editorData.resource.fileName + "&nbsp;</span></div>",
            content : "<div style='overflow: scroll; font-family: monospace;' id='edit'><div id='editParent'></div></div>",
            closable: true,
            active: true
         };
         var sortedNames = [];
         var sortedTabs = [];
         
         for (var tabResource in tabResources) {
            if (tabResources.hasOwnProperty(tabResource)) {
               sortedNames.push(tabResource); // add a '.' to ensure dot notation sorts e.g x.y.z
            }
         }
         sortedNames.sort();
         
         for(var i = 0; i < sortedNames.length; i++) {
            var tabResource: string = sortedNames[i];
            var nextTab = tabResources[tabResource];
            
            nextTab.closable = sortedNames.length > 1; // if only one tab make sure it cannot be closed
            sortedTabs[i] = nextTab;
         }
         tabs.tabs = sortedTabs;
         tabs.active = editorData.resource.resourcePath;
         activateTab(editorData.resource.resourcePath, layout.name, false, true, ""); // browse style makes no difference here
         
         // this is pretty rubbish, it would be good if there was a promise after redraw/repaint
         setTimeout(function() { // wait for the paint to finish
            $('#editFileName').on('click', function(e) {
               clickOnTab(editorData.resource.resourcePath, toggleFullScreen);
               e.preventDefault();
            });  
         }, 100);
      }
   }
   
   function activateAnyEditorTab(resourcePathDeleted) {
      var layout = findActiveEditorLayout();
      var tabs = findActiveEditorTabLayout();
      
      if(tabs != null) {
         var tabList = tabs.tabs;
   
         for(var i = 0; i < tabList.length; i++) {
            var nextTab = tabList[i];
            
            if(nextTab != null && nextTab.id == resourcePathDeleted) {
               nextTab.id = 'editTab'; // make sure not to enable, bit of a hack
               nextTab.closable = true;
            }
         }
         for(var i = 0; i < tabList.length; i++) {
            var nextTab = tabList[i];
            
            if(nextTab != null && nextTab.id != 'editTab') {
               tabs.active = nextTab.id;
               tabs.closable = false;
               FileExplorer.openTreeFile(nextTab.id, function(){}); // browse style makes no difference here
               break;
            }
         }
      }
   }
   
   function hideEditorContent(containsEditor) { // hack to render editor
      if(containsEditor) {
         // move the editor
         var newParent = document.getElementById('editParentHidden');
         var oldParent = document.getElementById('editParent');
      
         if(oldParent != null && newParent != null){
            while (oldParent.childNodes.length > 0) {
                newParent.appendChild(oldParent.childNodes[0]);
            }
         }
      }
   }
   
   function createExploreLayout() {
   
      // $('#topLayer').spin({ lines: 10, length: 30, width: 20, radius: 40 });
   
      // -- LAYOUT
      var pstyle = 'background-color: ${PROJECT_BACKGROUND_COLOR}; overflow: hidden;';
         
      $('#mainLayout').w2layout({
         name : 'exploreMainLayout',
         padding : 0,
         panels : [ {
            type : 'top',
            size : '40px',
            resizable : false,
            style : pstyle
         }, {
            type : 'left',
            size : '20%',
            resizable : true,
            style : pstyle      
         },{
            type : 'right',
            size : '20%',
            resizable : true,
            hidden: true,
            style : pstyle
         },{
            type : 'main',
            size : '80%',
            resizable : true,
            style : pstyle
         } , {
            type : 'bottom',
            size : '25px',
            resizable : false,
            style : pstyle,
            content : createBottomStatusContent()
         } ]
      });
   
      $('').w2layout({
         name : 'exploreEditorLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '60%',
            resizable : true,
            overflow: 'auto',
            style : pstyle + 'border-bottom: 0px;'
         }, {
            type : 'bottom',
            size : '40%',
            overflow: 'auto',         
            resizable : true,
            style : pstyle + 'border-top: 0px;'
         } ]
      });
      
      $('').w2layout({
         name : 'exploreEditorTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'editTabs',
            tabs : {
               active : 'editTab',
               tabs : [ {
                  id : 'editTab',
                  caption : '<div class="helpTab" id="editFileName">Welcome</div>',
                  content : "<div style='overflow: scroll; font-family: monospace;' id='edit'><div id='editParent'></div></div>",
                  closable: false 
               } ],
               onClick : function(event) {
                  FileExplorer.openTreeFile(event.target, function(){
                     FileEditor.showEditorFileInTree();
                  });
               },
               onClose : function(event) {
                  activateAnyEditorTab(event.target);
               }
            }
         } ]
      });
   
      $('').w2layout({
         name : 'exploreLeftTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'tabs',
            tabs : {
               active : 'browseTab',
               right: '<div id="navigateToTreeArrow"></div>',
               tabs : [ {
                  id : 'browseTab',
                  caption : '<div class="browseTab">Project&nbsp;</div>',
                  content : "<div style='overflow: scroll; font-family: monospace;' id='browse'><div id='browseParent'><div id='explorer'></div></div></div>",
                  closable: false 
               } ],
               onClick : function(event) {
                  activateTab(event.target, "exploreLeftTabLayout", true, false, "style='right: 0px;'");
               }
            }
         } ]
      });
      
      $('').w2layout({
         name : 'exploreBottomTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'tabs',
            tabs : {
               active : 'consoleTab',
               tabs : [ {
                  id : 'consoleTab',
                  caption : '<div class="consoleTab">Console</div>',
                  closable: false
               }, {
                  id : 'problemsTab',
                  caption : '<div class="problemsTab">Problems</div>',
                  closable: false
               }, {
                  id : 'breakpointsTab',
                  caption : '<div class="breakpointsTab">Breakpoints</div>',
                  closable: false
               }, {
                  id : 'threadsTab',
                  caption : '<div class="threadTab">Threads</div>',
                  closable: false
               }, {
                  id : 'variablesTab',
                  caption : '<div class="variableTab">Variables</div>',
                  closable: false
               }, {
                  id : 'profilerTab',
                  caption : '<div class="profilerTab">Profiler</div>',
                  closable: false
               }, {
                  id : 'debugTab',
                  caption : '<div class="debugTab">Debug&nbsp;&nbsp;</div>',
                  closable: false
               }, {
                  id : 'historyTab',
                  caption : '<div class="historyTab">History&nbsp;&nbsp;</div>',
                  closable: false
               } ],
               onClose: function(event) {
                  console.log(event);
               },
               onClick : function(event) {
                  activateTab(event.target, "exploreBottomTabLayout", false, false, "style='right: 0px;'");
               }
            }
         } ]
      });
   
      createTopMenuBar(); // menu bar at top
      createProblemsTab();
      createVariablesTab();
      createProfilerTab();
      createBreakpointsTab();
      createDebugTab();
      createThreadsTab();
      createHistoryTab();
      
      w2ui['exploreMainLayout'].content('top', w2ui['topLayout']);
      w2ui['exploreMainLayout'].content('left', w2ui['exploreLeftTabLayout']);
      w2ui['exploreMainLayout'].content('main', w2ui['exploreEditorLayout']);
      w2ui['exploreEditorLayout'].content('main', w2ui['exploreEditorTabLayout']);
      w2ui['exploreEditorLayout'].content('bottom', w2ui['exploreBottomTabLayout']);
      w2ui['exploreEditorTabLayout'].refresh();
      w2ui['exploreBottomTabLayout'].refresh();
      w2ui['exploreLeftTabLayout'].refresh();
   }
   
   function startExploreLayout() {
      applyProjectTheme();
      activateTab("consoleTab", "exploreBottomTabLayout", false, false, "style='right: 0px;'"); 
      activateTab("browseTab", "exploreLeftTabLayout", true, false, "style='right: 0px;'"); 
      activateTab("editTab", "exploreEditorTabLayout", false, true, "style='right: 0px;'"); 
   }
   
   
   function createDebugLayout() {
   
      // $('#topLayer').spin({ lines: 10, length: 30, width: 20, radius: 40 });
   
      // -- LAYOUT
      var pstyle = 'background-color: ${PROJECT_BACKGROUND_COLOR}; overflow: hidden;';
      
      $('#mainLayout').w2layout({
         name : 'debugMainLayout',
         padding : 0,
         panels : [ {
            type : 'top',
            size : '40px',
            resizable : false,
            style : pstyle
         }, {
            type : 'main',
            size : '80%',
            resizable : true,
            style : pstyle
         } , {
            type : 'bottom',
            size : '25px',
            resizable : false,
            style : pstyle,
            content : createBottomStatusContent()
         } ]
      });
   
      $('').w2layout({
         name : 'debugEditorLayout',
         padding : 0,
         panels : [ {
            type : 'top',  
            size : '25%',
            overflow: 'auto',         
            resizable : true,
            style : pstyle + 'border-top: 0px;'
         }, {
            type : 'main',
            size : '50%',
            resizable : true,
            overflow: 'auto',
            style : pstyle + 'border-bottom: 0px;'      
         }, {
            type : 'bottom',
            size : '25%',
            overflow: 'auto',         
            resizable : true,
            style : pstyle + 'border-top: 0px;'
         } ]
      });
      
      $('').w2layout({
         name : 'debugEditorTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'editTabs',
            tabs : {
               active : 'editTab',
               tabs : [ {
                  id : 'editTab',
                  caption : '<div class="helpTab" id="editFileName">Welcome</div>',
                  content : "<div style='overflow: scroll; font-family: monospace;' id='edit'><div id='editParent'></div></div>",
                  closable: false 
               } ],
               onClick : function(event) {
                  FileExplorer.openTreeFile(event.target, function(){
                     FileEditor.showEditorFileInTree();
                  });
               },
               onClose : function(event) {
                  activateAnyEditorTab(event.target);
               }
            }
         } ]
      });
      
      $('').w2layout({
         name : 'debugTopTabSplit',
         padding : 0,
         panels : [ {
            type : 'left',  
            size : '50%',
            overflow: 'auto',         
            resizable : true,
            style : pstyle + 'border-top: 0px;'
         }, {
            type : 'main',
            size : '50%',
            resizable : true,
            overflow: 'auto',
            style : pstyle + 'border-bottom: 0px;'
         } ]
      });
   
      $('').w2layout({
         name : 'debugLeftTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'tabs',
            tabs : {
               active : 'debugTab',
               tabs : [ {
                  id : 'debugTab',
                  caption : '<div class="debugTab">Debug&nbsp;&nbsp;</div>',
                  closable: false
               }, {
                  id : 'threadsTab',
                  caption : '<div class="threadTab">Threads</div>',
                  closable: false
               },  {
                  id : 'browseTab',
                  caption : '<div class="browseTab">Project</div>',
                  content : "<div style='overflow: scroll; font-family: monospace;' id='browse'><div id='browseParent'></div></div>",
                  closable: false 
               } ],
               onClick : function(event) {
                  activateTab(event.target, "debugLeftTabLayout", true, false, "");
               }
            }
         } ]
      });
      
      $('').w2layout({
         name : 'debugRightTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'tabs',
            tabs : {
               active : 'variablesTab',
               tabs : [ {
                  id : 'variablesTab',
                  caption : '<div class="variableTab">Variables</div>',
                  closable: false
               }, {
                  id : 'breakpointsTab',
                  caption : '<div class="breakpointsTab">Breakpoints</div>',
                  closable: false
               } ],
               onClick : function(event) {
                  activateTab(event.target, "debugRightTabLayout", false, false, "");
               }
            }
         } ]
      });
      
      $('').w2layout({
         name : 'debugBottomTabLayout',
         padding : 0,
         panels : [ {
            type : 'main',
            size : '100%',
            style : pstyle + 'border-top: 0px;',
            resizable : false,
            name : 'tabs',
            tabs : {
               active : 'consoleTab',
               tabs : [ {
                  id : 'consoleTab',
                  caption : '<div class="consoleTab">Console</div>'
               }, {
                  id : 'problemsTab',
                  caption : '<div class="problemsTab">Problems</div>'
               }, {
                  id : 'profilerTab',
                  caption : '<div class="profilerTab">Profiler</div>'
               }, {
                  id : 'historyTab',
                  caption : '<div class="historyTab">History&nbsp;&nbsp;</div>',
                  closable: false
               } ],
               onClick : function(event) {
                  activateTab(event.target, "debugBottomTabLayout", false, false, "");
               }
            }
         } ]
      });
      
      createTopMenuBar(); // menu bar at top
      createProblemsTab();
      createVariablesTab();
      createProfilerTab();
      createBreakpointsTab();
      createDebugTab();
      createThreadsTab();
      createHistoryTab();
      
      w2ui['debugMainLayout'].content('top', w2ui['topLayout']);
      w2ui['debugMainLayout'].content('main', w2ui['debugEditorLayout']);
      w2ui['debugEditorLayout'].content('main', w2ui['debugEditorTabLayout']);
      w2ui['debugEditorLayout'].content('top', w2ui['debugTopTabSplit']);
      w2ui['debugTopTabSplit'].content('left', w2ui['debugLeftTabLayout']);
      w2ui['debugTopTabSplit'].content('main', w2ui['debugRightTabLayout']);
      w2ui['debugEditorLayout'].content('bottom', w2ui['debugBottomTabLayout']);  
      w2ui['debugEditorTabLayout'].refresh();
      w2ui['debugTopTabSplit'].refresh();
      w2ui['debugLeftTabLayout'].refresh();
      w2ui['debugRightTabLayout'].refresh();   
      w2ui['debugBottomTabLayout'].refresh();
   }
   
   function startDebugLayout() {
      applyProjectTheme();
      activateTab("debugTab", "debugLeftTabLayout", true, false, "");
      activateTab("variablesTab", "debugRightTabLayout", false, false, "");   
      activateTab("consoleTab", "debugBottomTabLayout", false, false, "");  
      activateTab("editTab", "debugEditorTabLayout", false, true, "");  
   }
   
   function createBottomStatusContent() {
      return "<div id='status'>"+
         "  <table width='100%' height='100%'>"+
         "  <tr>"+
         "    <td width='50%' align='left'><div id='process'></div></td>"+
         "    <td width='50%' align='right'><div id='currentFile'></div></td>"+
         "  </tr>"+
         "  </table>"+
         "</div>"
   }
   
   function createTopMenuBar(){
      var pstyle = 'background-color: ${PROJECT_MENU_COLOR}; overflow: hidden;';
      $('#topLayout').w2layout(
            {
               name : 'topLayout',
               padding : 0,
               panels : [
                  {
                     type : 'left',
                     size : '40%',
                     style : pstyle,
                     content : "<div class='toolbarTop'>"
                           + "<table border='0'>"
                           + "<tr id='toolbarRow'>"                         
                           + "   <td>"
                           + "      <table id='toolbarNormal'>"
                           + "      <tr>"
                           + "         <td><div id='newFile' title='New File&nbsp;&nbsp;&nbsp;Ctrl+N'></div></td>"                           
                           + "         <td><div id='saveFile' title='Save File&nbsp;&nbsp;&nbsp;Ctrl+S'></div></td>" 
                           + "         <td><div id='deleteFile' title='Delete File'></div></td>"   
                           + "         <td><div id='searchTypes' title='Search Types&nbsp;&nbsp;&nbsp;Ctrl+Shift+S'></div></td>"                             
                           + "         <td><div id='runScript' title='Run Script&nbsp;&nbsp;&nbsp;Ctrl+R'></div></td>" 
                           + "         <td><div id='debugScript' title='Debug Script&nbsp;&nbsp;&nbsp;Ctrl+B'></div></td>"                            
                           + "      </tr>"
                           + "      </table>"
                           + "   </td>" 
                           + "   <td><div class='toolbarSeparator'></div></td>"
                           + "   <td>"
                           + "      <table id='toolbarDebug'>"
                           + "      <tr>"
                           + "         <td><div id='stopScript' title='Stop Script'></div></td>" 
                           + "         <td><div id='resumeScript' title='Resume Script&nbsp;&nbsp;&nbsp;F8'></div></td>" 
                           + "         <td><div id='stepInScript' title='Step In&nbsp;&nbsp;&nbsp;F5'></div></td>" 
                           + "         <td><div id='stepOutScript' title='Step Out&nbsp;&nbsp;&nbsp;F7'></div></td>" 
                           + "         <td><div id='stepOverScript' title='Step Over&nbsp;&nbsp;&nbsp;F6'></div></td>" 
                           + "         <td><div id='evaluateExpression' title='Evaluate Expression&nbsp;&nbsp;&nbsp;Ctrl+Shift+E'></div></td>"                         
                           + "      </tr>"
                           + "      </table>"
                           + "   </td>"
                           + "</tr>"
                           + "</table>" 
                           + "</div>"
                  }, {
                     type : 'main',
                     size : '10%',
                     style : pstyle,
                     content : "<div class='toolbarTop'></div>"
                  }, {
                     type : 'right',
                     size : '50%',
                     style : pstyle,
                     content : "<div class='toolbarTop'>"+
                               "<table border='0' width='100%' cellpadding='0'>"+
                               "<tr>"+
                               "   <td  width='100%'></td>"+
                               "   <td><div id='toolbarNavigateBack' title='Navigate Back'></div></td>"+                                
                               "   <td><div id='toolbarNavigateForward' title='Navigate Forward'></div></td>"+     
                               "   <td>&nbsp;&nbsp;</td>"+   
                               "   <td>"+
                               "        <select class='styledSelect' id='editorTheme' size='1'>\n"+
                               "          <option value='chrome'>&nbsp;Chrome</option>\n"+
                               "          <option value='eclipse' selected='selected'>&nbsp;Eclipse</option>\n"+
                               "          <option value='github'>&nbsp;GitHub</option>\n"+
                               "          <option value='monokai'>&nbsp;Monokai</option>\n"+
                               "          <option value='terminal'>&nbsp;Terminal</option>\n"+
                               "          <option value='textmate'>&nbsp;TextMate</option>\n"+
                               "          <option value='twilight'>&nbsp;Twilight</option>\n"+
                               "          <option value='vibrant_ink'>&nbsp;Vibrant Ink</option>\n"+  
                               "          <option value='xcode'>&nbsp;XCode</option>\n"+                            
                               "        </select>\n"+
                               "   </td>"+  
                               "   <td>&nbsp;&nbsp;</td>"+                              
                               "   <td>"+
                               "        <select class='styledSelect' id='fontFamily' size='1'>\n"+
                               "          <option value='Consolas' selected='selected'>&nbsp;Consolas</option>\n"+
                               "          <option value='Lucida Console'>&nbsp;Lucida Console</option>\n"+
                               "          <option value='Courier New'>&nbsp;Courier New</option>\n"+       
                               "          <option value='Courier'>&nbsp;Courier</option>\n"+    
                               "          <option value='Menlo'>&nbsp;Menlo</option>\n"+                              
                               "          <option value='Monaco'>&nbsp;Monaco</option>\n"+   
                               "        </select>\n"+
                               "   </td>"+  
                               "   <td>&nbsp;&nbsp;</td>"+  
                               "   <td>"+
                               "        <select class='styledSelect' id='fontSize' size='1'>\n"+
                               "          <option value='10px'>&nbsp;10px</option>\n"+
                               "          <option value='11px'>&nbsp;11px</option>\n"+
                               "          <option value='12px'>&nbsp;12px</option>\n"+
                               "          <option value='13px'>&nbsp;13px</option>\n"+
                               "          <option value='14px' selected='selected'>&nbsp;14px</option>\n"+
                               "          <option value='16px'>&nbsp;16px</option>\n"+
                               "          <option value='18px'>&nbsp;18px</option>\n"+
                               "          <option value='20px'>&nbsp;20px</option>\n"+
                               "          <option value='24px'>&nbsp;24px</option>\n"+
                               "        </select>\n"+
                               "   </td>"+
                               "   <td>&nbsp;&nbsp;</td>"+  
                               "   <td><div id='toolbarResize' title='Full Screen&nbsp;&nbsp;&nbsp;Ctrl+M'></div></td>"+                               
                               "   <td><div id='toolbarSwitchLayout' title='Switch Layout&nbsp;&nbsp;&nbsp;Ctrl+L'></div></td>"+                                
                               "   <td><div id='toolbarSwitchProject' title='Switch Project&nbsp;&nbsp;&nbsp;Ctrl+P'></div></td>"+     
                               "   <td>&nbsp;&nbsp;</td>"+                                 
                               "</tr>"+
                               "</table>"+
                               "</div>"
                  } ]
            });
   }
   
   function createProblemsTab(){
      $().w2grid({
         name : 'problems',
         columns : [ {
            field : 'description',
            caption : 'Description',
            size : '45%',
            sortable : true,
            resizable : true
         },{
            field : 'location',
            caption : 'Location',
            size : '10%',
            sortable : true,
            resizable : true
         }, {
            field : 'resource',
            caption : 'Resource',
            size : '45%',
            sortable : true,
            resizable : true
         }],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  FileExplorer.openTreeFile(record.script, function() {
                     FileEditor.showEditorLine(record.line);  
                  });
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createHistoryTab(){
      $().w2grid({
         name : 'history',
         columns : [ {
            field : 'resource',
            caption : 'Resource',
            size : '50%',
            sortable : false,
            resizable : true
         },{
            field : 'date',
            caption : 'Date',
            size : '50%',
            sortable : true,
            resizable : true
         }],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  FileExplorer.openTreeHistoryFile(record.script, record.time, function() {
                     FileEditor.showEditorLine(record.line);  
                  });
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createVariablesTab(){
      $().w2grid({
         recordTitles: false, // show tooltips
         name : 'variables',
         columns : [ {
            field : 'name',
            caption : 'Name',
            size : '30%',
            sortable : false
         }, {
            field : 'value',
            caption : 'Value',
            size : '40%',
            sortable : false
         }, {
            field : 'type',
            caption : 'Type',
            size : '30%'
         } ],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  VariableManager.toggleExpandVariable(record.path);
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createProfilerTab(){
      $().w2grid({
         name : 'profiler',
         columns : [ {
            field : 'resource',
            caption : 'Resource',
            size : '40%',
            sortable : true
         }, {
            field : 'percentage',
            caption : 'Percentage',
            size : '15%',
            sortable : true            
         },{
            field : 'line',
            caption : 'Line',
            size : '15%'
         }, {
            field : 'count',
            caption : 'Count',
            size : '10%',
            sortable : true
         }, {
            field : 'duration',
            caption : 'Duration',
            size : '10%',
            sortable : true
         },{
            field : 'average',
            caption : 'Average',
            size : '10%',
            sortable : true
         }],
         sortData: [
           { field: 'percentage', direction: 'dsc' }
         ],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  FileExplorer.openTreeFile(record.script, function() {
                     FileEditor.showEditorLine(record.line);  
                  }); 
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createBreakpointsTab(){
      $().w2grid({
         name : 'breakpoints',
         columns : [ 
          {
            field : 'name',
            caption : 'Resource',
            size : '60%',
            sortable : true,
            resizable : true
         },{
            field : 'location',
            caption : 'Location',
            size : '40%',
            sortable : true,
            resizable : true
         } ],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  FileExplorer.openTreeFile(record.script, function() {
                     FileEditor.showEditorLine(record.line);  
                  }); 
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createThreadsTab(){
      $().w2grid({
         name : 'threads',
         columns : [ {
            field : 'name',
            caption : 'Thread',
            size : '25%',
            sortable : true,
            resizable : true
         }, {
            field : 'status',
            caption : 'Status',
            size : '10%',
            sortable : true,
            resizable : true
         }, {
            field : 'instruction',
            caption : 'Instruction',
            size : '15%',
            sortable : true,
            resizable : true
         },{
            field : 'resource',
            caption : 'Resource',
            size : '30%',
            sortable : true,
            resizable : true
         },{
            field : 'line',
            caption : 'Line',
            size : '10%',
            sortable : true,
            resizable : true
         },{
            field : 'active',
            caption : 'Active',
            size : '10%',
            sortable : false,
            resizable : true
         }],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  FileExplorer.openTreeFile(record.script, function(){
                     ThreadManager.updateThreadFocusByName(record.thread);
                     FileEditor.showEditorLine(record.line);  
                     ThreadManager.showThreads();
                  });
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function createDebugTab(){
      $().w2grid({
         name : 'debug',
         columns : [ 
          {
            field : 'name',
            caption : 'Process',
            size : '20%',
            sortable : true,
            resizable : true
         }, {
            field : 'system',
            caption : 'System',
            size : '20%',
            sortable : true,
            resizable : true
         }, {
            field : 'status',
            caption : 'Status',
            size : '20%',
            sortable : true,
            resizable : true
         },{
            field : 'resource',
            caption : 'Resource',
            size : '30%',
            sortable : true,
            resizable : true
         },{
            field : 'active',
            caption : 'Focus',
            size : '10%',
            sortable : false,
            resizable : true
         } ],
         onClick : function(event) {
            var grid = this;
            event.onComplete = function() {
               var sel = grid.getSelection();
               if (sel.length == 1) {
                  var record = grid.get(sel[0]);
                  
                  if(record.running) {
                     FileExplorer.openTreeFile(record.script, function() {
                        Command.attachProcess(record.process);
                     });
                  } else {
                     Command.attachProcess(record.process);
                  }
               }
               grid.selectNone();
               grid.refresh();
            }
         }
      });
   }
   
   function activateTab(tabName, layoutName, containsBrowse, containsEditor, browseStyle) {
      hideBrowseTreeContent(containsBrowse); // hide tree
      hideEditorContent(containsEditor); // hide tree
      
      if (tabName == 'consoleTab') {
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='console'></div>");
         w2ui[layoutName].refresh();
         ProcessConsole.showConsole();
      } else if (tabName == 'problemsTab') {
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='problems'></div>");
         w2ui[layoutName].refresh();
         $('#problems').w2render('problems');
         ProblemManager.showProblems();
      } else if (tabName == 'breakpointsTab') {
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='breakpoints'></div>");
         w2ui[layoutName].refresh();
         $('#breakpoints').w2render('breakpoints');
         FileEditor.showEditorBreakpoints();
      } else if(tabName == 'threadsTab'){
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='threads'></div>");
         w2ui[layoutName].refresh();
         $('#threads').w2render('threads');
         ThreadManager.showThreads();
      } else if(tabName == 'variablesTab'){
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='variables'></div>");
         w2ui[layoutName].refresh();
         $('#variables').w2render('variables');
         VariableManager.showVariables();
      } else if(tabName == 'profilerTab'){
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='profiler'></div>");
         w2ui[layoutName].refresh();
         $('#profiler').w2render('profiler');
         VariableManager.showVariables();
      } else if(tabName == 'browseTab'){
         w2ui[layoutName].content('main', "<div style='overflow: hidden; font-family: monospace;' id='browse'><div id='browseParent' "+browseStyle+"></div></div>");
         w2ui[layoutName].refresh();
         $('#browse').w2render('browse');
         showBrowseTreeContent(containsBrowse); // hack to move tree
      } else if(tabName == 'debugTab'){
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='debug'></div>");
         w2ui[layoutName].refresh();
         $('#debug').w2render('debug');
         DebugManager.showStatus();
      } else if(tabName == 'historyTab'){
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='history'></div>");
         w2ui[layoutName].refresh();
         $('#history').w2render('history');
         History.showFileHistory();
      } else { // editor is always the default as it contains file names
         w2ui[layoutName].content('main', "<div style='overflow: scroll; font-family: monospace;' id='edit'><div id='editParent'></div></div>");
         w2ui[layoutName].refresh();
         $('#edit').w2render('edit');
         showEditorContent(containsEditor);
      }
   }
}

//ModuleSystem.registerModule("project", "Project module: project.js", Project.createMainLayout, Project.startMainLayout, [ "common", "socket", "console", "problem", "editor", "spinner", "tree", "threads" ]);

