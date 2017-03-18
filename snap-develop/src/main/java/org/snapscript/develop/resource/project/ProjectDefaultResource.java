/*
 * ProjectDefaultResource.java December 2016
 *
 * Copyright (C) 2016, Niall Gallagher <niallg@users.sf.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

package org.snapscript.develop.resource.project;

import java.io.File;
import java.io.PrintStream;
import java.util.List;

import org.simpleframework.http.Path;
import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.http.Status;
import org.snapscript.agent.log.ProcessLogger;
import org.snapscript.develop.common.FilePatternScanner;
import org.snapscript.develop.resource.Resource;

public class ProjectDefaultResource implements Resource {
   
   private static final String[] DEFAULT_PATHS = new String[]{
      "README.md", 
      "**/README.md", 
      "README.txt", 
      "**/README.txt", 
      "*.snap", 
      "**/*.snap", 
      "*.*", 
      "**/*.*", 
      "*", 
      "**/*"};
   
   private final ProjectBuilder builder;
   private final ProcessLogger logger;
   
   public ProjectDefaultResource(ProjectBuilder builder, ProcessLogger logger){
      this.builder = builder;
      this.logger = logger;
   }

   @Override
   public void handle(Request request, Response response) throws Throwable {
      Path path = request.getPath(); 
      Project project = builder.createProject(path);
      
      if(project == null) {
         throw new IllegalStateException("Could not find project: " + request);
      }
      File projectRoot = project.getProjectPath();
      String projectName = project.getProjectName();
      PrintStream stream = response.getPrintStream();
      String defaultFile = getDefaultFile(projectRoot, projectName);
      
      response.setStatus(Status.OK);
      response.setContentType("text/plain");
      
      logger.info("Default file: " + defaultFile);
      stream.print(defaultFile);
      stream.close();
   }
   
   private static String getDefaultFile(File projectRoot, String projectName) throws Exception {
      StringBuilder builder = new StringBuilder();
      
      for(String defaultPath : DEFAULT_PATHS) {
         List<File> files = FilePatternScanner.scan(defaultPath, projectRoot);
      
         if(!files.isEmpty()) {
            String file = files.get(0).getCanonicalPath();
            String root = projectRoot.getCanonicalPath();
            String resource = file.replace(root, "").replace(File.separatorChar,  '/');
            
            if(resource.startsWith("/")) {
               builder.append("/resource/");
               builder.append(projectName);
               builder.append(resource);
               return builder.toString();
            }
            builder.append("/resource/");
            builder.append(projectName);
            builder.append(resource);
            return builder.toString();
         }
      }
      builder.append("/resource/");
      builder.append(projectName);
      builder.append("/README.md");
      return builder.toString();
   }
}