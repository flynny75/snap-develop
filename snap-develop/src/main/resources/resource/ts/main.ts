require.config({
   paths : {
      'ace' : 'external/ace/ace',
      'ext-language_tools' : 'external/ace/ext-language_tools',
      'jquery' : 'external/jquery',
      'jquery-ui' : 'external/jquery-ui',
      'jquery-context-menu' : 'external/jquery-context-menu',
      'mousetrap' : 'external/mousetrap',
      'mousetrap-global-bind' : 'external/mousetrap-global-bind',
      'spin' : 'external/spin',
      'fancytree' : 'external/fancytree',
      'fancytree-dnd' : 'external/fancytree.dnd',
      'w2ui' : 'external/w2ui',
      'filesaver' : 'external/filesaver',
      'md5' : 'external/md5'
   },
   shim : {
      "w2ui" : {
         deps : [ 'jquery' ],
         exports : 'w2ui',
         init : function() {
            return {
               'w2ui' : w2ui,
               'w2obj' : w2obj,
               'w2utils' : w2utils,
               'w2popup' : w2popup,
               'w2confirm': w2confirm,
               'w2alert': w2alert
            };
         },
      },
      "spin" : {
         exports : '$'
      },
      "fancytree": {
         deps: ["jquery", "jquery-ui"]
      },
      "fancytree-dnd": {
         deps: ["fancytree"]         
      },
      "jquery-ui": {
         deps: ["jquery"]
      },
      "jquery-context-menu": {
         deps: ["jquery", "jquery-ui"]
      },
      "ace": {
         exports : 'ace',
         init : function() {
            return {
               'ace' : ace
            };
         },         
      },
      "ext-language_tools": {
         deps: ["ace"]
      },
      "mousetrap": {
         exports: 'Mousetrap',
         init : function() {
            return {
               'Mousetrap' : Mousetrap
            };
         },         
      },
      "mousetrap-global-bind": {
         deps: ["mousetrap"]
      }
   }
});

define(["require", 
        "exports", 
        "fancytree", 
        "fancytree-dnd", 
        "ace", 
        "ext-language_tools", 
        "mousetrap", 
        "mousetrap-global-bind", 
        "./socket", 
        "./spinner",
        "./project", 
        "./explorer", 
        "./editor", 
        "./history", 
        "./console", 
        "./threads",
        "./debug",
        "./profiler",
        "./alert",
        "./select"], 
        
   function (require, 
              exports, 
              fancytree, 
              fancytreeDnd, 
              ace, 
              aceLanguageTools, 
              mousetrap, 
              mousetrapBindGlobal, 
              socket, 
              spinner, 
              project, 
              explorer, 
              editor, 
              history, 
              console, 
              threads, 
              debug, 
              profiler, 
              alert,
              select) 
   {
      "use strict";
      var path = window.location.pathname;
      
      if(path == "/") {
         select.ProjectSelector.showProjectDialog();
      } else {
         spinner.LoadSpinner.create();
         socket.EventBus.startSocket();
         project.Project.createMainLayout();
         
         setTimeout(function() { // wait until the paint has finished
            alert.Alerts.registerAlerts();
            console.ProcessConsole.registerConsole();
            explorer.FileExplorer.showTree();
            editor.FileEditor.createEditor();
            project.Project.startMainLayout();
            history.History.trackHistory();
            threads.ThreadManager.createThreads();
            debug.DebugManager.createStatus();
            profiler.Profiler.startProfiler();
         }, 200);
      }
   }
);