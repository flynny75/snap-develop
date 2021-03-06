package org.snapscript.studio.resource.project;

import java.io.File;

import org.simpleframework.http.Cookie;
import org.simpleframework.http.Path;
import org.simpleframework.http.Request;
import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.Session;
import org.simpleframework.http.socket.service.Service;
import org.snapscript.agent.log.ProcessLogger;
import org.snapscript.common.thread.ThreadPool;
import org.snapscript.studio.BackupManager;
import org.snapscript.studio.ConnectListener;
import org.snapscript.studio.ProcessManager;
import org.snapscript.studio.command.CommandController;
import org.snapscript.studio.command.CommandListener;
import org.snapscript.studio.configuration.ConfigurationClassLoader;
import org.snapscript.studio.resource.display.DisplayPersister;
import org.snapscript.studio.resource.tree.TreeContextManager;

public class ProjectScriptService implements Service {
   
   private final DisplayPersister displayPersister;
   private final TreeContextManager treeManager;
   private final ProjectProblemFinder problemFinder;
   private final ConnectListener connectListener;
   private final ProjectBuilder projectBuilder;
   private final ProcessManager processManager;
   private final ProcessLogger processLogger;
   private final BackupManager backupManager;
   private final String session;
   
   public ProjectScriptService(
         ProcessManager processManager, 
         ConnectListener connectListener, 
         ConfigurationClassLoader loader, 
         ProcessLogger processLogger, 
         ProjectBuilder projectBuilder, 
         BackupManager backupManager, 
         TreeContextManager treeManager, 
         DisplayPersister displayPersister,
         ThreadPool pool, 
         String session) 
   {
      this.problemFinder = new ProjectProblemFinder(projectBuilder, processLogger, pool);
      this.displayPersister = displayPersister;
      this.treeManager = treeManager;
      this.backupManager = backupManager;
      this.connectListener = connectListener;
      this.projectBuilder = projectBuilder;
      this.processLogger = processLogger;
      this.processManager = processManager;
      this.session = session;
   }  
  
   @Override
   public void connect(Session connection) {
      Request request = connection.getRequest();    
      Path path = request.getPath(); // /connect/<project-name>
      
      try {
         FrameChannel channel = connection.getChannel();
         Project project = projectBuilder.createProject(path);
         File projectPath = project.getProjectPath();
         String projectName = project.getProjectName();
         Cookie cookie = request.getCookie(session);
         String value = null;
         
         if(cookie != null) {
            value = cookie.getValue();
         }
         try {
            CommandListener commandListener = new CommandListener(
                  processManager, 
                  problemFinder, 
                  displayPersister,
                  channel, 
                  processLogger, 
                  backupManager, 
                  treeManager, 
                  path, 
                  projectPath, 
                  projectName, 
                  value);
            CommandController commandController = new CommandController(commandListener);

            channel.register(commandController);
            connectListener.connect(commandListener, path); // if there is a script then execute it
         } catch(Exception e) {
            processLogger.info("Could not connect " + path, e);
         }
      }catch(Exception e){
         processLogger.info("Error connecting " + path, e);
      }
      
   }
}