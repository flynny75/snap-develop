/*
 * Project.java December 2016
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

import org.snapscript.develop.Workspace;

public class Project {
   
   private final ProjectFileSystem fileSystem;
   private final Workspace workspace;
   private final String projectName;
   private final String projectDirectory;

   public Project(Workspace workspace, String projectDirectory, String projectName) {
      this.fileSystem = new ProjectFileSystem(this);
      this.projectDirectory = projectDirectory;
      this.projectName = projectName;
      this.workspace = workspace;
   }

   public ProjectFileSystem getFileSystem() {
      return fileSystem;
   }

   public File getSourcePath() {
      try {
         return workspace.create(projectName);
      } catch (Exception e) {
         throw new IllegalStateException("Could not get source path for '" + projectName + "'");
      }
   }

   public File getProjectPath() {
      try {
         return workspace.create(projectName);
      } catch (Exception e) {
         throw new IllegalStateException("Could not get project path for '" + projectName + "'");
      }
   }
   
   public String getProjectDirectory() {
      return projectDirectory;
   }

   public String getProjectName() {
      return projectName;
   }
}