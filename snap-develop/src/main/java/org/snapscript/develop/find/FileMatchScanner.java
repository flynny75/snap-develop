/*
 * FileMatchScanner.java December 2016
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

package org.snapscript.develop.find;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.simpleframework.http.Path;
import org.snapscript.develop.common.FilePatternMatcher;
import org.snapscript.develop.resource.project.Project;
import org.snapscript.develop.resource.project.ProjectBuilder;

public class FileMatchScanner {

   private final ProjectBuilder builder;
   
   public FileMatchScanner(ProjectBuilder builder) {
      this.builder = builder;
   }

   public List<FileMatch> findAllFiles(Path path, String expression) throws Exception {
      Project project = builder.createProject(path);
      String name = project.getProjectName();
      File directory = project.getProjectPath();
      String root = directory.getCanonicalPath();
      int length = root.length();
      
      if(root.endsWith("/")) {
         root = root.substring(0, length -1);
      }
      List<FileMatch> filesFound = new ArrayList<FileMatch>();
      PathBuilder builder = new PathBuilder(root);
      ExpressionResolver resolver = new ExpressionResolver(expression);
      FileExpressionFilter filter = new FileExpressionFilter(resolver, builder);
      
      List<File> list = FilePatternMatcher.scan(filter, directory);
      
      for(File file : list) {
         String resourcePath = builder.buildPath(file);
         String textMatch = resolver.match(resourcePath);
         
         if(textMatch != null) {
            MatchEvaluator evaluator = new MatchEvaluator(textMatch);
            String replaceText = evaluator.match(resourcePath);
            FileMatch projectFile = new FileMatch(name, resourcePath, file, replaceText);
            filesFound.add(projectFile);
         }
      }
      Collections.sort(filesFound);
      return filesFound;
   }
}
